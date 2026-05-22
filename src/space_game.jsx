import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const COLORS = [
  "#FF6B6B","#FFD93D","#6BCB77","#4ECDC4","#C77DFF",
  "#FF85A1","#FF6B35","#4FC3F7","#81C784","#FFB74D",
];
const STAR_COUNT = 80;
const METEOR_COUNT = 4;
const LETTER_SPEED_BASE = 0.6;
const GAME_DURATION = 60; // seconds

// ─── SOUND ENGINE (Web Audio API — zero external files) ──────────────────────
const AudioEngine = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function master(gain = 0.4) {
    const ac = getCtx();
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.connect(ac.destination);
    return g;
  }

  // Laser pew — short frequency sweep down
  function shoot() {
    if (muted) return;
    try {
      const ac = getCtx();
      const out = master(0.22);
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.12);
      gain.gain.setValueAtTime(0.6, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      osc.connect(gain); gain.connect(out);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.13);
    } catch {}
  }

  // Correct hit — happy ascending chime
  function hit(streakCount = 1) {
    if (muted) return;
    try {
      const ac = getCtx();
      const notes = streakCount >= 4
        ? [523, 659, 784, 1047]   // big streak chord burst
        : [523, 659, 784];         // regular correct
      notes.forEach((freq, i) => {
        const out = master(0.18);
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.07);
        gain.gain.setValueAtTime(0, ac.currentTime + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.5, ac.currentTime + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.07 + 0.25);
        osc.connect(gain); gain.connect(out);
        osc.start(ac.currentTime + i * 0.07);
        osc.stop(ac.currentTime + i * 0.07 + 0.26);
      });
    } catch {}
  }

  // Wrong letter — low buzzy thud
  function wrong() {
    if (muted) return;
    try {
      const ac = getCtx();
      const out = master(0.3);
      // Noise burst
      const bufSize = ac.sampleRate * 0.18;
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const noise = ac.createBufferSource();
      noise.buffer = buf;
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ac.currentTime);
      const nGain = ac.createGain();
      nGain.gain.setValueAtTime(0.8, ac.currentTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      noise.connect(filter); filter.connect(nGain); nGain.connect(out);
      noise.start(ac.currentTime);
      noise.stop(ac.currentTime + 0.18);
      // Low tone
      const osc = ac.createOscillator();
      const g2 = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(110, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.2);
      g2.gain.setValueAtTime(0.5, ac.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
      osc.connect(g2); g2.connect(out);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.21);
    } catch {}
  }

  // Life lost — dramatic descending wail
  function loseLife() {
    if (muted) return;
    try {
      const ac = getCtx();
      const out = master(0.35);
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.5);
      gain.gain.setValueAtTime(0.7, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
      osc.connect(gain); gain.connect(out);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.51);
    } catch {}
  }

  // Level up — triumphant fanfare
  function levelUp() {
    if (muted) return;
    try {
      const ac = getCtx();
      const melody = [
        { f: 523, t: 0 },
        { f: 659, t: 0.1 },
        { f: 784, t: 0.2 },
        { f: 1047, t: 0.3 },
        { f: 1047, t: 0.45 },
      ];
      melody.forEach(({ f, t }) => {
        const out = master(0.2);
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, ac.currentTime + t);
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(0.6, ac.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.18);
        osc.connect(g); g.connect(out);
        osc.start(ac.currentTime + t);
        osc.stop(ac.currentTime + t + 0.2);
      });
    } catch {}
  }

  // Game over — sad descending triad then silence
  function gameOver() {
    if (muted) return;
    try {
      const ac = getCtx();
      const notes = [
        { f: 392, t: 0 },
        { f: 330, t: 0.22 },
        { f: 262, t: 0.44 },
        { f: 196, t: 0.7 },
      ];
      notes.forEach(({ f, t }) => {
        const out = master(0.25);
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, ac.currentTime + t);
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(0.55, ac.currentTime + t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.28);
        osc.connect(g); g.connect(out);
        osc.start(ac.currentTime + t);
        osc.stop(ac.currentTime + t + 0.3);
      });
      // Final low rumble
      setTimeout(() => {
        const out = master(0.2);
        const bufSize = ac.sampleRate * 0.6;
        const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
        const noise = ac.createBufferSource();
        noise.buffer = buf;
        const filt = ac.createBiquadFilter();
        filt.type = "lowpass"; filt.frequency.value = 120;
        const ng = ac.createGain();
        ng.gain.setValueAtTime(0.6, ac.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
        noise.connect(filt); filt.connect(ng); ng.connect(out);
        noise.start(); noise.stop(ac.currentTime + 0.61);
      }, 900);
    } catch {}
  }

  // Streak bonus — sparkle arpeggio
  function streakBonus() {
    if (muted) return;
    try {
      const ac = getCtx();
      [784, 988, 1175, 1568].forEach((f, i) => {
        const out = master(0.14);
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ac.currentTime + i * 0.06);
        g.gain.setValueAtTime(0, ac.currentTime + i * 0.06);
        g.gain.linearRampToValueAtTime(0.5, ac.currentTime + i * 0.06 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.06 + 0.18);
        osc.connect(g); g.connect(out);
        osc.start(ac.currentTime + i * 0.06);
        osc.stop(ac.currentTime + i * 0.06 + 0.19);
      });
    } catch {}
  }

  // Countdown tick
  function tick(urgent = false) {
    if (muted) return;
    try {
      const ac = getCtx();
      const out = master(urgent ? 0.18 : 0.09);
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = urgent ? 880 : 660;
      g.gain.setValueAtTime(0.5, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
      osc.connect(g); g.connect(out);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.08);
    } catch {}
  }

  function setMuted(val) { muted = val; }
  function isMuted() { return muted; }

  return { shoot, hit, wrong, loseLife, levelUp, gameOver, streakBonus, tick, setMuted, isMuted };
})();

