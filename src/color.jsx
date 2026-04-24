import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types & Constants ────────────────────────────────────────────────────────

const RAINBOW_COLORS = ["#FF0000","#FF5500","#FF9900","#FFFF00","#00FF44","#00CCFF","#6600FF","#FF00CC"];

const ACTIVITY_CARDS = [
  { title:"Traceables: Heart",          emoji:"❤️", color:"#FF69B4", bg:"linear-gradient(145deg,#1a0a3e,#3d1060)", glow:"rgba(255,105,180,0.4)", stars:true,  done:true  },
  { title:"Rainbow Traceables: Star",   emoji:"⭐", color:"#FFD700", bg:"linear-gradient(145deg,#0e183d,#1a2a6e)", glow:"rgba(255,215,0,0.35)",  stars:true,  done:false },
  { title:"Traceables: Rhombus",        emoji:"💎", color:"#00E5FF", bg:"linear-gradient(145deg,#071730,#0d2a4e)", glow:"rgba(0,229,255,0.35)",  stars:true,  done:false },
  { title:"Draw It: Circle",            emoji:"🔵", color:"#BB86FC", bg:"linear-gradient(145deg,#1a083a,#3a1060)", glow:"rgba(187,134,252,0.35)",stars:false, done:false },
];

// ─── Web Audio Engine ─────────────────────────────────────────────────────────
let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume();
  return sharedAudioCtx;
}
function playTone(freq, dur, type = "sine", vol = 0.25) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = type;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch {}
}
function playDrawClick() { playTone(500 + Math.random() * 300, 0.07, "sine", 0.1); }
function playCelebration() {
  [523,659,784,1047,1319].forEach((n,i) => setTimeout(() => playTone(n,0.35,"triangle",0.4), i*110));
}
function playErrorBeep() { playTone(220,0.25,"sawtooth",0.18); }
function playStartChime() {
  [261,329,392,523].forEach((n,i) => setTimeout(() => playTone(n,0.22,"sine",0.28), i*75));
}
function startBgMusic() {
  const melody = [261,293,329,349,392,349,329,293,261,261];
  let idx = 0, stopped = false;
  function playNext() {
    if (stopped) return;
    playTone(melody[idx % melody.length], 0.38, "sine", 0.07);
    idx++;
    setTimeout(playNext, 480);
  }
  playNext();
  return { stop: () => { stopped = true; } };
}

// ─── Rainbow Color ────────────────────────────────────────────────────────────
function rainbowAt(t) {
  const n = RAINBOW_COLORS.length;
  const scaled = ((t % 1) + 1) % 1 * (n - 1);
  const lo = Math.floor(scaled), hi = Math.min(lo + 1, n - 1), frac = scaled - lo;
  const hexToRgb = h => { const v = parseInt(h.slice(1),16); return [(v>>16)&255,(v>>8)&255,v&255]; };
  const lerp = (a,b,f) => Math.round(a+(b-a)*f);
  const [r1,g1,b1] = hexToRgb(RAINBOW_COLORS[lo]);
  const [r2,g2,b2] = hexToRgb(RAINBOW_COLORS[hi]);
  return `rgb(${lerp(r1,r2,frac)},${lerp(g1,g2,frac)},${lerp(b1,b2,frac)})`;
}

// ─── Shape Path Generators ────────────────────────────────────────────────────
function starPathPoints(cx,cy,r) {
  const pts = [];
  for (let i=0;i<5;i++) {
    const angle = (i*4*Math.PI)/5 - Math.PI/2;
    pts.push({x:cx+r*Math.cos(angle),y:cy+r*Math.sin(angle)});
  }
  pts.push({...pts[0]});
  return pts;
}
function heartPathPoints(cx,cy,r) {
  const pts=[], steps=100, scale=r/8.5;
  for (let i=0;i<=steps;i++) {
    const t=(i/steps)*2*Math.PI;
    pts.push({
      x:cx+scale*16*Math.pow(Math.sin(t),3),
      y:cy-scale*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))
    });
  }
  return pts;
}
function rhombusPathPoints(cx,cy,r) {
  return [{x:cx,y:cy-r},{x:cx+r*0.65,y:cy},{x:cx,y:cy+r},{x:cx-r*0.65,y:cy},{x:cx,y:cy-r}];
}
function circlePathPoints(cx,cy,r) {
  const pts=[], steps=100;
  for (let i=0;i<=steps;i++) {
    const t=(i/steps)*2*Math.PI-Math.PI/2;
    pts.push({x:cx+r*Math.cos(t),y:cy+r*Math.sin(t)});
  }
  return pts;
}

