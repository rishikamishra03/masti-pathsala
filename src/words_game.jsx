import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  LEVELS
// ═══════════════════════════════════════════════════════════════
const LEVELS = [
  { theme:"Animals",  words:["CAT","DOG","BIRD","FROG","BEAR"],        icons:["🐱","🐶","🐦","🐸","🐻"] },
  { theme:"Clothing", words:["SHIRT","SKIRT","PURSE","GLOVE","SCARF"], icons:["👕","👗","👜","🧤","🧣"] },
  { theme:"Food",     words:["CAKE","RICE","SOUP","BREAD","FRUIT"],    icons:["🎂","🍚","🍲","🍞","🍎"] },
  { theme:"Nature",   words:["TREE","RAIN","CLOUD","RIVER","STONE"],   icons:["🌳","🌧️","☁️","🌊","🪨"] },
];

// ═══════════════════════════════════════════════════════════════
//  SOUND ENGINE  (Web Audio API — zero external files needed)
// ═══════════════════════════════════════════════════════════════
class SoundEngine {
  constructor() {
    this.ctx        = null;
    this.bgGain     = null;
    this.muted      = false;
    this._bgRunning = false;
    this._bgTimer   = null;
  }

  _getCtx() {
    if (!this.ctx) {
      this.ctx    = new (window.AudioContext || window.webkitAudioContext)();
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.value = 0.15;
      this.bgGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  _beep(freq, type, vol, dur, at) {
    const ctx = this._getCtx();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type            = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  tap() {
    if (this.muted) return;
    const ctx = this._getCtx();
    this._beep(700, "sine", 0.22, 0.06, ctx.currentTime);
  }

  correct() {
    if (this.muted) return;
    const ctx = this._getCtx();
    const t   = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this._beep(f, "sine", 0.38, 0.20, t + i * 0.1)
    );
  }

  wrong() {
    if (this.muted) return;
    const ctx = this._getCtx();
    const t   = ctx.currentTime;
    this._beep(220, "sawtooth", 0.28, 0.14, t);
    this._beep(180, "sawtooth", 0.28, 0.14, t + 0.1);
  }

  fanfare() {
    if (this.muted) return;
    const ctx = this._getCtx();
    const t   = ctx.currentTime;
    [523,659,784,1047,784,1047,1319].forEach((f,i) =>
      this._beep(f, "sine", 0.4, 0.22, t + i * 0.13)
    );
    [392,494,587,784].forEach((f,i) =>
      this._beep(f, "triangle", 0.18, 0.22, t + i * 0.13)
    );
  }

  startBg() {
    if (this.muted || this._bgRunning) return;
    this._bgRunning = true;
    const notes   = [261.63,293.66,329.63,392.0,440.0,523.25,587.33,659.25];
    const pattern = [0,2,4,5,7,5,4,2, 1,3,5,6,7,6,5,3];
    let   step    = 0;
    const interval = (60 / 120) * 500; // 8th-note at 120 bpm

    const tick = () => {
      if (!this._bgRunning || this.muted) return;
      const ctx  = this._getCtx();
      const freq = notes[pattern[step % pattern.length]];
      const t    = ctx.currentTime;
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
      osc.type            = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      osc.connect(g);
      g.connect(this.bgGain);
      osc.start(t);
      osc.stop(t + 0.28);
      step++;
      this._bgTimer = setTimeout(tick, interval);
    };
    tick();
  }

  stopBg() {
    this._bgRunning = false;
    clearTimeout(this._bgTimer);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBg();
      if (this.bgGain) this.bgGain.gain.value = 0;
    } else {
      if (this.bgGain) this.bgGain.gain.value = 0.15;
      this.startBg();
    }
    return this.muted;
  }
}

const sfx = new SoundEngine();

// ═══════════════════════════════════════════════════════════════
//  GRID BUILDER — GUARANTEED placement of every word

const ROWS    = 8;
const COLS    = 8;
const FILLERS = "AEIOURSTLNMKBDGPWCFHVQYZXJ";
const DIRS    = [[0,1],[1,0],[0,-1],[-1,0]];

function tryPlace(grid, word, r, c, dr, dc) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    const nr = r + dr * i;
    const nc = c + dc * i;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return null;
    if (grid[nr][nc] !== null && grid[nr][nc] !== word[i])  return null;
    cells.push({ r: nr, c: nc });
  }
  return cells;
}