// ─── AI QUESTION GENERATOR ───────────────────────────────────────────────────
async function fetchAIQuestion(level, usedLetters) {
  const available = ALPHABET.filter(l => !usedLetters.includes(l));
  const target = available[Math.floor(Math.random() * available.length)] || ALPHABET[Math.floor(Math.random() * 26)];

  const prompts = {
    1: `Give me a fun question for a 4-6 year old child where the answer is the letter "${target}". 
        Question types: "Which letter does [animal/fruit/thing] start with?" or "What letter makes the [sound] sound?"
        Use simple, fun emojis. Keep it very short (max 12 words).`,
    2: `Give a medium difficulty question for a 6-8 year old where the answer letter is "${target}".
        Types: "Which letter comes after [letter]?", "What letter is in the word [word]?", or "[word] ends with which letter?"
        Keep it fun, 10-15 words max.`,
    3: `Give a harder question for an 8+ year old where the answer is "${target}".
        Types: word spelling, phonics patterns, or "Which letter is the Nth in the alphabet?"
        Keep under 15 words, make it exciting!`,
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a fun children's quiz master for a space-themed alphabet game called "Masti Pathshala". 
                 Always respond with ONLY a JSON object: {"question": "your question here", "answer": "${target}", "hint": "short hint"}
                 No markdown, no explanation, pure JSON only.`,
        messages: [{ role: "user", content: prompts[level] || prompts[1] }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { question: parsed.question, answer: parsed.answer || target, hint: parsed.hint || "" };
  } catch {
    // Fallback questions
    const fallbacks = {
      A:"🍎 Which letter does Apple start with?",
      B:"⚽ Ball starts with which letter?",
      C:"🐱 Cat starts with which letter?",
      D:"🐶 Dog begins with which letter?",
      E:"🐘 Elephant starts with which letter?",
      F:"🐟 Fish starts with which letter?",
      G:"🍇 Grapes! Which letter is that?",
      H:"🏠 House starts with which letter?",
      I:"🍦 Ice cream starts with which letter?",
      J:"🌴 Jungle starts with which letter?",
      K:"🪁 Kite starts with which letter?",
      L:"🦁 Lion starts with which letter?",
      M:"🌙 Moon starts with which letter?",
      N:"🪺 Nest starts with which letter?",
      O:"🍊 Orange starts with which letter?",
      P:"✏️ Pencil starts with which letter?",
      Q:"👑 Queen starts with which letter?",
      R:"🌈 Rainbow starts with which letter?",
      S:"☀️ Sun starts with which letter?",
      T:"🐯 Tiger starts with which letter?",
      U:"☂️ Umbrella starts with which letter?",
      V:"🎻 Violin starts with which letter?",
      W:"🐋 Whale starts with which letter?",
      X:"🎵 Xylophone starts with which letter?",
      Y:"🐃 Yak starts with which letter?",
      Z:"🦓 Zebra starts with which letter?",
    };
    return { question: fallbacks[target] || `Shoot the letter ${target}!`, answer: target, hint: `It's the letter ${target}` };
  }
}