// ─── Guide Drawing ────────────────────────────────────────────────────────────
function drawStar(ctx,cx,cy,r) {
  const pts=starPathPoints(cx,cy,r);
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
}
function drawHeart(ctx,cx,cy,r) {
  const pts=heartPathPoints(cx,cy,r);
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
}
function drawRhombus(ctx,cx,cy,r) {
  const pts=rhombusPathPoints(cx,cy,r);
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
  ctx.closePath();
}
function drawCircle(ctx,cx,cy,r) {
  ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
}

const SHAPES = [
  {name:"star",    label:"Star",    emoji:"⭐", accentColor:"#FFD700", guide:drawStar,    pathPoints:starPathPoints   },
  {name:"heart",   label:"Heart",   emoji:"❤️", accentColor:"#FF6B9D", guide:drawHeart,   pathPoints:heartPathPoints  },
  {name:"rhombus", label:"Rhombus", emoji:"💎", accentColor:"#00E5FF", guide:drawRhombus, pathPoints:rhombusPathPoints},
  {name:"circle",  label:"Circle",  emoji:"🔵", accentColor:"#BB86FC", guide:drawCircle,  pathPoints:circlePathPoints },
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const globalStyle = `
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { margin:0; padding:0; overflow:hidden; user-select:none; touch-action:none; }
  @keyframes twinkle {
    from { opacity:0.25; transform:scale(0.75); }
    to   { opacity:1;    transform:scale(1.25); }
  }
  @keyframes sparkle-in {
    0%   { transform:scale(1) rotate(0deg);   opacity:1; }
    100% { transform:scale(2.2) rotate(200deg); opacity:0; }
  }
  @keyframes celebrate {
    0%   { transform:scale(0) rotate(-15deg); opacity:0; }
    70%  { transform:scale(1.1) rotate(4deg); opacity:1; }
    100% { transform:scale(1) rotate(0deg);   opacity:1; }
  }
  @keyframes rainbow-text {
    0%   { background-position:0%   50%; }
    100% { background-position:300% 50%; }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow:0 0 15px rgba(0,200,83,0.5),0 4px 15px rgba(0,0,0,0.3); }
    50%     { box-shadow:0 0 40px rgba(0,200,83,0.95),0 4px 15px rgba(0,0,0,0.3); }
  }
  @keyframes float {
    0%,100% { transform:translateX(-50%) translateY(0); }
    50%     { transform:translateX(-50%) translateY(-8px); }
  }
  @keyframes floatFree {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-10px); }
  }
  @keyframes mascotFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-12px); }
  }
`;

// ─── Mascot SVG ───────────────────────────────────────────────────────────────
function MascoSVG() {
  return (
    <svg viewBox="0 0 210 360" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{width:"100%",height:"100%",filter:"drop-shadow(0 10px 24px rgba(0,0,0,0.45))",animation:"mascotFloat 3s ease-in-out infinite"}}
    >
      <ellipse cx="105" cy="62" rx="55" ry="60" fill="#111"/>
      {[
        {color:"#FF0000",d:"M60 52 Q105 5 150 52 Q130 22 105 17 Q80 22 60 52Z"},
        {color:"#FF7700",d:"M65 47 Q105 3 145 47 Q128 18 105 13 Q82 18 65 47Z"},
        {color:"#FFFF00",d:"M70 42 Q105 1 140 42 Q122 14 105 9 Q88 14 70 42Z"},
        {color:"#00FF44",d:"M75 37 Q105 -1 135 37 Q118 11 105 6 Q92 11 75 37Z"},
        {color:"#00CCFF",d:"M80 33 Q105 -3 130 33 Q115 8 105 3 Q95 8 80 33Z"},
        {color:"#8800FF",d:"M86 30 Q105 -4 124 30 Q112 6 105 1 Q98 6 86 30Z"},
      ].map(({color,d},i) => <path key={i} d={d} fill={color}/>)}
      <ellipse cx="105" cy="98" rx="52" ry="54" fill="white"/>
      <circle cx="89" cy="92" r="8.5" fill="#111"/>
      <circle cx="121" cy="92" r="8.5" fill="#111"/>
      <circle cx="91" cy="89" r="3.2" fill="white"/>
      <circle cx="123" cy="89" r="3.2" fill="white"/>
      <ellipse cx="76" cy="108" rx="11" ry="7.5" fill="#FFB3C8" opacity="0.6"/>
      <ellipse cx="134" cy="108" rx="11" ry="7.5" fill="#FFB3C8" opacity="0.6"/>
      <path d="M85 115 Q105 130 125 115" stroke="#111" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
      <rect x="93" y="147" width="24" height="18" rx="7" fill="white"/>
      <ellipse cx="105" cy="218" rx="47" ry="62" fill="white"/>
      <rect x="83" y="162" width="44" height="9" rx="5" fill="#e91e8c"/>
      <path d="M60 180 Q34 155 22 135" stroke="white" strokeWidth="23" strokeLinecap="round"/>
      <circle cx="22" cy="133" r="14" fill="white"/>
      <text x="8" y="118" fontSize="16" fill="#FFD700" opacity="0.9">✨</text>
      <path d="M150 180 Q170 205 172 225" stroke="white" strokeWidth="23" strokeLinecap="round"/>
      <circle cx="172" cy="225" r="13" fill="white"/>
      <path d="M86 272 Q80 305 75 332" stroke="white" strokeWidth="21" strokeLinecap="round"/>
      <path d="M124 272 Q130 305 135 332" stroke="white" strokeWidth="21" strokeLinecap="round"/>
      <ellipse cx="72" cy="334" rx="20" ry="11" fill="#1a3a6e"/>
      <ellipse cx="138" cy="334" rx="20" ry="11" fill="#1a3a6e"/>
    </svg>
  );
}