function buildGrid(words) {
  // Longest words first — harder to place → place first
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const grid   = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const placements = {};

  for (const word of sorted) {
    let placed = false;

    // Phase 1 — random
    for (let i = 0; i < 300 && !placed; i++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r  = Math.floor(Math.random() * ROWS);
      const c  = Math.floor(Math.random() * COLS);
      const cells = tryPlace(grid, word, r, c, dr, dc);
      if (cells) {
        cells.forEach((cell, k) => { grid[cell.r][cell.c] = word[k]; });
        placements[word] = cells;
        placed = true;
      }
    }

    // Phase 2 — exhaustive (always succeeds for ≤5-letter words in 8×8)
    if (!placed) {
      outer:
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          for (const [dr, dc] of DIRS) {
            const cells = tryPlace(grid, word, r, c, dr, dc);
            if (cells) {
              cells.forEach((cell, k) => { grid[cell.r][cell.c] = word[k]; });
              placements[word] = cells;
              placed = true;
              break outer;
            }
          }
        }
      }
    }

    // Phase 3 — last resort (should never be reached)
    if (!placed) {
      const row = sorted.indexOf(word) % ROWS;
      for (let c = 0; c + word.length <= COLS; c++) {
        const cells = word.split("").map((_, k) => ({ r: row, c: c + k }));
        cells.forEach((cell, k) => { grid[cell.r][cell.c] = word[k]; });
        placements[word] = cells;
        placed = true;
        break;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === null)
        grid[r][c] = FILLERS[Math.floor(Math.random() * FILLERS.length)];

  // Verify — every word must be recoverable from the grid
  for (const word of words) {
    const p = placements[word];
    if (!p) { console.error("[WordGame] PLACEMENT MISSING:", word); continue; }
    const recovered = p.map(({ r, c }) => grid[r][c]).join("");
    if (recovered !== word)
      console.error("[WordGame] MISMATCH:", word, "→", recovered);
  }

  return { grid, placements };
}

// Cell-set key for order-independent comparison
function cellSetKey(cells) {
  return [...cells].map(({ r, c }) => `${r}-${c}`).sort().join(",");
}