// ─── CANVAS GAME ENGINE ───────────────────────────────────────────────────────
function SpaceGameCanvas({ question, answer, onHit, onMiss, isPaused, level, gameActive }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    letters: [], stars: [], meteors: [], bullets: [],
    ship: { x: 0, y: 0, w: 60, h: 50 },
    mouseX: 0, animFrame: null,
    particles: [],
  });
  const answerRef = useRef(answer);
  const onHitRef = useRef(onHit);
  const onMissRef = useRef(onMiss);
  const isPausedRef = useRef(isPaused);
  const gameActiveRef = useRef(gameActive);
  const levelRef = useRef(level);

  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { onHitRef.current = onHit; }, [onHit]);
  useEffect(() => { onMissRef.current = onMiss; }, [onMiss]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameActiveRef.current = gameActive; }, [gameActive]);
  useEffect(() => { levelRef.current = level; }, [level]);

  const spawnLetter = useCallback((canvas, targetLetter) => {
    const isTarget = Math.random() < 0.35;
    const letter = isTarget ? targetLetter : ALPHABET[Math.floor(Math.random() * 26)];
    const size = 44 + Math.random() * 20;
    return {
      id: Math.random(),
      letter,
      isTarget: letter === targetLetter,
      x: 60 + Math.random() * (canvas.width - 120),
      y: -60,
      vy: LETTER_SPEED_BASE + Math.random() * 0.8 + (levelRef.current - 1) * 0.4,
      vx: (Math.random() - 0.5) * 0.5,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 2,
      wobble: 0,
      opacity: 1,
      glowPulse: Math.random() * Math.PI * 2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = stateRef.current;

    // Init stars
    S.stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 2.5,
      speed: 0.2 + Math.random() * 0.8,
      opacity: 0.3 + Math.random() * 0.7,
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Init meteors
    S.meteors = Array.from({ length: METEOR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      speed: 1.5 + Math.random() * 2,
      length: 60 + Math.random() * 80,
      opacity: 0,
      active: false,
      timer: Math.random() * 200,
    }));

    S.ship.x = canvas.width / 2;
    S.ship.y = canvas.height - 80;

    // Spawn initial letters
    S.letters = Array.from({ length: 5 }, () => {
      const l = spawnLetter(canvas, answerRef.current);
      l.y = -60 - Math.random() * 400;
      return l;
    });

    let frameCount = 0;

    const render = () => {
      S.animFrame = requestAnimationFrame(render);
      if (!gameActiveRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Space background ──
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#0a0015");
      bg.addColorStop(0.5, "#050025");
      bg.addColorStop(1, "#000510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula clouds
      [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 180, c: "rgba(100,0,200,0.06)" },
        { x: canvas.width * 0.8, y: canvas.height * 0.6, r: 220, c: "rgba(0,100,200,0.05)" },
        { x: canvas.width * 0.5, y: canvas.height * 0.15, r: 150, c: "rgba(200,50,100,0.04)" },
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // ── Stars ──
      S.stars.forEach(star => {
        if (!isPausedRef.current) {
          star.y += star.speed * 0.3;
          star.twinkle += 0.04;
          if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        }
        const twinkleOp = star.opacity * (0.6 + 0.4 * Math.sin(star.twinkle));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkleOp})`;
        ctx.fill();
      });

      // ── Meteors ──
      S.meteors.forEach(m => {
        if (!isPausedRef.current) {
          m.timer--;
          if (m.timer <= 0 && !m.active) {
            m.active = true; m.x = Math.random() * canvas.width; m.y = -20; m.opacity = 1;
          }
          if (m.active) {
            m.x += m.speed * 2; m.y += m.speed;
            m.opacity -= 0.012;
            if (m.opacity <= 0) { m.active = false; m.timer = 150 + Math.random() * 200; }
          }
        }
        if (m.active) {
          ctx.save();
          ctx.globalAlpha = m.opacity;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#88aaff";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.length, m.y - m.length * 0.5);
          ctx.stroke();
          ctx.restore();
        }
      });

      // ── Bullets ──
      S.bullets = S.bullets.filter(b => b.y > -10);
      S.bullets.forEach(b => {
        if (!isPausedRef.current) b.y -= 14;
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 4, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        const bg2 = ctx.createLinearGradient(b.x, b.y - 12, b.x, b.y + 12);
        bg2.addColorStop(0, "rgba(255,255,255,0.9)");
        bg2.addColorStop(1, b.color);
        ctx.fillStyle = bg2;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 3, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Collision with letters
        S.letters.forEach(l => {
          if (l.opacity < 0.5) return;
          const dx = b.x - l.x, dy = b.y - l.y;
          if (Math.sqrt(dx * dx + dy * dy) < l.size / 2 + 8) {
            b.y = -100;
            if (l.isTarget) {
              l.opacity = 0;
              onHitRef.current(l.letter, l.x, l.y);
              for (let i = 0; i < 20; i++) {
                S.particles.push({
                  x: l.x, y: l.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: l.color, r: 3 + Math.random() * 5,
                  life: 1, letter: l.letter,
                });
              }
            } else {
              l.opacity = 0;
              onMissRef.current(l.letter);
              for (let i = 0; i < 10; i++) {
                S.particles.push({
                  x: l.x, y: l.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: "#ff4444", r: 3 + Math.random() * 4,
                  life: 1,
                });
              }
            }
          }
        });
      });

      // ── Letters ──
      if (!isPausedRef.current) {
        frameCount++;
        const spawnRate = Math.max(60, 90 - (levelRef.current - 1) * 15);
        if (frameCount % spawnRate === 0) {
          if (S.letters.filter(l => l.opacity > 0).length < 7) {
            S.letters.push(spawnLetter(canvas, answerRef.current));
          }
        }
      }

      S.letters = S.letters.filter(l => l.y < canvas.height + 80);
      S.letters.forEach(l => {
        if (!isPausedRef.current) {
          l.y += l.vy;
          l.x += l.vx;
          l.rotation += l.rotSpeed * 0.02;
          l.wobble += 0.03;
          l.glowPulse += 0.06;
          if (l.x < 40 || l.x > canvas.width - 40) l.vx *= -1;
          if (l.y > canvas.height + 50 && l.isTarget && l.opacity > 0.5) {
            l.opacity = 0;
          }
        }
        if (l.opacity <= 0) return;

        const glow = l.isTarget ? (0.6 + 0.4 * Math.sin(l.glowPulse)) * 30 : 10;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.globalAlpha = l.opacity;

        // Orb background
        const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, l.size / 2);
        if (l.isTarget) {
          orbGrad.addColorStop(0, "rgba(255,255,200,0.25)");
          orbGrad.addColorStop(0.6, l.color + "55");
          orbGrad.addColorStop(1, l.color + "22");
        } else {
          orbGrad.addColorStop(0, "rgba(100,100,200,0.15)");
          orbGrad.addColorStop(1, "rgba(50,50,150,0.05)");
        }
        ctx.shadowColor = l.color;
        ctx.shadowBlur = glow;
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, l.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = l.isTarget ? l.color : "rgba(150,150,255,0.4)";
        ctx.lineWidth = l.isTarget ? 2.5 : 1.5;
        ctx.stroke();

        // Pulse ring for target
        if (l.isTarget) {
          const ring = 0.5 + 0.5 * Math.sin(l.glowPulse);
          ctx.strokeStyle = l.color + Math.floor(ring * 180).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, l.size / 2 + 8 + ring * 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Letter text
        ctx.shadowBlur = 0;
        ctx.fillStyle = l.isTarget ? "#fff" : "rgba(200,210,255,0.85)";
        ctx.font = `bold ${l.size * 0.55}px 'Fredoka One', 'Comic Sans MS', cursive`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(l.letter, 0, 1);

        ctx.restore();
      });

      // ── Particles ──
      S.particles = S.particles.filter(p => p.life > 0);
      S.particles.forEach(p => {
        if (!isPausedRef.current) {
          p.x += p.vx; p.y += p.vy;
          p.vy += 0.15;
          p.life -= 0.025;
          p.r *= 0.97;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Ship ──
      const sx = isPausedRef.current ? S.ship.x : S.ship.x + (S.mouseX - S.ship.x) * 0.1;
      S.ship.x = sx;
      const sy = canvas.height - 80;

      ctx.save();
      ctx.translate(sx, sy);

      // Engine glow
      const engineFlicker = 0.7 + 0.3 * Math.sin(frameCount * 0.3);
      ctx.shadowColor = "#4FC3F7";
      ctx.shadowBlur = 20 * engineFlicker;
      const engineGrad = ctx.createRadialGradient(0, 28, 0, 0, 28, 22);
      engineGrad.addColorStop(0, `rgba(79,195,247,${0.9 * engineFlicker})`);
      engineGrad.addColorStop(1, "transparent");
      ctx.fillStyle = engineGrad;
      ctx.beginPath();
      ctx.ellipse(0, 32, 8, 20 * engineFlicker, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ship body
      ctx.shadowColor = "#C77DFF";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#1a1a4e";
      ctx.beginPath();
      ctx.moveTo(0, -28); ctx.lineTo(18, 20); ctx.lineTo(0, 12);
      ctx.lineTo(-18, 20); ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#C77DFF";
      ctx.beginPath();
      ctx.moveTo(0, -28); ctx.lineTo(9, 4); ctx.lineTo(-9, 4); ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#4FC3F7";
      ctx.beginPath();
      ctx.ellipse(0, -5, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings
      ctx.fillStyle = "#9C27B0";
      ctx.beginPath();
      ctx.moveTo(-9, 8); ctx.lineTo(-26, 22); ctx.lineTo(-12, 18); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(9, 8); ctx.lineTo(26, 22); ctx.lineTo(12, 18); ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Ground glow beneath ship
      const groundGlow = ctx.createRadialGradient(sx, canvas.height, 0, sx, canvas.height, 60);
      groundGlow.addColorStop(0, "rgba(79,195,247,0.15)");
      groundGlow.addColorStop(1, "transparent");
      ctx.fillStyle = groundGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    render();
    return () => { if (S.animFrame) cancelAnimationFrame(S.animFrame); };
  }, [spawnLetter]);

  // Mouse & touch tracking
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    stateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
  }, []);

  const handleTouch = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    stateRef.current.mouseX = (e.touches[0].clientX - rect.left) * scaleX;
  }, []);

  const shoot = useCallback(() => {
    if (isPausedRef.current || !gameActiveRef.current) return;
    const S = stateRef.current;
    S.bullets.push({ x: S.ship.x, y: S.ship.y - 50, color: "#C77DFF" });
    AudioEngine.shoot();
  }, []);

  // Sync answer change → refresh letters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const S = stateRef.current;
    S.letters = S.letters.map(l => ({
      ...l,
      isTarget: l.letter === answer,
    }));
  }, [answer]);

  return (
    <canvas
      ref={canvasRef}
     width={window.innerWidth}
     height={window.innerHeight}
      style={{ width: "100%", height: "100%", display: "block", cursor: "none" }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouch}
      onClick={shoot}
      onTouchEnd={(e) => { e.preventDefault(); shoot(); }}
    />
  );
}

// ─── MAIN GAME COMPONENT ─────────────────────────────────────────────────────
export default function SpaceGame({ onGameOver }) {
  const [gameState, setGameState] = useState("menu"); // menu | playing | paused | gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [question, setQuestion] = useState({ question: "Loading...", answer: "A", hint: "" });
  const [isLoadingQ, setIsLoadingQ] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hitFeedback, setHitFeedback] = useState(null); // { text, x, y, color }
  const [floatEmojis, setFloatEmojis] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem("mp_space_hs") || "0"));
  const [playerName, setPlayerName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const timerRef = useRef(null);
  const questionFetchRef = useRef(false);

  // Fetch new question
  const loadQuestion = useCallback(async (lvl, used) => {
    if (questionFetchRef.current) return;
    questionFetchRef.current = true;
    setIsLoadingQ(true);
    setShowHint(false);
    const q = await fetchAIQuestion(lvl, used);
    setQuestion(q);
    setIsLoadingQ(false);
    questionFetchRef.current = false;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    document.documentElement.requestFullscreen?.();
    setScore(0);
    setLives(3);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setMaxStreak(0);
    setUsedLetters([]);
    setQuestionsAnswered(0);
    setLevel(selectedLevel);
    setGameState("playing");
    loadQuestion(selectedLevel, []);
  }, [selectedLevel, loadQuestion]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          AudioEngine.gameOver();
          setGameState("gameover");
          return 0;
        }
        if (t <= 10) AudioEngine.tick(true);
        else if (t % 10 === 0) AudioEngine.tick(false);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Level progression
  useEffect(() => {
    if (gameState !== "playing") return;
    const newLevel = score >= 300 ? 3 : score >= 100 ? 2 : 1;
    if (newLevel > level) {
      setLevel(newLevel);
      AudioEngine.levelUp();
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }, [score, level, gameState]);

  // Game over → check high score
  useEffect(() => {
    if (gameState === "gameover") {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("mp_space_hs", score.toString());
      }
      if (onGameOver) {
        onGameOver(score);
      }
    }
  }, [gameState, score, highScore, onGameOver]);

  // Hit handler
  const handleHit = useCallback((letter, x, y) => {
    setStreak(s => {
      const ns = s + 1;
      setMaxStreak(ms => Math.max(ms, ns));
      if (ns >= 4) AudioEngine.streakBonus();
      else AudioEngine.hit(ns);
      return ns;
    });
    const bonus = streak >= 4 ? 30 : streak >= 2 ? 20 : 10;
    setScore(sc => sc + bonus);
    setHitFeedback({ text: `+${bonus} ✨`, x, y, color: "#FFD93D", id: Date.now() });
    setTimeout(() => setHitFeedback(null), 800);

    // Float emoji
    const newEmoji = { id: Date.now(), emoji: ["⭐", "🎉", "💥", "✨", "🚀"][Math.floor(Math.random() * 5)], x: Math.random() * 80 + 10 };
    setFloatEmojis(fe => [...fe.slice(-4), newEmoji]);

    // Next question
    setQuestionsAnswered(q => q + 1);
    setUsedLetters(ul => {
      const next = [...ul, letter].slice(-10);
      loadQuestion(level, next);
      return next;
    });
  }, [streak, level, loadQuestion]);

  // Miss handler
  const handleMiss = useCallback(() => {
    setStreak(0);
    AudioEngine.wrong();
    setLives(l => {
      const nl = l - 1;
      if (nl <= 0) { AudioEngine.gameOver(); setGameState("gameover"); }
      else AudioEngine.loseLife();
      return nl;
    });
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    AudioEngine.setMuted(next);
  }, [isMuted]);

  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 20 ? "#6BCB77" : timeLeft > 10 ? "#FFD93D" : "#FF6B6B";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0015 0%, #050025 50%, #000510 100%)",
      fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
      overflow: "auto",
      position: "relative",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes popIn { 0%{transform:scale(0) rotate(-15deg);opacity:0} 80%{transform:scale(1.1) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes floatUp { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes starTwinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes levelUp { 0%{transform:scale(0.5) translateY(20px);opacity:0} 50%{transform:scale(1.15) translateY(-5px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
        .glow-text {
          background: linear-gradient(90deg, #C77DFF, #4FC3F7, #FFD93D, #C77DFF);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .star-chip {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50px;
          padding: 6px 14px;
          color: white;
          font-size: 0.9rem;
          display: flex; align-items: center; gap: 6px;
          backdrop-filter: blur(8px);
        }
        .menu-btn {
          background: linear-gradient(135deg, #C77DFF, #7C4DFF);
          border: none; border-radius: 16px;
          padding: 16px 40px; font-size: 1.4rem;
          font-family: 'Fredoka One', cursive;
          color: white; cursor: pointer;
          box-shadow: 0 8px 32px rgba(199,125,255,0.5);
          transition: all 0.2s; letter-spacing: 0.5px;
        }
        .menu-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(199,125,255,0.7); }
        .menu-btn:active { transform: translateY(1px); }
        .level-btn {
          background: transparent; border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px; padding: 12px 20px; color: white;
          font-family: 'Fredoka One', cursive; font-size: 1rem;
          cursor: pointer; transition: all 0.2s; flex: 1;
        }
        .level-btn.active {
          background: rgba(199,125,255,0.3);
          border-color: #C77DFF;
          box-shadow: 0 0 20px rgba(199,125,255,0.4);
        }
        .level-btn:hover { border-color: #C77DFF; transform: translateY(-2px); }
        .hint-btn {
          background: rgba(255,215,61,0.15); border: 1.5px solid rgba(255,215,61,0.4);
          border-radius: 50px; padding: 5px 14px; color: #FFD93D;
          font-family: 'Fredoka One', cursive; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .hint-btn:hover { background: rgba(255,215,61,0.25); }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>

      {/* ── MENU ── */}
      {gameState === "menu" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "2rem", animation: "slideUp 0.6s ease"
        }}>
          {/* Title */}
          <div style={{ marginBottom: "0.5rem", fontSize: "3.5rem", animation: "float 3s ease-in-out infinite" }}>🚀</div>
          <h1 className="glow-text" style={{ fontSize: "clamp(2.2rem,6vw,4rem)", marginBottom: "0.3rem", textAlign: "center" }}>
            Space Alphabet
          </h1>
          <h2 style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "2rem", letterSpacing: "4px", textTransform: "uppercase" }}>
            ✨ AI-Powered Learning ✨
          </h2>

          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "420px",
            backdropFilter: "blur(20px)", marginBottom: "1.5rem",
          }}>
            {/* Player name */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>
                👨‍🚀 YOUR NAME
              </label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                  color: "white", fontFamily: "Fredoka One, cursive", fontSize: "1rem", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Level select */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>
                🎯 DIFFICULTY
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { l: 1, label: "🌟 Easy", sub: "Ages 4–6" },
                  { l: 2, label: "⚡ Medium", sub: "Ages 6–8" },
                  { l: 3, label: "🔥 Hard", sub: "Ages 8+" },
                ].map(({ l, label, sub }) => (
                  <button key={l} className={`level-btn ${selectedLevel === l ? "active" : ""}`}
                    onClick={() => setSelectedLevel(l)}>
                    <div>{label}</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6, fontFamily: "Nunito" }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* High score */}
            {highScore > 0 && (
              <div style={{ textAlign: "center", color: "#FFD93D", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                🏆 Best Score: <strong>{highScore}</strong>
              </div>
            )}

            <button className="menu-btn" onClick={startGame} style={{ width: "100%" }}>
              🚀 Launch Game!
            </button>
          </div>

          {/* How to play */}
          <div style={{ maxWidth: "420px", width: "100%", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textAlign: "center", fontFamily: "Nunito" }}>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <span>🖱️ Move mouse to steer</span>
              <span>🖱️ Click to shoot</span>
              <span>📱 Touch to play</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAYING ── */}
      {(gameState === "playing" || gameState === "paused") && (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", padding: "0.3rem" }}>

          {/* HUD */}
          <div style={{position:"relative", zIndex:5,display: "flex",alignItems: "center",gap: "10px",marginBottom: "10px",flexWrap: "wrap"}}>
            {/* Lives */}
            <div className="star-chip">
              {"❤️".repeat(lives)}{"🖤".repeat(Math.max(0, 3 - lives))}
            </div>

            {/* Score */}
            <div className="star-chip" style={{ flex: 1, justifyContent: "center" }}>
              <span style={{ color: "#FFD93D", fontSize: "1.1rem", fontWeight: 800 }}>⭐ {score}</span>
            </div>

            {/* Streak */}
            {streak >= 2 && (
              <div className="star-chip" style={{ background: "rgba(255,109,61,0.2)", borderColor: "rgba(255,109,61,0.4)", color: "#FF6B35" }}>
                🔥 {streak}x
              </div>
            )}

            {/* Timer */}
            <div className="star-chip" style={{ color: timerColor, fontWeight: 800, fontSize: "1rem" }}>
              ⏱ {timeLeft}s
            </div>

            {/* Level */}
            <div className="star-chip" style={{ color: "#C77DFF" }}>Lv.{level}</div>

            {/* Mute */}
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "white", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Pause */}
            <button
              onClick={() => setGameState(s => s === "playing" ? "paused" : "playing")}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "white", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {gameState === "paused" ? "▶️" : "⏸"}
            </button>
          </div>

          {/* Timer bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: "width 1s linear, background 0.5s" }} />
          </div>

          {/* Question box */}
          <div style={{
            zIndex: 5,
            background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: "18px", padding: "14px 18px", marginBottom: "10px",
            backdropFilter: "blur(12px)", position: "relative",
          }}>
            {isLoadingQ ? (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", animation: "pulse 1s infinite", textAlign: "center", fontFamily: "Nunito" }}>
                🤖 AI is thinking of a question...
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ color: "white", fontSize: "clamp(0.9rem,2.5vw,1.1rem)", fontFamily: "Nunito, sans-serif", fontWeight: 700, flex: 1 }}>
                  🎯 {question.question}
                </div>
                {question.hint && (
                  <button className="hint-btn" onClick={() => setShowHint(h => !h)}>
                    {showHint ? "Hide Hint" : "💡 Hint"}
                  </button>
                )}
              </div>
            )}
            {showHint && question.hint && (
              <div style={{ color: "#FFD93D", fontSize: "0.85rem", marginTop: "8px", fontFamily: "Nunito", opacity: 0.85 }}>
                💡 {question.hint}
              </div>
            )}
          </div>

          {/* Canvas */}
          <div style={{ position: "absolute", top:0, left:0, width: "100vw", height: "100vh", zIndex:0, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.08)" }}>
            <SpaceGameCanvas
              question={question.question}
              answer={question.answer}
              onHit={handleHit}
              onMiss={handleMiss}
              isPaused={gameState === "paused"}
              level={level}
              gameActive={gameState === "playing"}
            />

            {/* Hit feedback */}
            {hitFeedback && (
              <div style={{
                position: "absolute", left: "50%", top: "40%", transform: "translateX(-50%)",
                color: hitFeedback.color, fontSize: "1.8rem", fontWeight: 900,
                animation: "floatUp 0.8s ease forwards", pointerEvents: "none",
                textShadow: `0 0 20px ${hitFeedback.color}`,
              }}>
                {hitFeedback.text}
              </div>
            )}

            {/* Level up banner */}
            {showLevelUp && (
              <div style={{
                position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
                animation: "levelUp 0.5s ease", pointerEvents: "none",
                background: "rgba(199,125,255,0.95)", borderRadius: "16px", padding: "12px 28px",
                textAlign: "center", color: "white", fontSize: "1.5rem",
                boxShadow: "0 0 40px rgba(199,125,255,0.8)",
              }}>
                🚀 Level Up! 🚀
              </div>
            )}

            {/* Paused overlay */}
            {gameState === "paused" && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderRadius: "20px", backdropFilter: "blur(4px)",
              }}>
                <div style={{ color: "white", fontSize: "3rem", marginBottom: "1rem" }}>⏸️</div>
                <div style={{ color: "white", fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "Fredoka One" }}>Paused</div>
                <button className="menu-btn" onClick={() => setGameState("playing")} style={{ marginBottom: "1rem" }}>
                  ▶️ Resume
                </button>
                <button onClick={() => setGameState("menu")} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "12px", padding: "10px 24px", color: "rgba(255,255,255,0.7)", fontFamily: "Fredoka One", cursor: "pointer", fontSize: "1rem" }}>
                  🏠 Menu
                </button>
              </div>
            )}

            {/* Float emojis */}
            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
              {floatEmojis.slice(-3).map(fe => (
                <span key={fe.id} style={{ fontSize: "1.5rem", animation: "floatUp 1.5s ease forwards" }}>{fe.emoji}</span>
              ))}
            </div>
          </div>

          {/* Bottom info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", fontFamily: "Nunito" }}>
            <span>👆 Click / tap to shoot</span>
            <span>🏆 Best: {highScore}</span>
            <span>✅ {questionsAnswered} answered</span>
          </div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {gameState === "gameover" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "2rem", animation: "slideUp 0.6s ease",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "float 2s ease-in-out infinite" }}>
            {score > highScore - 1 && score > 0 ? "🏆" : score >= 100 ? "🚀" : "🌙"}
          </div>

          <h1 style={{ color: "white", fontSize: "2.5rem", marginBottom: "0.5rem", textAlign: "center" }}>
            {score > 200 ? "Incredible!" : score > 100 ? "Great Job!" : "Keep Going!"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito", marginBottom: "2rem" }}>
            {playerName ? `${playerName}, ` : ""}you did amazing! 🌟
          </p>

          <div style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "380px",
            backdropFilter: "blur(20px)", marginBottom: "1.5rem",
          }}>
            {[
              { label: "⭐ Final Score", value: score, color: "#FFD93D" },
              { label: "🏆 High Score", value: highScore, color: "#C77DFF" },
              { label: "🔥 Best Streak", value: `${maxStreak}x`, color: "#FF6B35" },
              { label: "✅ Questions", value: questionsAnswered, color: "#6BCB77" },
              { label: "❤️ Lives Left", value: lives, color: "#FF85A1" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Nunito", fontSize: "0.95rem" }}>{label}</span>
                <span style={{ color, fontWeight: 800, fontSize: "1.2rem" }}>{value}</span>
              </div>
            ))}
          </div>

          {score > 0 && score >= highScore && (
            <div style={{
              color: "#FFD93D", fontSize: "1rem", marginBottom: "1rem", fontFamily: "Nunito",
              animation: "pulse 1.5s infinite", textAlign: "center",
            }}>
              🎉 New High Score! Amazing! 🎉
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="menu-btn" onClick={startGame}>🔄 Play Again</button>
            <button
              onClick={() => setGameState("menu")}
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "16px", padding: "14px 28px", color: "white", fontFamily: "Fredoka One", fontSize: "1.1rem", cursor: "pointer" }}>
              🏠 Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}