// ─── ShapeMenu Component ──────────────────────────────────────────────────────
function ShapeMenu({ onPlay }) {
  const [mascotIn, setMascotIn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [floatStars] = useState(() =>
    Array.from({length:20},(_,i) => ({
      x:Math.random()*100, y:Math.random()*100,
      size:1.5+Math.random()*2,
      delay:i*0.25,
      duration:2+Math.random()*2,
      color:["#fff","#FFD700","#FF69B4","#00FFFF"][i%4],
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setMascotIn(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",
      background:"linear-gradient(145deg,#e91e8c 0%,#c2185b 35%,#d81b60 65%,#b71c5f 100%)"}}>
      {/* Wood stripe pattern */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 44px,rgba(255,255,255,0.07) 44px,rgba(255,255,255,0.07) 46px)",
        opacity:0.9}}/>

      {/* Floating sparkles */}
      {floatStars.map((s,i) => (
        <div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          fontSize:s.size*8,color:s.color,opacity:0.25,pointerEvents:"none",fontWeight:900,
          animation:`twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`}}>✦</div>
      ))}

      {/* Bottom wave */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:130,pointerEvents:"none"}}>
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none" style={{width:"100%",height:"100%"}}>
          <path d="M0,65 C360,130 1080,0 1440,65 L1440,130 L0,130 Z" fill="rgba(255,255,255,0.12)"/>
          <path d="M0,90 C500,20 940,120 1440,85 L1440,130 L0,130 Z" fill="rgba(255,255,255,0.07)"/>
        </svg>
      </div>

      {/* Shelf props */}
      <div style={{position:"absolute",top:"8%",right:"4%",display:"flex",gap:16,alignItems:"flex-end",pointerEvents:"none"}}>
        <div style={{width:64,height:64,background:"#f8d7da",border:"6px solid #e88fa0",borderRadius:8,
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
          <span style={{fontSize:28}}>🐱</span>
        </div>
        <span style={{fontSize:52}}>🎺</span>
        <span style={{fontSize:44}}>🖊️</span>
      </div>

      {/* Shelf line */}
      <div style={{position:"absolute",top:"16%",right:"3%",width:"22%",height:8,
        background:"linear-gradient(90deg,#b71c5f,#c2185b)",borderRadius:6,
        boxShadow:"0 4px 12px rgba(0,0,0,0.3)",pointerEvents:"none"}}/>

      {/* Header */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",padding:16,gap:12}}>
        <div style={{padding:"8px 20px",borderRadius:16,fontWeight:900,color:"white",fontSize:20,
          background:"linear-gradient(135deg,rgba(173,20,87,0.85),rgba(194,24,91,0.85))",
          backdropFilter:"blur(8px)",border:"2px solid rgba(255,255,255,0.25)",
          letterSpacing:"0.03em",textShadow:"0 2px 10px rgba(0,0,0,0.4)"}}>
          🎨 Art & Shapes
        </div>
      </div>

      {/* Mascot */}
      <div style={{position:"absolute",zIndex:10,pointerEvents:"none",
        bottom:"clamp(70px,12vh,130px)",left:"clamp(12px,4vw,50px)",
        width:"clamp(130px,20vw,260px)",
        transform:mascotIn?"translateY(0)":"translateY(130%)",
        transition:"transform 0.85s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <MascoSVG/>
      </div>

      {/* Main content */}
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",zIndex:10,paddingTop:64,paddingBottom:40}}>
        {/* Badge */}
        <div style={{marginBottom:20,padding:"8px 20px",borderRadius:50,fontWeight:900,color:"white",fontSize:14,
          background:"linear-gradient(135deg,#c2185b,#ad1457)",border:"2px solid rgba(255,255,255,0.4)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.3)",letterSpacing:"0.05em"}}>
          ✨ Featured Activities
        </div>

        {/* Cards */}
        <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:12,paddingLeft:8,paddingRight:8,
          maxWidth:"min(960px,88vw)",scrollbarWidth:"none"}}>
          {ACTIVITY_CARDS.map((card,i) => (
            <div key={card.title} onClick={onPlay}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{position:"relative",flexShrink:0,borderRadius:24,overflow:"hidden",cursor:"pointer",
                width:"clamp(155px,22vw,230px)",height:"clamp(165px,24vw,250px)",background:card.bg,
                border:hoveredCard===i?"3px solid rgba(255,255,255,0.75)":"3px solid rgba(255,255,255,0.2)",
                transform:hoveredCard===i?"scale(1.07) translateY(-6px)":"scale(1)",
                transition:"all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow:hoveredCard===i?`0 24px 50px rgba(0,0,0,0.45),0 0 40px ${card.glow}`:"0 8px 28px rgba(0,0,0,0.4)"}}>
              {/* Radial glow */}
              <div style={{position:"absolute",inset:0,pointerEvents:"none",
                background:`radial-gradient(ellipse at 35% 35%,${card.color}44 0%,transparent 65%)`}}/>
              {/* Twinkle stars */}
              {card.stars && ["12%,18%","78%,22%","55%,75%","20%,65%"].map((pos,j) => (
                <div key={j} style={{position:"absolute",left:pos.split(",")[0],top:pos.split(",")[1],
                  fontSize:10+j*2,opacity:0.55,pointerEvents:"none",fontWeight:900,color:"white",
                  animation:`twinkle ${1.5+j*0.4}s ease-in-out infinite alternate`}}>✦</div>
              ))}
              {/* Emoji icon */}
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:"58%",height:"58%",display:"flex",alignItems:"center",justifyContent:"center",
                  borderRadius:"50%",background:`${card.color}1a`,border:`3px solid ${card.color}55`,
                  fontSize:"clamp(2.2rem,5.5vw,3.8rem)",
                  animation:hoveredCard===i?"floatFree 1.5s ease-in-out infinite":"none"}}>
                  {card.emoji}
                </div>
              </div>
              {/* Done badge */}
              {card.done && (
                <div style={{position:"absolute",bottom:40,right:12,width:38,height:38,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,
                  background:"linear-gradient(135deg,#00C853,#69F0AE)",fontSize:20,
                  border:"2px solid rgba(255,255,255,0.5)",boxShadow:"0 4px 16px rgba(0,200,83,0.6)"}}>✓</div>
              )}
              {/* Title */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center",padding:"8px 4px",
                fontWeight:900,color:"white",background:"linear-gradient(transparent,rgba(0,0,0,0.72))",
                fontSize:"clamp(0.62rem,1.4vw,0.82rem)",letterSpacing:"0.02em"}}>
                {card.title}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onPlay} style={{marginTop:28,fontWeight:900,color:"white",borderRadius:24,
          padding:"clamp(10px,2vh,16px) clamp(28px,5vw,48px)",fontSize:"clamp(1rem,2.5vw,1.3rem)",
          background:"linear-gradient(135deg,#FF6B35,#FF8E53)",border:"3px solid rgba(255,255,255,0.4)",
          boxShadow:"0 0 45px rgba(255,107,53,0.65),0 8px 28px rgba(0,0,0,0.3)",letterSpacing:"0.05em",
          cursor:"pointer",transition:"transform 0.15s"}}>
          🎮 Start Tracing Now!
        </button>
      </div>

      {/* NEW badge */}
      <div style={{position:"absolute",zIndex:20,bottom:20,left:20,padding:"8px 16px",borderRadius:50,
        fontWeight:900,color:"white",fontSize:14,background:"linear-gradient(135deg,#FF6B35,#FF8E53)",
        border:"2px solid rgba(255,255,255,0.4)",boxShadow:"0 4px 15px rgba(255,107,53,0.5)"}}>
        ✨ New
      </div>

      {/* Logo */}
      <div style={{position:"absolute",top:16,right:20,zIndex:20,fontWeight:900,color:"white",opacity:0.8,
        fontSize:"clamp(0.8rem,1.8vw,1.1rem)",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>
        🏫 Masti Pathshala
      </div>
    </div>
  );
}

// ─── ShapeGame Component ──────────────────────────────────────────────────────
function ShapeGame({ onClose }) {
  const canvasRef = useRef(null);
  const [W, setW] = useState(window.innerWidth);
  const [H, setH] = useState(window.innerHeight);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [musicOn, setMusicOn] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [score, setScore] = useState(0);
  const [aiTip, setAiTip] = useState("");

  const drawnRef = useRef([]);
  const lastPosRef = useRef(null);
  const animRef = useRef(0);
  const guideTickRef = useRef(0);
  const guideAnimRef = useRef(0);
  const sparkleIdRef = useRef(0);
  const bgMusicRef = useRef(null);
  const completedRef = useRef(false);
  const soundTickRef = useRef(0);

  const shape = SHAPES[shapeIdx];
  const cx = W / 2, cy = H / 2 + 10;
  const radius = Math.min(W, H) * 0.27;

  useEffect(() => {
    const onResize = () => { setW(window.innerWidth); setH(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (musicOn) { bgMusicRef.current = startBgMusic(); }
    else { bgMusicRef.current?.stop(); bgMusicRef.current = null; }
    return () => bgMusicRef.current?.stop();
  }, [musicOn]);

  useEffect(() => {
    const animate = () => {
      guideTickRef.current = (guideTickRef.current + 0.005) % 1;
      guideAnimRef.current = requestAnimationFrame(animate);
    };
    guideAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(guideAnimRef.current);
  }, []);

  useEffect(() => {
    drawnRef.current = [];
    lastPosRef.current = null;
    setProgress(0); setCompleted(false);
    completedRef.current = false;
    setShowWin(false); setShowHint(true);
    setAiTip(`Trace the dashed ${shape.label} outline with your finger!`);
    playStartChime();
  }, [shapeIdx, shape.label]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const render = () => {
      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.setLineDash([20,16]);
      ctx.lineDashOffset = -guideTickRef.current * 240;
      ctx.lineWidth = 20;
      ctx.strokeStyle = "rgba(160,185,220,0.5)";
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      shape.guide(ctx,cx,cy,radius);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      if (showHint) {
        const startPts = shape.pathPoints(cx,cy,radius);
        if (startPts.length > 0) {
          const sp = startPts[0];
          ctx.save();
          ctx.beginPath(); ctx.arc(sp.x,sp.y,14,0,2*Math.PI);
          ctx.fillStyle = "rgba(255,255,100,0.7)"; ctx.fill();
          ctx.strokeStyle = "rgba(255,200,0,0.9)"; ctx.lineWidth = 3; ctx.stroke();
          ctx.restore();
        }
      }
      const pts = drawnRef.current;
      if (pts.length > 1) {
        for (let i=1;i<pts.length;i++) {
          const p0=pts[i-1], p1=pts[i];
          ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y);
          ctx.strokeStyle = p1.color; ctx.lineWidth = 24;
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.shadowColor = p1.color; ctx.shadowBlur = 18; ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [shape, cx, cy, radius, W, H, showHint]);

  const evaluateProgress = useCallback(() => {
    const guidePts = shape.pathPoints(cx,cy,radius);
    if (!guidePts.length) return 0;
    const drawn = drawnRef.current, tol = radius * 0.20;
    let covered = 0;
    for (const gp of guidePts) {
      if (drawn.some(dp => Math.hypot(dp.x-gp.x,dp.y-gp.y) < tol)) covered++;
    }
    return Math.min(1, covered/guidePts.length);
  }, [shape,cx,cy,radius]);

  const generateAiTip = useCallback((prog) => {
    if (prog < 0.2) return `Keep going! Start from the yellow dot ⭐`;
    if (prog < 0.5) return `Great job! You're ${Math.round(prog*100)}% done! 🎨`;
    if (prog < 0.75) return `Wonderful! Almost there! Keep tracing! ✨`;
    if (prog < 0.9) return `So close! Just a little more! 🌈`;
    return `Amazing tracing! Almost perfect! 🎉`;
  }, []);

  const emitSparkle = useCallback((x,y) => {
    const symbols=["✦","✧","★","✸","❋","✺"];
    const colors=["#FFD700","#FF69B4","#00FFFF","#FF6347","#7FFF00","#EE82EE","#FF8C00"];
    const id = sparkleIdRef.current++;
    const item = {id,x,y,size:14+Math.random()*18,
      color:colors[Math.floor(Math.random()*colors.length)],
      symbol:symbols[Math.floor(Math.random()*symbols.length)]};
    setSparkles(prev => [...prev.slice(-40),item]);
    setTimeout(() => setSparkles(prev => prev.filter(s => s.id!==id)), 900);
  }, []);

  const triggerCelebration = useCallback(() => {
    for (let i=0;i<20;i++) {
      setTimeout(() => emitSparkle(W*0.2+Math.random()*W*0.6, H*0.2+Math.random()*H*0.6), i*80);
    }
    playCelebration();
    setScore(s => s+10);
    setShowWin(true);
    setTimeout(() => setShowWin(false), 3500);
  }, [W,H,emitSparkle]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return null;
      return {x:touch.clientX-rect.left, y:touch.clientY-rect.top};
    }
    return {x:e.clientX-rect.left, y:e.clientY-rect.top};
  };

  const handlePointerDown = (e) => {
    if (completedRef.current) return;
    const pos = getPos(e); if (!pos) return;
    setIsDrawing(true); setShowHint(false);
    lastPosRef.current = pos; playDrawClick();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || completedRef.current) return;
    const pos = getPos(e); if (!pos) return;
    const t = drawnRef.current.length / 320;
    drawnRef.current.push({...pos, color:rainbowAt(t)});
    if (Math.random() < 0.2) emitSparkle(pos.x, pos.y);
    soundTickRef.current++;
    if (soundTickRef.current % 4 === 0) playDrawClick();
    lastPosRef.current = pos;
    if (drawnRef.current.length % 8 === 0) {
      const prog = evaluateProgress();
      setProgress(prog);
      setAiTip(generateAiTip(prog));
      if (prog >= 0.83 && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true); setIsDrawing(false);
        triggerCelebration();
      }
    }
  };

  const handlePointerUp = () => setIsDrawing(false);

  const handleUndo = () => {
    if (completedRef.current) return;
    drawnRef.current = drawnRef.current.slice(0,-40);
    setProgress(evaluateProgress()); playErrorBeep();
  };

  const handleReset = () => {
    drawnRef.current = []; lastPosRef.current = null;
    setProgress(0); setCompleted(false);
    completedRef.current = false; setShowWin(false);
    setShowHint(true); setAiTip(`Trace the dashed ${shape.label} outline!`);
    playStartChime();
  };

  const handleCheckmark = () => {
    if (completedRef.current) { triggerCelebration(); }
    else {
      const prog = evaluateProgress();
      if (prog < 0.3) { playErrorBeep(); setAiTip("Keep tracing! Follow the dashed line ✏️"); }
      else { playTone(440,0.2,"sine",0.3); setAiTip(`You're at ${Math.round(prog*100)}%! Keep going! 🌟`); }
    }
  };

  const handleNextShape = () => setShapeIdx(i => (i+1) % SHAPES.length);
  const handlePrevShape = () => setShapeIdx(i => (i-1+SHAPES.length) % SHAPES.length);

  const bgStars = useRef(Array.from({length:30},(_,i) => ({
    x:(i*37+11)%100, y:(i*53+7)%100, size:1.5+(i%4)*0.8, delay:i*0.3
  })));

  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",
      background:"linear-gradient(160deg,#071730 0%,#0d2445 35%,#0a1e3d 65%,#060f20 100%)"}}>
      {bgStars.current.map((star,i) => (
        <div key={i} style={{position:"absolute",borderRadius:"50%",pointerEvents:"none",
          left:`${star.x}%`,top:`${star.y}%`,
          width:star.size*3,height:star.size*3,background:"white",
          opacity:0.5+(i%3)*0.15,
          animation:`twinkle ${1.5+(i%5)*0.4}s ease-in-out ${star.delay}s infinite alternate`,
          boxShadow:"0 0 6px 2px rgba(180,210,255,0.6)"}}/>
      ))}

      <canvas ref={canvasRef} width={W} height={H}
        style={{position:"absolute",inset:0,cursor:"crosshair",touchAction:"none"}}
        onMouseDown={handlePointerDown} onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown} onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}/>

      {sparkles.map(s => (
        <div key={s.id} style={{position:"absolute",pointerEvents:"none",fontWeight:900,
          left:s.x-s.size/2, top:s.y-s.size/2, fontSize:s.size, color:s.color,
          textShadow:`0 0 8px ${s.color}`,animation:"sparkle-in 0.8s ease-out forwards",zIndex:25}}>
          {s.symbol}
        </div>
      ))}

      {showWin && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
          pointerEvents:"none",zIndex:40}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,
            padding:"32px 40px",borderRadius:24,
            background:"rgba(0,0,0,0.65)",backdropFilter:"blur(16px)",
            border:"2px solid rgba(255,215,0,0.5)",boxShadow:"0 0 60px rgba(255,200,0,0.4)",
            animation:"celebrate 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{fontSize:"clamp(3rem,10vw,6rem)"}}>🎉</div>
            <div style={{fontWeight:900,textAlign:"center",fontSize:"clamp(1.8rem,5vw,3.5rem)",
              background:"linear-gradient(90deg,#FFD700,#FF69B4,#00FFFF,#7FFF00,#FFD700)",
              backgroundSize:"300% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",animation:"rainbow-text 1.5s linear infinite"}}>
              Excellent! 🌈
            </div>
            <div style={{color:"white",fontWeight:700,fontSize:"1.2rem",opacity:0.9}}>
              You drew the {shape.label}! +10 ⭐
            </div>
          </div>
        </div>
      )}

      {/* Close button */}
      <button onClick={onClose} title="Back to Menu"
        style={{position:"absolute",zIndex:30,top:16,left:16,width:58,height:58,
          display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,
          fontWeight:900,color:"white",fontSize:24,cursor:"pointer",
          background:"linear-gradient(135deg,#e91e8c,#ad1457)",
          border:"3px solid rgba(255,255,255,0.35)",boxShadow:"0 4px 20px rgba(233,30,140,0.55)",
          transition:"transform 0.15s"}}>✕</button>

      {/* Title & score */}
      <div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",
        zIndex:30,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:16,
          fontWeight:900,color:"white",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(12px)",
          border:"1.5px solid rgba(255,255,255,0.22)",fontSize:"clamp(1rem,2.5vw,1.5rem)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
          <span style={{fontSize:"1.3em"}}>{shape.emoji}</span>
          <span>Trace the {shape.label}!</span>
        </div>
        <span style={{color:"#fde047",fontWeight:700,fontSize:14}}>⭐ Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div style={{position:"absolute",zIndex:30,top:90,left:"50%",
        transform:"translateX(-50%)",width:"min(350px,72vw)",display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1,height:16,borderRadius:50,overflow:"hidden",
          background:"rgba(255,255,255,0.12)",boxShadow:"inset 0 2px 6px rgba(0,0,0,0.3)"}}>
          <div style={{height:"100%",borderRadius:50,transition:"width 0.25s ease",
            width:`${progress*100}%`,
            background:completed?"linear-gradient(90deg,#00E676,#69F0AE)"
              :"linear-gradient(90deg,#FF0000,#FF7700,#FFFF00,#00FF44,#00CCFF,#8800FF)",
            boxShadow:"0 0 12px rgba(255,200,0,0.5)"}}/>
        </div>
        <span style={{color:"white",fontWeight:700,fontSize:12,width:40,textAlign:"right"}}>
          {Math.round(progress*100)}%
        </span>
      </div>

      {/* AI tip */}
      {aiTip && (
        <div style={{position:"absolute",zIndex:30,top:118,left:"50%",transform:"translateX(-50%)",
          textAlign:"center",fontWeight:700,color:"white",padding:"4px 16px",borderRadius:50,
          background:"rgba(255,255,255,0.1)",backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.2)",fontSize:"clamp(0.7rem,1.5vw,0.9rem)",
          whiteSpace:"nowrap"}}>
          🤖 {aiTip}
        </div>
      )}

      {/* Right controls */}
      <div style={{position:"absolute",zIndex:30,right:16,top:"50%",transform:"translateY(-50%)",
        display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,padding:8,borderRadius:24,
          background:"rgba(50,70,110,0.6)",backdropFilter:"blur(12px)",
          border:"1.5px solid rgba(255,255,255,0.18)",boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>
          <button onClick={handleUndo} title="Undo"
            style={{width:58,height:58,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",color:"white",fontWeight:900,fontSize:22,cursor:"pointer",
              background:"rgba(70,90,140,0.75)",border:"1.5px solid rgba(255,255,255,0.22)",
              transition:"transform 0.15s"}}>↩</button>
          <button onClick={handleReset} title="Reset"
            style={{width:58,height:58,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",color:"white",fontWeight:900,fontSize:20,cursor:"pointer",
              background:"rgba(70,90,140,0.75)",border:"1.5px solid rgba(255,255,255,0.22)",
              transition:"transform 0.15s"}}>🔄</button>
        </div>
        <button onClick={handleCheckmark} title="Check"
          style={{width:74,height:74,borderRadius:"50%",display:"flex",alignItems:"center",
            justifyContent:"center",fontWeight:900,color:"white",fontSize:32,cursor:"pointer",
            background:completed?"linear-gradient(135deg,#00C853,#69F0AE)":"linear-gradient(135deg,#2e7d32,#43A047)",
            border:"3px solid rgba(255,255,255,0.35)",
            boxShadow:completed?"0 0 28px rgba(0,200,83,0.85),0 6px 20px rgba(0,0,0,0.3)":"0 6px 20px rgba(0,0,0,0.3)",
            animation:completed?"pulse-glow 1.5s ease-in-out infinite":"none",
            transition:"transform 0.15s"}}>✓</button>
      </div>

      {/* Bottom shape selector */}
      <div style={{position:"absolute",zIndex:30,bottom:20,left:"50%",transform:"translateX(-50%)",
        display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:16,
        background:"rgba(255,255,255,0.09)",backdropFilter:"blur(12px)",
        border:"1.5px solid rgba(255,255,255,0.2)",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
        <button onClick={handlePrevShape}
          style={{color:"white",fontWeight:900,fontSize:20,padding:"4px 8px",borderRadius:12,
            background:"rgba(255,255,255,0.12)",border:"none",cursor:"pointer",transition:"transform 0.15s"}}>‹</button>
        {SHAPES.map((s,i) => (
          <button key={s.name} onClick={() => setShapeIdx(i)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 12px",
              borderRadius:12,cursor:"pointer",transition:"all 0.15s",
              background:i===shapeIdx?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.07)",
              border:`2px solid ${i===shapeIdx?"rgba(255,255,255,0.65)":"transparent"}`,
              transform:i===shapeIdx?"scale(1.12)":"scale(1)"}}>
            <span style={{fontSize:"clamp(1.2rem,3vw,1.6rem)"}}>{s.emoji}</span>
            <span style={{color:"white",fontWeight:700,fontSize:"clamp(0.55rem,1.2vw,0.72rem)"}}>{s.label}</span>
          </button>
        ))}
        <button onClick={handleNextShape}
          style={{color:"white",fontWeight:900,fontSize:20,padding:"4px 8px",borderRadius:12,
            background:"rgba(255,255,255,0.12)",border:"none",cursor:"pointer",transition:"transform 0.15s"}}>›</button>
      </div>

      {/* Music toggle */}
      <button onClick={() => setMusicOn(m => !m)} title={musicOn?"Mute":"Play Music"}
        style={{position:"absolute",zIndex:30,bottom:20,right:16,width:48,height:48,
          borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
          color:"white",fontSize:20,cursor:"pointer",
          background:"rgba(50,70,120,0.7)",backdropFilter:"blur(10px)",
          border:"1.5px solid rgba(255,255,255,0.22)",transition:"transform 0.15s"}}>
        {musicOn?"🎵":"🔇"}
      </button>

      {/* Next shape when completed */}
      {completed && (
        <button onClick={handleNextShape}
          style={{position:"absolute",zIndex:30,bottom:90,left:"50%",
            transform:"translateX(-50%)",fontWeight:900,color:"white",borderRadius:16,
            padding:"12px 32px",fontSize:"1.1rem",cursor:"pointer",
            background:"linear-gradient(135deg,#FF6B35,#FF8E53)",
            border:"2px solid rgba(255,255,255,0.4)",
            boxShadow:"0 0 30px rgba(255,107,53,0.65)",
            animation:"float 1.5s ease-in-out infinite"}}>
          Next Shape → 🎨
        </button>
      )}

      {/* Hint label */}
      {showHint && (
        <div style={{position:"absolute",zIndex:20,pointerEvents:"none",
          left:cx-80,top:cy-radius-70,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{padding:"4px 12px",borderRadius:50,color:"white",fontWeight:700,fontSize:14,
            whiteSpace:"nowrap",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)"}}>
            ✏️ Trace the dashed line!
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("menu");

  return (
    <div style={{position:"fixed",inset:0}}>
      <style>{globalStyle}</style>
      {screen === "menu" && <ShapeMenu onPlay={() => setScreen("game")} onClose={() => setScreen("menu")}/>}
      {screen === "game" && <ShapeGame onClose={() => setScreen("menu")}/>}
    </div>
  );
}