function getFirstLetterCells(placements) {
  return new Set(Object.values(placements).map(cells => `${cells[0].r}-${cells[0].c}`));
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function WordsGame({ onGameOver }) {
  const [screen,         setScreen]         = useState("intro");
  const [levelIdx,       setLevelIdx]       = useState(0);
  const [gridData,       setGridData]       = useState(null);
  const [firstLetters,   setFirstLetters]   = useState(new Set());
  const [foundWords,     setFoundWords]     = useState(new Set());
  const [selecting,      setSelecting]      = useState(false);
  const [selected,       setSelected]       = useState([]);
  const [currentWord,    setCurrentWord]    = useState("");
  const [flash,          setFlash]          = useState(null);
  const [activeCard,     setActiveCard]     = useState(null);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiHint,         setAiHint]         = useState("");
  const [showHint,       setShowHint]       = useState(false);
  const [particles,      setParticles]      = useState([]);
  const [score,          setScore]          = useState(0);
  const [showWordBanner, setShowWordBanner] = useState(null);
  const [muted,          setMuted]          = useState(false);

  // Use refs for values needed inside callbacks without stale closure issues
  const selectingRef   = useRef(false);
  const selectedRef    = useRef([]);
  const currentWordRef = useRef("");
  const gridDataRef    = useRef(null);
  const foundWordsRef  = useRef(new Set());
  const levelIdxRef    = useRef(0);

  const level = LEVELS[levelIdx % LEVELS.length];

  useEffect(() => {
  return () => {
    sfx.stopBg();   // 🔥 STOP game music when component unmounts
  };
}, []);

  // Keep refs in sync
  useEffect(() => { selectingRef.current   = selecting;   }, [selecting]);
  useEffect(() => { selectedRef.current    = selected;    }, [selected]);
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);
  useEffect(() => { gridDataRef.current    = gridData;    }, [gridData]);
  useEffect(() => { foundWordsRef.current  = foundWords;  }, [foundWords]);
  useEffect(() => { levelIdxRef.current    = levelIdx;    }, [levelIdx]);

  // ── Start level ─────────────────────────────────────────────
  const startLevel = useCallback((idx) => {
    const l = LEVELS[idx % LEVELS.length];
    const { grid, placements } = buildGrid(l.words);
    gridDataRef.current  = { grid, placements };
    foundWordsRef.current = new Set();
    setGridData({ grid, placements });
    setFirstLetters(getFirstLetterCells(placements));
    setFoundWords(new Set());
    setSelected([]);  selectedRef.current    = [];
    setCurrentWord(""); currentWordRef.current = "";
    setFlash(null);
    setActiveCard(null);
    setAiHint("");
    setShowHint(false);
    setScreen("game");
    setTimeout(() => sfx.startBg(), 120);
  }, []);

  useEffect(() => {
    if (screen === "game" && !gridData) startLevel(levelIdx);
  }, [screen, gridData, levelIdx, startLevel]);

  // ── Cell helpers ────────────────────────────────────────────
  const isSel = (r, c) => selectedRef.current.some(s => s.r===r && s.c===c);
  const isAdj = (a, b) => Math.abs(a.r-b.r)<=1 && Math.abs(a.c-b.c)<=1;

  // ── checkWord uses REFS — never stale ───────────────────────
  const checkWord = useCallback(() => {
    const word = currentWordRef.current;
    const sel  = selectedRef.current;
    const gd   = gridDataRef.current;
    const fw   = foundWordsRef.current;
    if (!word || sel.length < 2 || !gd) return;

    const selKey = cellSetKey(sel);
    const curLevel = LEVELS[levelIdxRef.current % LEVELS.length];

    let matched = null;
    for (const w of curLevel.words) {
      if (fw.has(w) || w !== word) continue;
      if (cellSetKey(gd.placements[w]) === selKey) { matched = w; break; }
    }

    if (matched) {
      sfx.correct();
      const newFound = new Set([...fw, matched]);
      foundWordsRef.current = newFound;
      setFoundWords(newFound);
      setFlash("correct");
      setShowWordBanner(matched);
      setScore(s => {
        const newScore = s + matched.length * 10;
        if (newFound.size === curLevel.words.length) {
          if (onGameOver) onGameOver(newScore);
        }
        return newScore;
      });
      spawnParticles();
      setTimeout(() => {
        setFlash(null);
        setShowWordBanner(null);
        setActiveCard(matched);
        setTimeout(() => setActiveCard(null), 800);
      }, 800);
      if (newFound.size === curLevel.words.length) {
        sfx.fanfare();
        setTimeout(() => setScreen("win"), 1400);
      }
    } else if (word.length >= 2) {
      sfx.wrong();
      setFlash("wrong");
      setTimeout(() => setFlash(null), 380);
    }

    setSelected([]);  selectedRef.current    = [];
    setCurrentWord(""); currentWordRef.current = "";
  }, []);

  // ── Pointer down ────────────────────────────────────────────
  const onCellStart = useCallback((r, c) => {
    const gd = gridDataRef.current;
    if (!gd) return;
    sfx.tap();
    selectingRef.current = true;
    setSelecting(true);
    const newSel  = [{ r, c }];
    const newWord = gd.grid[r][c];
    selectedRef.current    = newSel;
    currentWordRef.current = newWord;
    setSelected(newSel);
    setCurrentWord(newWord);
  }, []);

  // ── Pointer enter ───────────────────────────────────────────
  const onCellEnter = useCallback((r, c) => {
    if (!selectingRef.current) return;
    const gd  = gridDataRef.current;
    const sel = selectedRef.current;
    if (!gd || !sel.length) return;
    const last = sel[sel.length - 1];
    if (last.r === r && last.c === c) return;

    // Backtrack
    if (sel.length >= 2) {
      const prev = sel[sel.length - 2];
      if (prev.r === r && prev.c === c) {
        const newSel  = sel.slice(0, -1);
        const newWord = newSel.map(s => gd.grid[s.r][s.c]).join("");
        selectedRef.current    = newSel;
        currentWordRef.current = newWord;
        setSelected([...newSel]);
        setCurrentWord(newWord);
        return;
      }
    }
    if (isAdj(last, { r, c }) && !isSel(r, c)) {
      sfx.tap();
      const newSel  = [...sel, { r, c }];
      const newWord = currentWordRef.current + gd.grid[r][c];
      selectedRef.current    = newSel;
      currentWordRef.current = newWord;
      setSelected(newSel);
      setCurrentWord(newWord);
    }
  }, []);

  // ── Pointer up ──────────────────────────────────────────────
  const onCellEnd = useCallback(() => {
    if (!selectingRef.current) return;
    selectingRef.current = false;
    setSelecting(false);
    checkWord();
  }, [checkWord]);

  // ── Touch events ────────────────────────────────────────────
  const onTouchStart = useCallback((r, c, e) => {
    e.preventDefault();
    onCellStart(r, c);
  }, [onCellStart]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    const t  = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (el?.dataset?.r !== undefined && el?.dataset?.c !== undefined)
      onCellEnter(+el.dataset.r, +el.dataset.c);
  }, [onCellEnter]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    onCellEnd();
  }, [onCellEnd]);

  // ── Particles ───────────────────────────────────────────────
  const spawnParticles = () => {
    const colors = ["#FFD93D","#FF6B35","#6BCB77","#C77DFF","#FF85A1","#4ECDC4"];
    setParticles(Array.from({length:20}, (_,i) => ({
      id: Date.now()+i,
      color: colors[i%colors.length],
      dx: (Math.random()-0.5)*160,
      dy: (Math.random()-0.5)*160,
    })));
    setTimeout(() => setParticles([]), 1200);
  };

  // ── AI Hint ─────────────────────────────────────────────────
  const getAiHint = async () => {
    sfx.tap();
    setAiLoading(true);
    setShowHint(true);
    const remaining = level.words.filter(w => !foundWords.has(w));
    if (!remaining.length) {
      setAiHint("🎉 You found all the words! You're amazing!");
      setAiLoading(false);
      return;
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`You are a fun children's word game assistant for "Masti Pathshala".
Theme: "${level.theme}". Words still to find: ${remaining.join(", ")}.
Give ONE short playful hint (1-2 sentences, kid-friendly, age 5-8) for the word "${remaining[0]}" WITHOUT saying the word itself. Use emojis! Be encouraging!
Return ONLY the hint text, nothing else.`,
          }],
        }),
      });
      const data = await res.json();
      setAiHint(data.content?.[0]?.text || "Look for the bright green letters — they start each word! 🟢✨");
    } catch {
      setAiHint("Look for the bright green letters — they start each word! 🟢✨");
    }
    setAiLoading(false);
  };

  // ── Toggle mute ─────────────────────────────────────────────
  const toggleMute = () => setMuted(sfx.toggleMute());

  // ── Render a single cell ─────────────────────────────────────
  const renderCell = (r, c) => {
    if (!gridData) return null;
    const letter   = gridData.grid[r][c];
    const key      = `${r}-${c}`;
    const sel      = selected.some(s => s.r===r && s.c===c);
    const isFirst  = firstLetters.has(key);
    let   isSolved = false;
    for (const fw of foundWords) {
      if (gridData.placements[fw].some(p => p.r===r && p.c===c)) { isSolved=true; break; }
    }

    return (
      <div
        key={key}
        data-r={r} data-c={c}
        onMouseDown={() => onCellStart(r, c)}
        onMouseEnter={() => onCellEnter(r, c)}
        onMouseUp={onCellEnd}
        onTouchStart={e => onTouchStart(r, c, e)}
        style={{
          width:  "clamp(36px,7vw,60px)",
          height: "clamp(42px,8vw,68px)",
          borderRadius:"50%",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Fredoka One',cursive",
          fontSize:"clamp(0.85rem,2vw,1.28rem)",
          cursor:"pointer", userSelect:"none",
          transition:"all .12s cubic-bezier(.175,.885,.32,1.275)",
          transform: sel ? "scale(1.22)" : "scale(1)",
          background: sel
            ? "linear-gradient(135deg,#FFD93D,#FF6B35)"
            : isSolved
            ? "linear-gradient(135deg,#6BCB77,#3a9e4a)"
            : isFirst
            ? "linear-gradient(135deg,#4CAF50,#2e7d32)"
            : "linear-gradient(135deg,#4ECDC4,#2ba89f)",
          color:"white",
          boxShadow: sel
            ? "0 6px 18px rgba(255,107,53,.5),0 3px 0 rgba(0,0,0,.18)"
            : isSolved
            ? "0 4px 12px rgba(76,175,80,.35),0 3px 0 rgba(0,0,0,.14)"
            : isFirst
            ? "0 4px 14px rgba(76,175,80,.45),0 3px 0 #1b5e20"
            : "0 4px 10px rgba(78,205,196,.28),0 3px 0 rgba(0,0,0,.14)",
          border: sel
            ? "2.5px solid rgba(255,255,255,.88)"
            : "2.5px solid rgba(255,255,255,.28)",
          position:"relative", zIndex: sel ? 10 : 1,
          WebkitTapHighlightColor:"transparent",
          fontWeight:"900",
        }}
      >
        {letter}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  //  SCREENS
  // ════════════════════════════════════════════════════════════

  // ── INTRO ─────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div style={S.fullscreen}>
        <CloudBg />
        <div style={S.introCard}>
          <div style={{fontSize:"clamp(2.8rem,9vw,5rem)",marginBottom:"0.2rem"}}>🔤</div>
          <h1 style={S.introTitle}>Word Hunt!</h1>
          <p style={S.introSub}>Drag through letters on the grid to spell hidden words!</p>
          <div style={{display:"flex",gap:"0.6rem",justifyContent:"center",margin:"1rem 0",flexWrap:"wrap"}}>
            {["🐱 Animals","👕 Clothing","🍎 Food","🌳 Nature"].map(t=>(
              <div key={t} style={S.themeChip}>{t}</div>
            ))}
          </div>
          <button style={S.startBtn}
            onClick={()=>{setLevelIdx(0);setGridData(null);setScore(0);startLevel(0);}}>
            🚀 Start Playing!
          </button>
          <p style={{marginTop:"0.9rem",fontSize:"0.78rem",color:"#888",fontFamily:"'Nunito',sans-serif"}}>
            🔊 Sound & music included — turn up your volume!
          </p>
        </div>
      </div>
    );
  }

  // ── WIN ───────────────────────────────────────────────────
  if (screen === "win") {
    return (
      <div style={S.fullscreen}>
        <CloudBg />
        <WinParticles />
        <div style={{...S.introCard,maxWidth:460}}>
          <div style={{fontSize:"4rem"}}>🏆</div>
          <h1 style={{...S.introTitle,color:"#FF6B35"}}>Level Complete!</h1>
          <p style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.1rem",color:"#555",margin:"0.3rem 0 0.9rem"}}>
            All {level.words.length} words found! Score: <span style={{color:"#FF6B35"}}>+{score}</span> ⭐
          </p>
          <div style={{display:"flex",gap:"0.45rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"1rem"}}>
            {level.words.map((w,i)=>(
              <div key={w} style={{...S.themeChip,background:"#6BCB77",color:"white",border:"3px solid #1a1a2e"}}>
                {level.icons[i]} {w}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:"0.7rem",flexWrap:"wrap",justifyContent:"center"}}>
            {levelIdx < LEVELS.length-1 && (
              <button style={{...S.startBtn,background:"#6BCB77"}}
                onClick={()=>{const n=levelIdx+1;setLevelIdx(n);setGridData(null);setScore(0);startLevel(n);}}>
                Next Level ➡️
              </button>
            )}
            <button style={{...S.startBtn,background:"#C77DFF"}}
              onClick={()=>{sfx.stopBg();setLevelIdx(0);setGridData(null);setScore(0);setScreen("intro");}}>
              🏠 Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME ──────────────────────────────────────────────────
  return (
    <div style={S.fullscreen}
      onMouseUp={onCellEnd}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CloudBg />

      {/* Burst particles */}
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"fixed",top:"50%",left:"50%",
          width:10,height:10,borderRadius:"50%",background:p.color,
          pointerEvents:"none",zIndex:9999,
          "--dx":`${p.dx}px`,"--dy":`${p.dy}px`,
          animation:"pflyOut 1s ease-out forwards",
        }}/>
      ))}

      {/* ── TOP BAR ──────────────────────────────────────── */}
      <div style={S.topBar}>
        <button style={S.closeBtn}
          onClick={()=>{sfx.stopBg();setScreen("intro");}}>✕</button>

        <div style={S.pictureRow}>
          {level.words.map((word,i)=>{
            const found  = foundWords.has(word);
            const active = activeCard===word;
            return (
              <div key={word} style={{
                ...S.pictureCard,
                border: active?"3px solid #FFD93D":found?"3px solid #6BCB77":"3px solid rgba(255,255,255,.6)",
                transform: active?"scale(1.2)":"scale(1)",
                background: found?"rgba(107,203,119,.25)":"rgba(255,255,255,.88)",
              }}>
                <span style={{fontSize:"clamp(1rem,3.6vw,1.8rem)"}}>{level.icons[i]}</span>
                {found&&<div style={S.checkBadge}>✅</div>}
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center"}}>
          <button style={S.helpBtn} onClick={getAiHint} title="AI Hint">💡</button>
          <button style={{...S.helpBtn,fontSize:"1rem"}} onClick={toggleMute}>
            {muted?"🔇":"🔊"}
          </button>
        </div>
      </div>

      {/* ── Score & Level labels ─────────────────────────── */}
      <div style={S.scoreChip}>⭐ {score}</div>
      <div style={S.levelChip}>📚 {level.theme}</div>

      {/* ── Current word preview ─────────────────────────── */}
      {currentWord&&(
        <div style={S.currentWordBanner}>
          <span style={{
            fontFamily:"'Fredoka One',cursive",fontSize:"1.6rem",letterSpacing:4,
            color:flash==="correct"?"#6BCB77":flash==="wrong"?"#FF6B35":"#1a1a2e",
          }}>{currentWord}</span>
        </div>
      )}

      {/* ── Found word banner ─────────────────────────────── */}
      {showWordBanner&&(
        <div style={S.wordFoundBanner}>🎉 {showWordBanner}!</div>
      )}

      {/* ── AI Hint box ───────────────────────────────────── */}
      {showHint&&(
        <div style={S.hintBox}>
          <button style={S.hintClose} onClick={()=>setShowHint(false)}>✕</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"0.93rem",color:"#333",lineHeight:1.5}}>
            {aiLoading?"🤔 Thinking of a hint…":aiHint}
          </div>
        </div>
      )}

      {/* ── GRID ──────────────────────────────────────────── */}
      <div style={S.gridWrap}>
        {gridData&&Array.from({length:ROWS},(_,r)=>(
          <div key={r} style={{display:"flex",gap:"clamp(3px,0.9vw,7px)"}}>
            {Array.from({length:COLS},(_,c)=>renderCell(r,c))}
          </div>
        ))}
      </div>

      {/* ── Progress ──────────────────────────────────────── */}
      <div style={S.progressRow}>
        <span style={S.progressLabel}>{foundWords.size} / {level.words.length} found</span>
        <div style={S.progressTrack}>
          <div style={{...S.progressFill,width:`${(foundWords.size/level.words.length)*100}%`}}/>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800&display=swap');
        @keyframes pflyOut{
          0%  {opacity:1;transform:translate(0,0) scale(1);}
          100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.15);}
        }
        @keyframes bannerPop{
          0%  {transform:translate(-50%,-50%) scale(.45);opacity:0;}
          60% {transform:translate(-50%,-50%) scale(1.12);opacity:1;}
          100%{transform:translate(-50%,-50%) scale(1);opacity:1;}
        }
        @keyframes cloudDrift{
          0%,100%{transform:translateX(0);}50%{transform:translateX(18px);}
        }
        @keyframes winStar{
          0%  {transform:translateY(0) rotate(0deg);opacity:1;}
          100%{transform:translateY(100vh) rotate(720deg);opacity:0;}
        }
        *{-webkit-tap-highlight-color:transparent;}
      `}</style>
    </div>
  );
}

// ── Cloud Background ─────────────────────────────────────────
function CloudBg() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(180deg,#14d4ef 0%,#4ECDC4 55%,#7fffd4 100%)"}}/>
      {[
        {top:"68%",left:"-5%", w:360,d:0},
        {top:"74%",left:"26%", w:290,d:2.5},
        {top:"78%",left:"60%", w:330,d:5},
        {top:"84%",left:"82%", w:210,d:1.2},
      ].map((c,i)=>(
        <div key={i} style={{
          position:"absolute",top:c.top,left:c.left,
          width:c.w,height:76,
          background:"rgba(255,255,255,.72)",
          borderRadius:50,
          animation:`cloudDrift ${7+i}s ease-in-out ${c.d}s infinite`,
          filter:"blur(2px)",
        }}/>
      ))}
    </div>
  );
}

// ── Win particles ────────────────────────────────────────────
function WinParticles() {
  const items = ["⭐","🌟","🎉","🎊","✨","🏆","💛","🎈"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:5,overflow:"hidden"}}>
      {Array.from({length:22},(_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${Math.random()*100}%`,top:"-28px",
          fontSize:`${0.9+Math.random()*1}rem`,
          animation:`winStar ${2+Math.random()*2}s ease-in ${Math.random()*1.5}s forwards`,
        }}>{items[i%items.length]}</div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const S = {
  fullscreen:{
    position:"fixed",inset:0,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
    fontFamily:"'Fredoka One',cursive",userSelect:"none",overflow:"hidden",
  },
  introCard:{
    position:"relative",zIndex:10,
    background:"rgba(255,255,255,.94)",
    border:"4px solid #1a1a2e",borderRadius:32,
    padding:"1.8rem 2.2rem",
    boxShadow:"10px 10px 0 #1a1a2e",
    textAlign:"center",maxWidth:510,margin:"auto",width:"90%",
  },
  introTitle:{
    fontFamily:"'Fredoka One',cursive",
    fontSize:"clamp(1.9rem,6.5vw,3.3rem)",
    color:"#1a1a2e",margin:"0 0 0.3rem",
  },
  introSub:{
    fontFamily:"'Nunito',sans-serif",
    fontSize:"1rem",color:"#555",margin:0,
  },
  themeChip:{
    fontFamily:"'Fredoka One',cursive",
    background:"#FFD93D",border:"3px solid #1a1a2e",
    borderRadius:50,padding:"0.3rem 0.9rem",
    fontSize:"0.88rem",boxShadow:"3px 3px 0 #1a1a2e",
  },
  startBtn:{
    fontFamily:"'Fredoka One',cursive",fontSize:"1.15rem",
    background:"#FF6B35",color:"white",
    border:"4px solid #1a1a2e",borderRadius:50,
    padding:"0.7rem 2rem",cursor:"pointer",
    boxShadow:"5px 5px 0 #1a1a2e",transition:"all .15s",
    marginTop:"0.3rem",
  },
  topBar:{
    position:"relative",zIndex:20,width:"100%",
    display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"clamp(7px,1.8vw,13px) clamp(9px,2.2vw,18px)",
  },
  closeBtn:{
    fontFamily:"'Fredoka One',cursive",
    background:"#C77DFF",color:"white",
    border:"3px solid #1a1a2e",borderRadius:"50%",
    width:44,height:44,fontSize:"1.1rem",
    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:"3px 3px 0 #1a1a2e",flexShrink:0,
  },
  helpBtn:{
    fontFamily:"'Fredoka One',cursive",
    background:"rgba(255,255,255,.88)",color:"#1a1a2e",
    border:"2.5px solid rgba(255,255,255,.6)",borderRadius:"50%",
    width:40,height:40,fontSize:"1.18rem",
    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:"2px 2px 8px rgba(0,0,0,.1)",
  },
  pictureRow:{
    display:"flex",gap:"clamp(3px,1.1vw,9px)",
    justifyContent:"center",flex:1,overflow:"hidden",
  },
  pictureCard:{
    width:"clamp(46px,9vw,80px)",height:"clamp(46px,9vw,80px)",
    borderRadius:14,
    display:"flex",alignItems:"center",justifyContent:"center",
    position:"relative",
    transition:"all .2s cubic-bezier(.175,.885,.32,1.275)",
    flexShrink:0,
    boxShadow:"0 4px 12px rgba(0,0,0,.1)",
    backdropFilter:"blur(4px)",
  },
  checkBadge:{
    position:"absolute",bottom:-8,right:-8,
    fontSize:"1rem",background:"white",
    borderRadius:"50%",width:24,height:24,
    display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:"2px 2px 5px rgba(0,0,0,.13)",
    border:"2px solid #6BCB77",
  },
  scoreChip:{
    position:"fixed",
    top:"clamp(72px,13vw,104px)",
    right:"clamp(9px,2.2vw,18px)",
    background:"#FFD93D",border:"3px solid #1a1a2e",borderRadius:50,
    padding:"0.22rem 0.85rem",
    fontFamily:"'Fredoka One',cursive",fontSize:"0.9rem",
    boxShadow:"3px 3px 0 #1a1a2e",zIndex:30,
  },
  levelChip:{
    position:"fixed",
    top:"clamp(72px,13vw,104px)",
    left:"clamp(9px,2.2vw,18px)",
    background:"rgba(255,255,255,.86)",border:"2.5px solid rgba(255,255,255,.6)",borderRadius:50,
    padding:"0.22rem 0.85rem",
    fontFamily:"'Fredoka One',cursive",fontSize:"0.88rem",
    boxShadow:"2px 2px 7px rgba(0,0,0,.09)",zIndex:30,color:"#1a1a2e",
  },
  currentWordBanner:{
    position:"fixed",top:"44%",left:"50%",
    transform:"translate(-50%,-50%)",
    background:"rgba(255,255,255,.96)",
    border:"3px solid #1a1a2e",borderRadius:20,
    padding:"0.35rem 1.3rem",
    zIndex:50,boxShadow:"0 8px 26px rgba(0,0,0,.17)",
    pointerEvents:"none",minWidth:72,textAlign:"center",
  },
  wordFoundBanner:{
    position:"fixed",top:"46%",left:"50%",
    transform:"translate(-50%,-50%)",
    background:"linear-gradient(135deg,#6BCB77,#3a9e4a)",
    color:"white",fontFamily:"'Fredoka One',cursive",
    fontSize:"clamp(1.3rem,4.5vw,2.3rem)",
    padding:"0.5rem 1.7rem",borderRadius:22,zIndex:100,
    boxShadow:"0 8px 28px rgba(76,203,119,.4),5px 5px 0 #1a1a2e",
    border:"3px solid #1a1a2e",pointerEvents:"none",
    animation:"bannerPop .4s cubic-bezier(.175,.885,.32,1.275)",
  },
  hintBox:{
    position:"fixed",
    bottom:"clamp(68px,13vh,105px)",
    left:"50%",transform:"translateX(-50%)",
    background:"rgba(255,251,240,.97)",
    border:"3px solid #1a1a2e",borderRadius:20,
    padding:"0.9rem 1.3rem",
    zIndex:80,maxWidth:310,width:"88%",
    boxShadow:"6px 6px 0 #1a1a2e",textAlign:"center",
  },
  hintClose:{
    position:"absolute",top:7,right:9,
    background:"none",border:"none",
    cursor:"pointer",fontSize:"0.95rem",color:"#bbb",
  },
  gridWrap:{
    position:"relative",zIndex:10,
    display:"flex",flexDirection:"column",
    gap:"clamp(3px,0.9vw,7px)",
    padding:"clamp(7px,1.6vw,13px)",
    background:"rgba(255,255,255,.13)",
    borderRadius:26,backdropFilter:"blur(4px)",
    border:"2px solid rgba(255,255,255,.26)",
    marginTop:"clamp(58px,12vh,105px)",
  },
  progressRow:{
    position:"fixed",bottom:"clamp(9px,2vh,18px)",
    left:"50%",transform:"translateX(-50%)",
    zIndex:30,
    display:"flex",alignItems:"center",gap:"0.6rem",
    background:"rgba(255,255,255,.88)",
    border:"3px solid #1a1a2e",borderRadius:50,
    padding:"0.3rem 1rem",
    boxShadow:"4px 4px 0 #1a1a2e",
  },
  progressLabel:{
    fontFamily:"'Fredoka One',cursive",
    fontSize:"0.85rem",color:"#1a1a2e",whiteSpace:"nowrap",
  },
  progressTrack:{
    width:100,height:11,
    background:"#ddd",borderRadius:50,
    overflow:"hidden",border:"2px solid #1a1a2e",
  },
  progressFill:{
    height:"100%",
    background:"linear-gradient(90deg,#FFD93D,#FF6B35)",
    borderRadius:50,transition:"width .5s ease",
  },
};
