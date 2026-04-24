import { useState, useRef, useEffect, useCallback } from "react";

import useBgMusic from "./useBgMusic";

// ─── Audio Engine (Web Audio API — no external files needed) ────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;


function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type = "sine", dur = 0.12, vol = 0.18) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

function playColorSelect() { playTone(660, "sine", 0.08, 0.15); }
function playFillSound() {
  try {
    const ctx = getAudioCtx();
    [440, 554, 659].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);
      o.start(ctx.currentTime + i * 0.06);
      o.stop(ctx.currentTime + i * 0.06 + 0.18);
    });
  } catch {}
}
function playCelebration() {
  try {
    const ctx = getAudioCtx();
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.22);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.22);
    });
  } catch {}
}
function playMagicSound() {
  try {
    const ctx = getAudioCtx();
    for (let i = 0; i < 8; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 400 + Math.random() * 800;
      g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.2);
      o.start(ctx.currentTime + i * 0.07);
      o.stop(ctx.currentTime + i * 0.07 + 0.2);
    }
  } catch {}
}
function playUndoSound() { playTone(330, "triangle", 0.1, 0.12); }

// ─── Background Music ────────────────────────────────────────────
let bgMusicInterval = null;
let bgMusicPlaying = false;

function startBgMusic() {
  if (bgMusicPlaying) return;
  bgMusicPlaying = true;
  const melody = [261, 294, 329, 349, 392, 349, 329, 294];
  let idx = 0;
  bgMusicInterval = setInterval(() => {
    try {
      const ctx = getAudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = melody[idx % melody.length];
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.38);
      idx++;
    } catch {}
  }, 420);
}

function stopBgMusic() {
  bgMusicPlaying = false;
  if (bgMusicInterval) { clearInterval(bgMusicInterval); bgMusicInterval = null; }
}

// ─── Color Palettes (horizontal scroll groups) ───────────────────
const ALL_COLORS = [
  "#FF3B3B","#FF6B35","#FFD93D","#6BCB77","#4ECDC4",
  "#45B7D1","#4361EE","#7B2FBE","#C77DFF","#FF85A1",
  "#FF69B4","#E91E63","#F44336","#FF5722","#FF9800",
  "#FFC107","#8BC34A","#4CAF50","#009688","#00BCD4",
  "#2196F3","#3F51B5","#9C27B0","#795548","#607D8B",
  "#FFFFFF","#F5F5F5","#E0E0E0","#9E9E9E","#616161",
  "#424242","#212121","#000000","#8D6E63","#A1887F",
  "#FFCC80","#FFB74D","#FF8A65","#F48FB1","#CE93D8",
];

// ─── Coloring Pages (SVG with named regions) ─────────────────────
const PAGES = [
  { id: "cupcake",   name: "Cupcake",   emoji: "🧁",  tag: "Sweet",    bg: "#FFE0EE",
    regions: [
      { id:"base"     }, { id:"stripes"  }, { id:"frosting" },
      { id:"swirl"    }, { id:"dots"     }, { id:"cherry"   }, { id:"stem" },
    ]
  },
  { id: "lion",      name: "Lion",      emoji: "🦁",  tag: "Animals",  bg: "#FFF3CD",
    regions: [
      { id:"mane" }, { id:"face" }, { id:"ears_l" }, { id:"ears_r" },
      { id:"nose" }, { id:"eyes" }, { id:"mouth"  }, { id:"body"   },
      { id:"paws" }, { id:"tail" }, { id:"bg"     }, { id:"ground" },
    ]
  },
  { id: "butterfly", name: "Butterfly", emoji: "🦋",  tag: "Nature",   bg: "#E0F4FF",
    regions: [
      { id:"wing_tl" }, { id:"wing_tr" }, { id:"wing_bl" }, { id:"wing_br" },
      { id:"body"    }, { id:"head"    }, { id:"pattern_l"}, { id:"pattern_r"},
      { id:"antennae"}, { id:"bg"      },
    ]
  },
  { id: "scenery",   name: "Scenery",   emoji: "🏔️", tag: "Nature",   bg: "#E8F5E9",
    regions: [
      { id:"sky" }, { id:"sun" }, { id:"cloud_l" }, { id:"cloud_r" },
      { id:"mountain_l" }, { id:"mountain_r" }, { id:"mountain_m" },
      { id:"river" }, { id:"grass" }, { id:"tree_l" }, { id:"tree_r" },
      { id:"flowers" },
    ]
  },
  { id: "joker",     name: "Joker",     emoji: "🃏",  tag: "Fun",      bg: "#FCE4EC",
    regions: [
      { id:"bg"       }, { id:"hat"      }, { id:"hat_bell" }, { id:"face"    },
      { id:"hair_l"   }, { id:"hair_r"   }, { id:"eye_l"    }, { id:"eye_r"   },
      { id:"nose"     }, { id:"mouth"    }, { id:"collar"   }, { id:"body"    },
      { id:"diamond_l"}, { id:"diamond_r"},
    ]
  },
  { id: "magician",  name: "Magician",  emoji: "🎩",  tag: "Magic",    bg: "#EDE7F6",
    regions: [
      { id:"bg"       }, { id:"hat"      }, { id:"hat_band" }, { id:"rabbit"  },
      { id:"face"     }, { id:"hair"     }, { id:"eyes"     }, { id:"moustache"},
      { id:"cape"     }, { id:"cape_lining"}, { id:"wand"   }, { id:"stars"   },
      { id:"body"     },
    ]
  },
  { id: "rocket",    name: "Rocket",    emoji: "🚀",  tag: "Space",    bg: "#E3F2FD",
    regions: [
      { id:"space"    }, { id:"stars_bg" }, { id:"body"     }, { id:"nose_cone"},
      { id:"window"   }, { id:"fin_l"    }, { id:"fin_r"    }, { id:"flame"   },
      { id:"flame_inner"}, { id:"planet" }, { id:"moon"     },
    ]
  },
  { id: "mermaid",   name: "Mermaid",   emoji: "🧜",  tag: "Fantasy",  bg: "#E0F7FA",
    regions: [
      { id:"ocean"    }, { id:"tail"     }, { id:"scales"   }, { id:"fin"     },
      { id:"body"     }, { id:"hair"     }, { id:"face"     }, { id:"eyes"    },
      { id:"shell_top"}, { id:"bubbles"  }, { id:"coral"    }, { id:"seaweed" },
    ]
  },
  { id: "dragon",    name: "Dragon",    emoji: "🐉",  tag: "Fantasy",  bg: "#FFF8E1",
    regions: [
      { id:"bg"       }, { id:"body"     }, { id:"belly"    }, { id:"wing_l"  },
      { id:"wing_r"   }, { id:"head"     }, { id:"eye_l"    }, { id:"eye_r"   },
      { id:"horns"    }, { id:"flame"    }, { id:"tail"     }, { id:"spikes"  },
    ]
  },
];

// ─── AI Color Scheme Suggestions ─────────────────────────────────
const AI_SCHEMES = {
  cupcake: [
    { name: "Strawberry Dream", colors: { base:"#FFE4B5", stripes:"#FFB6C1", frosting:"#FF69B4", swirl:"#FF1493", dots:"#FF4500", cherry:"#DC143C", stem:"#228B22" }},
    { name: "Ocean Breeze",     colors: { base:"#E0F4FF", stripes:"#87CEEB", frosting:"#4169E1", swirl:"#1E90FF", dots:"#00BFFF", cherry:"#FF6347", stem:"#2E8B57" }},
    { name: "Sunset Glow",      colors: { base:"#FFF3CD", stripes:"#FFD700", frosting:"#FF8C00", swirl:"#FF4500", dots:"#DC143C", cherry:"#8B0000", stem:"#556B2F" }},
    { name: "Magic Forest",     colors: { base:"#F0FFF0", stripes:"#90EE90", frosting:"#32CD32", swirl:"#228B22", dots:"#FFD700", cherry:"#FF69B4", stem:"#8B4513" }},
  ],
  lion: [
    { name: "Savanna King",     colors: { mane:"#8B4513", face:"#DAA520", ears_l:"#CD853F", ears_r:"#CD853F", nose:"#FF6347", eyes:"#4169E1", mouth:"#8B0000", body:"#D2691E", paws:"#A0522D", tail:"#8B4513", bg:"#87CEEB", ground:"#9ACD32" }},
    { name: "Midnight Leo",     colors: { mane:"#2C1810", face:"#4A3728", ears_l:"#3D2B1F", ears_r:"#3D2B1F", nose:"#8B0000", eyes:"#FFD700", mouth:"#FF4500", body:"#3D2B1F", paws:"#2C1810", tail:"#2C1810", bg:"#191970", ground:"#2F4F4F" }},
    { name: "Rainbow Roar",     colors: { mane:"#9B59B6", face:"#E67E22", ears_l:"#E74C3C", ears_r:"#E74C3C", nose:"#F39C12", eyes:"#27AE60", mouth:"#E91E63", body:"#3498DB", paws:"#1ABC9C", tail:"#8E44AD", bg:"#ECF0F1", ground:"#2ECC71" }},
  ],
  butterfly: [
    { name: "Monarch",    colors: { wing_tl:"#FF8C00", wing_tr:"#FF8C00", wing_bl:"#FF6347", wing_br:"#FF6347", body:"#000000", head:"#000000", pattern_l:"#000000", pattern_r:"#000000", antennae:"#000000", bg:"#87CEEB" }},
    { name: "Blue Morpho",colors: { wing_tl:"#0080FF", wing_tr:"#0080FF", wing_bl:"#4169E1", wing_br:"#4169E1", body:"#191970", head:"#191970", pattern_l:"#00BFFF", pattern_r:"#00BFFF", antennae:"#191970", bg:"#E0F4FF" }},
    { name: "Rose Garden",colors: { wing_tl:"#FF69B4", wing_tr:"#FF69B4", wing_bl:"#FFB6C1", wing_br:"#FFB6C1", body:"#8B0045", head:"#8B0045", pattern_l:"#FF1493", pattern_r:"#FF1493", antennae:"#8B0045", bg:"#FFF0F5" }},
  ],
  scenery: [
    { name: "Golden Hour",  colors: { sky:"#FFB347", sun:"#FFD700", cloud_l:"#FFE4B5", cloud_r:"#FFE4B5", mountain_l:"#8B7355", mountain_r:"#A0856C", mountain_m:"#6B5B45", river:"#4169E1", grass:"#228B22", tree_l:"#006400", tree_r:"#228B22", flowers:"#FF69B4" }},
    { name: "Dawn Mist",    colors: { sky:"#B0D4F1", sun:"#FFF176", cloud_l:"#FFFFFF", cloud_r:"#F5F5F5", mountain_l:"#546E7A", mountain_r:"#607D8B", mountain_m:"#455A64", river:"#29B6F6", grass:"#66BB6A", tree_l:"#388E3C", tree_r:"#2E7D32", flowers:"#EF5350" }},
    { name: "Tropical",     colors: { sky:"#00CED1", sun:"#FF8C00", cloud_l:"#FFFFFF", cloud_r:"#FAFAFA", mountain_l:"#2E7D32", mountain_r:"#388E3C", mountain_m:"#1B5E20", river:"#26C6DA", grass:"#69F0AE", tree_l:"#00E676", tree_r:"#76FF03", flowers:"#FF4081" }},
  ],
  joker: [
    { name: "Classic Jester",  colors: { bg:"#FFF9C4", hat:"#E53935", hat_bell:"#FFD600", face:"#FFECB3", hair_l:"#E53935", hair_r:"#1565C0", eye_l:"#FFFFFF", eye_r:"#FFFFFF", nose:"#FF1744", mouth:"#E53935", collar:"#1565C0", body:"#E53935", diamond_l:"#FFD600", diamond_r:"#1565C0" }},
    { name: "Purple Madness",  colors: { bg:"#F3E5F5", hat:"#7B1FA2", hat_bell:"#CE93D8", face:"#FFCCBC", hair_l:"#6A1B9A", hair_r:"#AD1457", eye_l:"#FFFFFF", eye_r:"#FFFFFF", nose:"#E91E63", mouth:"#C62828", collar:"#4A148C", body:"#7B1FA2", diamond_l:"#FF4081", diamond_r:"#CE93D8" }},
    { name: "Neon Chaos",      colors: { bg:"#1A1A2E", hat:"#FF3D00", hat_bell:"#FFFF00", face:"#FFFDE7", hair_l:"#FF3D00", hair_r:"#00E5FF", eye_l:"#FFFF00", eye_r:"#00E5FF", nose:"#FF3D00", mouth:"#FF3D00", collar:"#00E5FF", body:"#FF3D00", diamond_l:"#FFFF00", diamond_r:"#00E5FF" }},
  ],
  magician: [
    { name: "Stage Performer", colors: { bg:"#1A237E", hat:"#212121", hat_band:"#FFD600", rabbit:"#FAFAFA", face:"#FFECB3", hair:"#212121", eyes:"#1565C0", moustache:"#212121", cape:"#1A237E", cape_lining:"#C62828", wand:"#212121", stars:"#FFD600", body:"#212121" }},
    { name: "Circus Wizard",   colors: { bg:"#880E4F", hat:"#4A148C", hat_band:"#FF6F00", rabbit:"#F5F5F5", face:"#FFCC80", hair:"#BF360C", eyes:"#2E7D32", moustache:"#4E342E", cape:"#880E4F", cape_lining:"#FF6F00", wand:"#4A148C", stars:"#FFFF00", body:"#4A148C" }},
    { name: "Golden Mystic",   colors: { bg:"#263238", hat:"#37474F", hat_band:"#FFD700", rabbit:"#ECEFF1", face:"#FFE0B2", hair:"#5D4037", eyes:"#FFD700", moustache:"#3E2723", cape:"#263238", cape_lining:"#FFD700", wand:"#37474F", stars:"#FFD700", body:"#37474F" }},
  ],
  rocket: [
    { name: "Deep Space",   colors: { space:"#0D1B2A", stars_bg:"#FFFFFF", body:"#E0E0E0", nose_cone:"#EF5350", window:"#29B6F6", fin_l:"#EF5350", fin_r:"#EF5350", flame:"#FF6D00", flame_inner:"#FFFF00", planet:"#7C4DFF", moon:"#CFD8DC" }},
    { name: "Galaxy Blaze", colors: { space:"#1A0033", stars_bg:"#FFD700", body:"#00B0FF", nose_cone:"#FF4081", window:"#FFFFFF", fin_l:"#7C4DFF", fin_r:"#7C4DFF", flame:"#FF6D00", flame_inner:"#FFFF00", planet:"#FF4081", moon:"#E0E0E0" }},
    { name: "Neon Launch",  colors: { space:"#001F3F", stars_bg:"#00FFFF", body:"#FFFFFF", nose_cone:"#00E5FF", window:"#FFFF00", fin_l:"#00E5FF", fin_r:"#00E5FF", flame:"#FF3D00", flame_inner:"#FFD740", planet:"#76FF03", moon:"#B0BEC5" }},
  ],
  mermaid: [
    { name: "Coral Reef",    colors: { ocean:"#006994", tail:"#00BCD4", scales:"#0097A7", fin:"#00E5FF", body:"#FFCCBC", hair:"#FF8A65", face:"#FFECB3", eyes:"#1565C0", shell_top:"#FF80AB", bubbles:"#B3E5FC", coral:"#FF5722", seaweed:"#2E7D32" }},
    { name: "Twilight Sea",  colors: { ocean:"#1A237E", tail:"#7C4DFF", scales:"#651FFF", fin:"#AA00FF", body:"#F8BBD0", hair:"#CE93D8", face:"#FFEAEE", eyes:"#7C4DFF", shell_top:"#F06292", bubbles:"#E1BEE7", coral:"#E040FB", seaweed:"#00BFA5" }},
    { name: "Golden Depths", colors: { ocean:"#01579B", tail:"#FFD700", scales:"#FFC107", fin:"#FFEB3B", body:"#FFCCBC", hair:"#FF6F00", face:"#FFE0B2", eyes:"#01579B", shell_top:"#FF80AB", bubbles:"#E1F5FE", coral:"#FF7043", seaweed:"#00897B" }},
  ],
  dragon: [
    { name: "Fire Dragon",   colors: { bg:"#FFF3E0", body:"#C62828", belly:"#FFCCBC", wing_l:"#B71C1C", wing_r:"#B71C1C", head:"#C62828", eye_l:"#FFD700", eye_r:"#FFD700", horns:"#795548", flame:"#FF6D00", tail:"#C62828", spikes:"#FF8A65" }},
    { name: "Ice Dragon",    colors: { bg:"#E3F2FD", body:"#0288D1", belly:"#B3E5FC", wing_l:"#01579B", wing_r:"#01579B", head:"#0288D1", eye_l:"#FFFFFF", eye_r:"#FFFFFF", horns:"#B0BEC5", flame:"#80DEEA", tail:"#0277BD", spikes:"#4FC3F7" }},
    { name: "Shadow Drake",  colors: { bg:"#212121", body:"#4A148C", belly:"#CE93D8", wing_l:"#311B92", wing_r:"#311B92", head:"#4A148C", eye_l:"#FFD700", eye_r:"#FFD700", horns:"#37474F", flame:"#FF3D00", tail:"#4A148C", spikes:"#7C4DFF" }},
  ],
};

// ─── Confetti ─────────────────────────────────────────────────────
function Confetti({ active }) {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#FF3B3B","#FFD93D","#6BCB77","#4ECDC4","#C77DFF","#FF85A1","#4361EE"][i % 7],
    delay: Math.random() * 1.5,
    size: 8 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 60,
  }));
  if (!active) return null;
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-20px",
          width:p.size, height:p.size,
          background:p.color, borderRadius:"3px",
          animation:`confettiFall 2s ${p.delay}s ease-in forwards`,
          transform:`rotate(${Math.random()*360}deg)`,
        }}/>
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(100vh) translateX(${Math.random()*60-30}px) rotate(720deg); opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ─── Magic Sparkle ───────────────────────────────────────────────
function MagicOverlay({ active }) {
  if (!active) return null;
  const sparks = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    delay: Math.random()*1, size: 12 + Math.random()*16,
  }));
  return (
    <div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:50,overflow:"hidden",borderRadius:12 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          fontSize:s.size, animation:`sparkle 1.2s ${s.delay}s ease-out forwards`, opacity:0,
        }}>✨</div>
      ))}
      <style>{`@keyframes sparkle{0%{opacity:0;transform:scale(0.3) rotate(0deg)}40%{opacity:1;transform:scale(1.2) rotate(180deg)}100%{opacity:0;transform:scale(0.5) rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── SVG Coloring Canvas ──────────────────────────────────────────
function ColoringCanvas({ page, fills, onRegionClick, aiAnimating }) {
  const regions = page.regions;

  // Build the SVG for each page
  const renderSVG = () => {
    if (page.id === "cupcake")   return renderCupcake();
    if (page.id === "lion")      return renderLion();
    if (page.id === "butterfly") return renderButterfly();
    if (page.id === "scenery")   return renderScenery();
    if (page.id === "joker")     return renderJoker();
    if (page.id === "magician")  return renderMagician();
    if (page.id === "rocket")    return renderRocket();
    if (page.id === "dragon")    return renderDragon();
  };

  const getFill = (id) => fills[id] || "#FFFFFF";
  const stroke = "#1A1A2E";
  const sw = 3;

  function renderCupcake() {
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Cup base */}
        <path d="M 80 260 Q 75 340 110 370 L 250 370 Q 285 340 280 260 Z"
          fill={getFill("base")} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
          onClick={() => onRegionClick("base")} style={{cursor:"pointer"}}/>
        {/* Stripes on cup */}
        {[280,303,326,349].map((y,i) => (
          <line key={i} x1={85+(i*2)} y1={y} x2={275-(i*2)} y2={y}
            stroke={getFill("stripes") === "#FFFFFF" ? "#DDD" : getFill("stripes")}
            strokeWidth={2.5} strokeLinecap="round"
            onClick={() => onRegionClick("stripes")} style={{cursor:"pointer"}}/>
        ))}
        {/* Frosting big shape */}
        <path d="M 72 262 Q 78 195 100 175 Q 118 155 135 148 Q 155 138 178 132 Q 200 126 218 135 Q 240 148 258 168 Q 275 188 282 218 Q 288 240 288 262 Z"
          fill={getFill("frosting")} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
          onClick={() => onRegionClick("frosting")} style={{cursor:"pointer"}}/>
        {/* Swirl on frosting */}
        <path d="M 140 210 Q 160 178 185 182 Q 215 186 222 210 Q 230 232 215 248 Q 196 262 175 255 Q 153 247 148 225 Q 144 208 158 198 Q 173 188 188 194 Q 205 200 208 214"
          fill={getFill("swirl")} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"
          onClick={() => onRegionClick("swirl")} style={{cursor:"pointer"}}/>
        {/* Sprinkle ovals */}
        {[
          [112,222],[244,208],[128,252],[240,248],[175,265],
          [160,185],[210,170],[95,238],[270,233]
        ].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={9} ry={6}
            fill={getFill("dots")} stroke={stroke} strokeWidth={2}
            transform={`rotate(${i*40},${cx},${cy})`}
            onClick={() => onRegionClick("dots")} style={{cursor:"pointer"}}/>
        ))}
        {/* Cherry */}
        <circle cx={182} cy={116} r={16}
          fill={getFill("cherry")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("cherry")} style={{cursor:"pointer"}}/>
        {/* Stem */}
        <path d="M 185 100 Q 198 78 212 84" fill="none"
          stroke={getFill("stem") === "#FFFFFF" ? "#555" : getFill("stem")}
          strokeWidth={3.5} strokeLinecap="round"
          onClick={() => onRegionClick("stem")} style={{cursor:"pointer"}}/>
        {/* Bottom line */}
        <line x1={85} y1={370} x2={275} y2={370} stroke={stroke} strokeWidth={2}/>
        {/* Cup rim */}
        <path d="M 72 262 Q 180 278 288 262" fill="none" stroke={stroke} strokeWidth={sw}/>
      </svg>
    );
  }

  function renderLion() {
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Sky background */}
        <rect x={0} y={0} width={360} height={145}
          fill={getFill("bg")} stroke="none"
          onClick={() => onRegionClick("bg")} style={{cursor:"pointer"}}/>
        {/* Ground */}
        <rect x={0} y={350} width={360} height={50}
          fill={getFill("ground")} stroke={stroke} strokeWidth={2}
          onClick={() => onRegionClick("ground")} style={{cursor:"pointer"}}/>
        {/* Mane */}
        <circle cx={180} cy={192} r={105}
          fill={getFill("mane")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("mane")} style={{cursor:"pointer"}}/>
        {/* Mane spikes */}
        {Array.from({length:12},(_,i)=>{
          const angle = (i/12)*Math.PI*2;
          const cx=180+Math.cos(angle)*85, cy=192+Math.sin(angle)*85;
          const ox=180+Math.cos(angle)*115, oy=192+Math.sin(angle)*115;
          return <ellipse key={i} cx={ox} cy={oy} rx={14} ry={20}
            fill={getFill("mane")} stroke={stroke} strokeWidth={2}
            transform={`rotate(${(angle*180/Math.PI)+90},${ox},${oy})`}
            onClick={() => onRegionClick("mane")} style={{cursor:"pointer"}}/>;
        })}
        {/* Ears */}
        <path d="M 100 142 Q 82 108 108 98 Q 128 90 130 122 Z"
          fill={getFill("ears_l")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("ears_l")} style={{cursor:"pointer"}}/>
        <path d="M 260 142 Q 278 108 252 98 Q 232 90 230 122 Z"
          fill={getFill("ears_r")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("ears_r")} style={{cursor:"pointer"}}/>
        {/* Face */}
        <circle cx={180} cy={192} r={70}
          fill={getFill("face")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("face")} style={{cursor:"pointer"}}/>
        {/* Eyes */}
        <circle cx={155} cy={174} r={12}
          fill={getFill("eyes")} stroke={stroke} strokeWidth={2.5}
          onClick={() => onRegionClick("eyes")} style={{cursor:"pointer"}}/>
        <circle cx={205} cy={174} r={12}
          fill={getFill("eyes")} stroke={stroke} strokeWidth={2.5}
          onClick={() => onRegionClick("eyes")} style={{cursor:"pointer"}}/>
        {/* Pupils */}
        <circle cx={156} cy={175} r={5} fill="#111"/>
        <circle cx={206} cy={175} r={5} fill="#111"/>
        {/* Nose */}
        <ellipse cx={180} cy={207} rx={14} ry={9}
          fill={getFill("nose")} stroke={stroke} strokeWidth={2.5}
          onClick={() => onRegionClick("nose")} style={{cursor:"pointer"}}/>
        {/* Mouth */}
        <path d="M 166 225 Q 180 238 194 225" fill="none"
          stroke={getFill("mouth") === "#FFFFFF" ? stroke : getFill("mouth")}
          strokeWidth={3} strokeLinecap="round"
          onClick={() => onRegionClick("mouth")} style={{cursor:"pointer"}}/>
        {/* Whiskers */}
        {[[-40,-2,-5,2],[- 45,3,-8,8],[40,-2,5,2],[45,3,8,8]].map(([dx,dy,ox,oy],i)=>
          <line key={i} x1={180+ox} y1={212+oy} x2={180+dx} y2={212+dy}
            stroke="#888" strokeWidth={1.5} strokeLinecap="round"/>
        )}
        {/* Body */}
        <path d="M 95 290 Q 88 340 82 380 L 278 380 Q 272 340 265 290 Q 222 312 180 312 Q 138 312 95 290 Z"
          fill={getFill("body")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("body")} style={{cursor:"pointer"}}/>
        {/* Paws */}
        <path d="M 92 368 Q 76 395 96 400 Q 116 406 115 378 Z"
          fill={getFill("paws")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("paws")} style={{cursor:"pointer"}}/>
        <path d="M 268 368 Q 284 395 264 400 Q 244 406 245 378 Z"
          fill={getFill("paws")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("paws")} style={{cursor:"pointer"}}/>
        {/* Tail */}
        <path d="M 265 315 Q 318 285 330 335 Q 342 372 316 382 Q 298 388 293 372 Q 306 365 302 342 Q 298 322 272 332 Z"
          fill={getFill("tail")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("tail")} style={{cursor:"pointer"}}/>
        {/* Horizon line */}
        <line x1={0} y1={145} x2={360} y2={145} stroke={stroke} strokeWidth={1.5}/>
      </svg>
    );
  }

  function renderButterfly() {
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Background sky */}
        <rect x={0} y={0} width={360} height={400}
          fill={getFill("bg")} stroke="none"
          onClick={() => onRegionClick("bg")} style={{cursor:"pointer"}}/>
        {/* Top-left wing */}
        <path d="M 178 205 Q 118 125 78 134 Q 38 142 48 194 Q 58 244 132 224 Z"
          fill={getFill("wing_tl")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("wing_tl")} style={{cursor:"pointer"}}/>
        {/* Top-right wing */}
        <path d="M 182 205 Q 242 125 282 134 Q 322 142 312 194 Q 302 244 228 224 Z"
          fill={getFill("wing_tr")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("wing_tr")} style={{cursor:"pointer"}}/>
        {/* Bottom-left wing */}
        <path d="M 178 215 Q 128 248 102 285 Q 82 314 108 328 Q 142 338 162 298 Z"
          fill={getFill("wing_bl")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("wing_bl")} style={{cursor:"pointer"}}/>
        {/* Bottom-right wing */}
        <path d="M 182 215 Q 232 248 258 285 Q 278 314 252 328 Q 218 338 198 298 Z"
          fill={getFill("wing_br")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("wing_br")} style={{cursor:"pointer"}}/>
        {/* Wing patterns left */}
        <circle cx={110} cy={178} r={20}
          fill={getFill("pattern_l")} stroke={stroke} strokeWidth={2}
          onClick={() => onRegionClick("pattern_l")} style={{cursor:"pointer"}}/>
        <circle cx={78} cy={196} r={13}
          fill={getFill("pattern_l")} stroke={stroke} strokeWidth={2}
          onClick={() => onRegionClick("pattern_l")} style={{cursor:"pointer"}}/>
        {/* Wing patterns right */}
        <circle cx={250} cy={178} r={20}
          fill={getFill("pattern_r")} stroke={stroke} strokeWidth={2}
          onClick={() => onRegionClick("pattern_r")} style={{cursor:"pointer"}}/>
        <circle cx={282} cy={196} r={13}
          fill={getFill("pattern_r")} stroke={stroke} strokeWidth={2}
          onClick={() => onRegionClick("pattern_r")} style={{cursor:"pointer"}}/>
        {/* Body */}
        <path d="M 174 165 Q 166 200 168 252 Q 170 282 180 292 Q 190 282 192 252 Q 194 200 186 165 Z"
          fill={getFill("body")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("body")} style={{cursor:"pointer"}}/>
        {/* Head */}
        <circle cx={180} cy={153} r={16}
          fill={getFill("head")} stroke={stroke} strokeWidth={sw}
          onClick={() => onRegionClick("head")} style={{cursor:"pointer"}}/>
        {/* Antennae */}
        <path d="M 174 138 Q 155 108 145 95" fill="none"
          stroke={getFill("antennae") === "#FFFFFF" ? "#555" : getFill("antennae")}
          strokeWidth={3} strokeLinecap="round"
          onClick={() => onRegionClick("antennae")} style={{cursor:"pointer"}}/>
        <path d="M 186 138 Q 205 108 215 95" fill="none"
          stroke={getFill("antennae") === "#FFFFFF" ? "#555" : getFill("antennae")}
          strokeWidth={3} strokeLinecap="round"
          onClick={() => onRegionClick("antennae")} style={{cursor:"pointer"}}/>
        {/* Antenna tips */}
        <circle cx={144} cy={93} r={5} fill={getFill("antennae") === "#FFFFFF" ? "#555" : getFill("antennae")}/>
        <circle cx={216} cy={93} r={5} fill={getFill("antennae") === "#FFFFFF" ? "#555" : getFill("antennae")}/>
        {/* Eyes */}
        <circle cx={175} cy={150} r={4} fill="#111"/>
        <circle cx={185} cy={150} r={4} fill="#111"/>
      </svg>
    );
  }

  // ── SCENERY ──────────────────────────────────────────────────
  function renderScenery() {
    const G = (id) => ({ fill:getFill(id), onClick:()=>onRegionClick(id), style:{cursor:"pointer"} });
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Sky */}
        <rect x={0} y={0} width={360} height={240} {...G("sky")} stroke="none"/>
        {/* Sun */}
        <circle cx={290} cy={55} r={36} {...G("sun")} stroke={stroke} strokeWidth={sw}/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>{
          const r=Math.PI*a/180, x1=290+Math.cos(r)*42, y1=55+Math.sin(r)*42, x2=290+Math.cos(r)*56, y2=55+Math.sin(r)*56;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={getFill("sun")==="#FFFFFF"?"#DDD":getFill("sun")} strokeWidth={3} strokeLinecap="round" onClick={()=>onRegionClick("sun")} style={{cursor:"pointer"}}/>;
        })}
        {/* Clouds */}
        <ellipse cx={80} cy={70} rx={45} ry={22} {...G("cloud_l")} stroke={stroke} strokeWidth={2}/>
        <ellipse cx={60} cy={76} rx={28} ry={18} {...G("cloud_l")} stroke={stroke} strokeWidth={2}/>
        <ellipse cx={105} cy={76} rx={28} ry={16} {...G("cloud_l")} stroke={stroke} strokeWidth={2}/>
        <ellipse cx={220} cy={50} rx={38} ry={18} {...G("cloud_r")} stroke={stroke} strokeWidth={2}/>
        <ellipse cx={200} cy={55} rx={24} ry={14} {...G("cloud_r")} stroke={stroke} strokeWidth={2}/>
        <ellipse cx={240} cy={56} rx={24} ry={14} {...G("cloud_r")} stroke={stroke} strokeWidth={2}/>
        {/* Mountains back */}
        <path d="M -10 240 L 120 80 L 230 240 Z" {...G("mountain_l")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 150 240 L 290 70 L 380 240 Z" {...G("mountain_r")} stroke={stroke} strokeWidth={sw}/>
        {/* Mountain front */}
        <path d="M 60 240 L 180 120 L 300 240 Z" {...G("mountain_m")} stroke={stroke} strokeWidth={sw}/>
        {/* River */}
        <path d="M 155 240 Q 170 270 160 300 Q 150 330 165 360 Q 175 390 180 400 L 210 400 Q 205 370 210 340 Q 215 310 205 280 Q 195 250 205 240 Z" {...G("river")} stroke={stroke} strokeWidth={2}/>
        {/* Grass */}
        <rect x={0} y={240} width={360} height={160} {...G("grass")} stroke={stroke} strokeWidth={1.5}/>
        {/* Trees */}
        <rect x={38} y={260} width={14} height={60} fill={getFill("tree_l")==="#FFFFFF"?"#A0522D":getFill("tree_l")} stroke={stroke} strokeWidth={2} onClick={()=>onRegionClick("tree_l")} style={{cursor:"pointer"}}/>
        <polygon points="45,200 10,270 80,270" {...G("tree_l")} stroke={stroke} strokeWidth={2}/>
        <polygon points="45,225 14,285 76,285" {...G("tree_l")} stroke={stroke} strokeWidth={2}/>
        <rect x={298} y={260} width={14} height={60} fill={getFill("tree_r")==="#FFFFFF"?"#A0522D":getFill("tree_r")} stroke={stroke} strokeWidth={2} onClick={()=>onRegionClick("tree_r")} style={{cursor:"pointer"}}/>
        <polygon points="305,200 270,270 340,270" {...G("tree_r")} stroke={stroke} strokeWidth={2}/>
        <polygon points="305,225 274,285 336,285" {...G("tree_r")} stroke={stroke} strokeWidth={2}/>
        {/* Flowers */}
        {[[50,340],[90,360],[120,345],[240,355],[280,340],[310,360]].map(([cx,cy],i)=>(
          <g key={i} onClick={()=>onRegionClick("flowers")} style={{cursor:"pointer"}}>
            <circle cx={cx} cy={cy} r={8} fill={getFill("flowers")} stroke={stroke} strokeWidth={2}/>
            <circle cx={cx} cy={cy} r={4} fill="#FFD700" stroke={stroke} strokeWidth={1}/>
          </g>
        ))}
      </svg>
    );
  }

  // ── JOKER ────────────────────────────────────────────────────
  function renderJoker() {
    const G = (id) => ({ fill:getFill(id), onClick:()=>onRegionClick(id), style:{cursor:"pointer"} });
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Background */}
        <rect x={0} y={0} width={360} height={400} {...G("bg")} stroke="none"/>
        {/* Collar ruffles */}
        <path d="M 100 305 Q 90 275 120 265 Q 150 255 180 265 Q 210 255 240 265 Q 270 275 260 305 Q 240 285 210 290 Q 180 295 150 290 Q 120 285 100 305 Z" {...G("collar")} stroke={stroke} strokeWidth={sw}/>
        {/* Body / costume */}
        <path d="M 110 305 Q 90 355 85 400 L 275 400 Q 270 355 250 305 Q 220 320 180 320 Q 140 320 110 305 Z" {...G("body")} stroke={stroke} strokeWidth={sw}/>
        {/* Diamond patches on body */}
        <path d="M 135 340 L 155 325 L 175 340 L 155 355 Z" {...G("diamond_l")} stroke={stroke} strokeWidth={2}/>
        <path d="M 185 340 L 205 325 L 225 340 L 205 355 Z" {...G("diamond_r")} stroke={stroke} strokeWidth={2}/>
        {/* Neck */}
        <rect x={163} y={255} width={34} height={20} rx={6} fill={getFill("face")} stroke={stroke} strokeWidth={2} onClick={()=>onRegionClick("face")} style={{cursor:"pointer"}}/>
        {/* Face */}
        <ellipse cx={180} cy={195} rx={72} ry={80} {...G("face")} stroke={stroke} strokeWidth={sw}/>
        {/* Hair sides */}
        <path d="M 110 200 Q 85 150 108 125 Q 125 108 140 140 Q 130 165 112 185 Z" {...G("hair_l")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 250 200 Q 275 150 252 125 Q 235 108 220 140 Q 230 165 248 185 Z" {...G("hair_r")} stroke={stroke} strokeWidth={sw}/>
        {/* Hat */}
        <path d="M 115 145 Q 112 100 145 75 Q 165 55 180 50 Q 195 55 215 75 Q 248 100 245 145 Z" {...G("hat")} stroke={stroke} strokeWidth={sw}/>
        {/* Hat split colour panels */}
        <path d="M 180 50 Q 195 55 215 75 Q 248 100 245 145 L 180 145 Z" {...G("hat")} stroke="none" opacity={0.35}/>
        {/* Bell on hat tip */}
        <circle cx={180} cy={44} r={14} {...G("hat_bell")} stroke={stroke} strokeWidth={sw}/>
        <line x1={180} y1={52} x2={180} y2={58} stroke={stroke} strokeWidth={2}/>
        {/* Eyes */}
        <ellipse cx={152} cy={190} rx={18} ry={22} {...G("eye_l")} stroke={stroke} strokeWidth={2.5}/>
        <ellipse cx={208} cy={190} rx={18} ry={22} {...G("eye_r")} stroke={stroke} strokeWidth={2.5}/>
        <circle cx={153} cy={191} r={9} fill="#111"/>
        <circle cx={209} cy={191} r={9} fill="#111"/>
        <circle cx={156} cy={188} r={3} fill="white"/>
        <circle cx={212} cy={188} r={3} fill="white"/>
        {/* Nose */}
        <circle cx={180} cy={218} r={14} {...G("nose")} stroke={stroke} strokeWidth={sw}/>
        {/* Big smile */}
        <path d="M 145 240 Q 180 272 215 240" fill="none"
          stroke={getFill("mouth")==="#FFFFFF"?stroke:getFill("mouth")}
          strokeWidth={4} strokeLinecap="round"
          onClick={()=>onRegionClick("mouth")} style={{cursor:"pointer"}}/>
        {/* Mouth corners */}
        <circle cx={145} cy={240} r={5} {...G("mouth")} stroke={stroke} strokeWidth={2}/>
        <circle cx={215} cy={240} r={5} {...G("mouth")} stroke={stroke} strokeWidth={2}/>
        {/* Cheek rouge */}
        <ellipse cx={128} cy={225} rx={18} ry={10} fill={getFill("nose")} opacity={0.4} onClick={()=>onRegionClick("nose")} style={{cursor:"pointer"}}/>
        <ellipse cx={232} cy={225} rx={18} ry={10} fill={getFill("nose")} opacity={0.4} onClick={()=>onRegionClick("nose")} style={{cursor:"pointer"}}/>
      </svg>
    );
  }

  // ── MAGICIAN ─────────────────────────────────────────────────
  function renderMagician() {
    const G = (id) => ({ fill:getFill(id), onClick:()=>onRegionClick(id), style:{cursor:"pointer"} });
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Background stage curtain */}
        <rect x={0} y={0} width={360} height={400} {...G("bg")} stroke="none"/>
        {/* Stars floating */}
        {[[40,60],[310,45],[25,160],[330,140],[50,300],[320,290],[180,30]].map(([cx,cy],i)=>(
          <text key={i} x={cx} y={cy} fontSize={18} textAnchor="middle"
            fill={getFill("stars")==="#FFFFFF"?"#FFD700":getFill("stars")}
            onClick={()=>onRegionClick("stars")} style={{cursor:"pointer"}}>★</text>
        ))}
        {/* Cape back */}
        <path d="M 75 220 Q 40 310 50 400 L 310 400 Q 320 310 285 220 Q 240 250 180 255 Q 120 250 75 220 Z" {...G("cape")} stroke={stroke} strokeWidth={sw}/>
        {/* Cape lining */}
        <path d="M 80 228 Q 55 305 62 390 L 95 390 Q 88 310 105 250 Z" {...G("cape_lining")} stroke={stroke} strokeWidth={2}/>
        <path d="M 280 228 Q 305 305 298 390 L 265 390 Q 272 310 255 250 Z" {...G("cape_lining")} stroke={stroke} strokeWidth={2}/>
        {/* Body / suit */}
        <path d="M 118 220 Q 108 260 108 310 L 252 310 Q 252 260 242 220 Q 215 238 180 240 Q 145 238 118 220 Z" {...G("body")} stroke={stroke} strokeWidth={sw}/>
        {/* Collar / bow tie */}
        <path d="M 155 220 L 170 235 L 180 230 L 190 235 L 205 220 Q 193 215 180 218 Q 167 215 155 220 Z" {...G("cape_lining")} stroke={stroke} strokeWidth={2}/>
        {/* Neck */}
        <rect x={163} y={205} width={34} height={22} rx={6} fill={getFill("face")} stroke={stroke} strokeWidth={2} onClick={()=>onRegionClick("face")} style={{cursor:"pointer"}}/>
        {/* Face */}
        <ellipse cx={180} cy={158} rx={65} ry={72} {...G("face")} stroke={stroke} strokeWidth={sw}/>
        {/* Hair */}
        <path d="M 116 150 Q 112 105 140 90 Q 160 78 180 82 Q 200 78 220 90 Q 248 105 244 150 Q 224 135 200 130 Q 180 128 160 130 Q 136 135 116 150 Z" {...G("hair")} stroke={stroke} strokeWidth={sw}/>
        {/* Top hat */}
        <rect x={125} y={68} width={110} height={68} rx={5} {...G("hat")} stroke={stroke} strokeWidth={sw}/>
        <rect x={108} y={130} width={144} height={16} rx={6} {...G("hat")} stroke={stroke} strokeWidth={sw}/>
        {/* Hat band */}
        <rect x={125} y={118} width={110} height={12} {...G("hat_band")} stroke={stroke} strokeWidth={2}/>
        {/* Rabbit peeking from hat */}
        <ellipse cx={180} cy={72} rx={22} ry={18} {...G("rabbit")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 165 60 Q 160 30 168 20 Q 173 14 178 22 Q 180 28 178 60 Z" {...G("rabbit")} stroke={stroke} strokeWidth={2}/>
        <path d="M 195 60 Q 200 30 192 20 Q 187 14 182 22 Q 180 28 182 60 Z" {...G("rabbit")} stroke={stroke} strokeWidth={2}/>
        <circle cx={180} cy={74} r={5} fill="#FF69B4" stroke={stroke} strokeWidth={1.5}/>
        <circle cx={173} cy={70} r={3} fill="#333"/>
        <circle cx={187} cy={70} r={3} fill="#333"/>
        {/* Eyes */}
        <circle cx={158} cy={150} r={11} {...G("eyes")} stroke={stroke} strokeWidth={2.5}/>
        <circle cx={202} cy={150} r={11} {...G("eyes")} stroke={stroke} strokeWidth={2.5}/>
        <circle cx={159} cy={151} r={5} fill="#111"/>
        <circle cx={203} cy={151} r={5} fill="#111"/>
        {/* Moustache */}
        <path d="M 155 180 Q 170 172 180 176 Q 190 172 205 180" fill="none"
          stroke={getFill("moustache")==="#FFFFFF"?"#333":getFill("moustache")}
          strokeWidth={4} strokeLinecap="round"
          onClick={()=>onRegionClick("moustache")} style={{cursor:"pointer"}}/>
        {/* Smile */}
        <path d="M 162 192 Q 180 205 198 192" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round"/>
        {/* Wand */}
        <line x1={248} y1={185} x2={335} y2={140} stroke={getFill("wand")==="#FFFFFF"?"#333":getFill("wand")} strokeWidth={6} strokeLinecap="round" onClick={()=>onRegionClick("wand")} style={{cursor:"pointer"}}/>
        <circle cx={335} cy={140} r={10} fill={getFill("hat_band")} stroke={stroke} strokeWidth={2} onClick={()=>onRegionClick("hat_band")} style={{cursor:"pointer"}}/>
      </svg>
    );
  }

  // ── ROCKET ───────────────────────────────────────────────────
  function renderRocket() {
    const G = (id) => ({ fill:getFill(id), onClick:()=>onRegionClick(id), style:{cursor:"pointer"} });
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Space bg */}
        <rect x={0} y={0} width={360} height={400} {...G("space")} stroke="none"/>
        {/* Stars */}
        {[[30,30],[80,15],[150,25],[240,10],[300,35],[340,20],[15,80],[350,100],
          [20,180],[345,200],[10,280],[355,300],[30,350],[320,370],[160,380]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r={i%3===0?3:2}
            fill={getFill("stars_bg")==="#FFFFFF"?"#FFF":getFill("stars_bg")}
            onClick={()=>onRegionClick("stars_bg")} style={{cursor:"pointer"}}/>
        ))}
        {/* Planet */}
        <circle cx={60} cy={90} r={40} {...G("planet")} stroke={stroke} strokeWidth={sw}/>
        <ellipse cx={60} cy={90} rx={58} ry={14} fill="none" stroke={getFill("planet")==="#FFFFFF"?"#999":getFill("planet")} strokeWidth={5} onClick={()=>onRegionClick("planet")} style={{cursor:"pointer"}}/>
        {/* Moon */}
        <circle cx={300} cy={300} r={30} {...G("moon")} stroke={stroke} strokeWidth={sw}/>
        <circle cx={290} cy={294} r={6} fill={getFill("space")} opacity={0.5}/>
        <circle cx={308} cy={308} r={4} fill={getFill("space")} opacity={0.4}/>
        {/* Rocket body */}
        <path d="M 148 340 Q 140 260 160 180 Q 170 140 180 110 Q 190 140 200 180 Q 220 260 212 340 Z" {...G("body")} stroke={stroke} strokeWidth={sw}/>
        {/* Nose cone */}
        <path d="M 160 180 Q 165 140 180 110 Q 195 140 200 180 Z" {...G("nose_cone")} stroke={stroke} strokeWidth={sw}/>
        {/* Window */}
        <circle cx={180} cy={220} r={24} {...G("window")} stroke={stroke} strokeWidth={sw}/>
        <circle cx={180} cy={220} r={16} fill="none" stroke={stroke} strokeWidth={1.5}/>
        {/* Fins */}
        <path d="M 148 340 Q 120 355 112 330 Q 118 305 148 300 Z" {...G("fin_l")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 212 340 Q 240 355 248 330 Q 242 305 212 300 Z" {...G("fin_r")} stroke={stroke} strokeWidth={sw}/>
        {/* Flame outer */}
        <path d="M 155 340 Q 145 365 155 390 Q 165 405 180 400 Q 195 405 205 390 Q 215 365 205 340 Z" {...G("flame")} stroke={stroke} strokeWidth={2}/>
        {/* Flame inner */}
        <path d="M 163 340 Q 158 360 163 378 Q 170 390 180 388 Q 190 390 197 378 Q 202 360 197 340 Z" {...G("flame_inner")} stroke="none"/>
      </svg>
    );
  }   
      // ── DRAGON ───────────────────────────────────────────────────
  function renderDragon() {
    const G = (id) => ({ fill:getFill(id), onClick:()=>onRegionClick(id), style:{cursor:"pointer"} });
    return (
      <svg viewBox="0 0 360 400" width="100%" height="100%" style={{display:"block"}}>
        {/* Background */}
        <rect x={0} y={0} width={360} height={400} {...G("bg")} stroke="none"/>
        {/* Tail */}
        <path d="M 255 280 Q 310 300 330 280 Q 355 255 340 230 Q 328 210 305 225 Q 290 238 288 258 Z" {...G("tail")} stroke={stroke} strokeWidth={sw}/>
        {/* Tail spikes */}
        {[[320,248],[308,232],[295,225]].map(([cx,cy],i)=>(
          <polygon key={i} points={`${cx},${cy} ${cx-8},${cy-18} ${cx+8},${cy-18}`}
            {...G("spikes")} stroke={stroke} strokeWidth={2}/>
        ))}
        {/* Left wing */}
        <path d="M 115 200 Q 55 155 30 100 Q 22 70 55 75 Q 85 80 105 120 Q 118 152 125 180 Z" {...G("wing_l")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 105 120 Q 75 115 60 130 M 118 152 Q 92 150 80 165" fill="none" stroke={stroke} strokeWidth={2}/>
        {/* Right wing */}
        <path d="M 245 200 Q 305 155 330 100 Q 338 70 305 75 Q 275 80 255 120 Q 242 152 235 180 Z" {...G("wing_r")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 255 120 Q 285 115 300 130 M 242 152 Q 268 150 280 165" fill="none" stroke={stroke} strokeWidth={2}/>
        {/* Body */}
        <path d="M 118 295 Q 108 355 105 400 L 255 400 Q 252 355 242 295 Q 215 318 180 320 Q 145 318 118 295 Z" {...G("body")} stroke={stroke} strokeWidth={sw}/>
        {/* Belly scales */}
        <path d="M 128 300 Q 140 285 180 282 Q 220 285 232 300 Q 218 308 180 310 Q 142 308 128 300 Z" {...G("belly")} stroke={stroke} strokeWidth={2}/>
        {[[155,332],[180,325],[205,332],[158,355],[202,355],[180,370]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={16} ry={10} {...G("belly")} stroke={stroke} strokeWidth={1.5}/>
        ))}
        {/* Back spikes */}
        {[[145,255],[162,232],[178,215],[194,232],[215,255]].map(([cx,cy],i)=>(
          <polygon key={i} points={`${cx},${cy} ${cx-7},${cy-20} ${cx+7},${cy-20}`}
            {...G("spikes")} stroke={stroke} strokeWidth={2}/>
        ))}
        {/* Neck + Head join */}
        <path d="M 145 258 Q 140 225 145 200 Q 155 180 180 175 Q 205 180 215 200 Q 220 225 215 258 Q 200 248 180 246 Q 160 248 145 258 Z" {...G("body")} stroke={stroke} strokeWidth={sw}/>
        {/* Head */}
        <path d="M 130 175 Q 128 130 145 110 Q 160 92 180 88 Q 200 92 215 110 Q 232 130 230 175 Q 215 162 180 160 Q 145 162 130 175 Z" {...G("head")} stroke={stroke} strokeWidth={sw}/>
        {/* Snout */}
        <path d="M 155 168 Q 148 188 155 202 Q 165 212 180 213 Q 195 212 205 202 Q 212 188 205 168 Z" {...G("head")} stroke={stroke} strokeWidth={2}/>
        {/* Nostrils */}
        <ellipse cx={168} cy={200} rx={5} ry={3} fill="#555" stroke={stroke} strokeWidth={1}/>
        <ellipse cx={192} cy={200} rx={5} ry={3} fill="#555" stroke={stroke} strokeWidth={1}/>
        {/* Horns */}
        <path d="M 150 110 Q 138 80 148 60 Q 155 44 162 62 Q 162 80 155 110 Z" {...G("horns")} stroke={stroke} strokeWidth={sw}/>
        <path d="M 210 110 Q 222 80 212 60 Q 205 44 198 62 Q 198 80 205 110 Z" {...G("horns")} stroke={stroke} strokeWidth={sw}/>
        {/* Eyes */}
        <ellipse cx={152} cy={148} rx={16} ry={18} {...G("eye_l")} stroke={stroke} strokeWidth={2.5}/>
        <ellipse cx={208} cy={148} rx={16} ry={18} {...G("eye_r")} stroke={stroke} strokeWidth={2.5}/>
        <ellipse cx={153} cy={149} rx={8} ry={10} fill="#111"/>
        <ellipse cx={209} cy={149} rx={8} ry={10} fill="#111"/>
        <circle cx={155} cy={145} r={3} fill="white"/>
        {/* Fire breath */}
        <path d="M 162 210 Q 130 225 110 245 Q 85 270 75 300 Q 65 320 78 330 Q 92 338 108 318 Q 118 300 130 280 Q 148 255 168 240 Z" {...G("flame")} stroke={stroke} strokeWidth={2}/>
        <path d="M 162 210 Q 135 228 118 250 Q 100 272 95 298 Q 90 318 103 322 Q 114 313 122 293 Q 138 265 158 242 Z" fill={getFill("flame")} opacity={0.6} stroke="none" onClick={()=>onRegionClick("flame")} style={{cursor:"pointer"}}/>
        {/* Flame tip */}
        <path d="M 75 300 Q 60 318 68 335 Q 78 347 90 338 Q 92 330 84 320 Q 78 314 80 305 Z"
          fill={getFill("flame")==="#FFFFFF"?"#FF8C00":getFill("flame")} stroke="none"
          onClick={()=>onRegionClick("flame")} style={{cursor:"pointer"}}/>
      </svg>
    );
  }

  return (
    <div style={{position:"relative",width:"100%",height:"100%"}}>
      {renderSVG()}
      <MagicOverlay active={aiAnimating}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function ColoringGame({ onBack }) {
  const { pause, play } = useBgMusic(true);
   useEffect(() => {
    pause(); // 🔇 stop music when Drawing opens

    return () => {
      play(); // 🔊 resume when leaving Drawing
    };
  }, []);
  const [screen, setScreen] = useState("menu"); // menu | game
  const [activePage, setActivePage] = useState(null);
  const [fills, setFills] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#FF3B3B");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnimating, setAiAnimating] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiSchemes, setAiSchemes] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [colorSchemeIdx, setColorSchemeIdx] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const paletteRef = useRef(null);
  const scrollColorRef = useRef(0);

  // Init fills when page changes
  useEffect(() => {
    if (!activePage) return;
    const defaultFills = {};
    activePage.regions.forEach(r => { defaultFills[r.id] = "#FFFFFF"; });
    setFills(defaultFills);
    setHistory([]);
  }, [activePage]);

  // Music toggle
  useEffect(() => {
    if (musicOn && screen === "game") startBgMusic();
    else stopBgMusic();
    return () => stopBgMusic();
  }, [musicOn, screen]);

  const openPage = (page) => {
    setActivePage(page);
    setScreen("game");
    setShowAiPanel(false);
    setAiMessage("");
    playTone(523, "sine", 0.15, 0.2);
    setTimeout(() => playTone(659, "sine", 0.15, 0.18), 120);
  };

  const goBack = () => {
    setScreen("menu");
    stopBgMusic();
    setMusicOn(false);
    playUndoSound();
    if (onBack) onBack();
  };

  const handleRegionClick = (regionId) => {
    setHistory(h => [...h, { ...fills }]);
    setFills(f => ({ ...f, [regionId]: selectedColor }));
    playFillSound();

    // Check completion
    const newFills = { ...fills, [regionId]: selectedColor };
    const allColored = activePage.regions.every(r => newFills[r.id] !== "#FFFFFF");
    if (allColored) {
      setTimeout(() => {
        playCelebration();
        setConfetti(true);
        setTimeout(() => setConfetti(false), 4000);
      }, 200);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    playUndoSound();
    const prev = history[history.length - 1];
    setFills(prev);
    setHistory(h => h.slice(0, -1));
  };

  const handleReset = () => {
    playUndoSound();
    const defaultFills = {};
    activePage.regions.forEach(r => { defaultFills[r.id] = "#FFFFFF"; });
    setFills(defaultFills);
    setHistory([]);
  };

  // AI Magic Color — calls Claude API
  const handleMagicColor = async () => {
    setShowAiPanel(true);
    setAiLoading(true);
    setAiMessage("");
    playMagicSound();

    // Use preset schemes + call Claude for a fun message
    const schemes = AI_SCHEMES[activePage.id] || [];
    setAiSchemes(schemes);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `You are a fun coloring assistant for kids. The child is coloring a ${activePage.name}. Give them 1-2 sentences of encouragement and suggest what colors would look magical on it. Keep it super fun and playful with emojis! Be brief (under 50 words).`
          }]
        })
      });
      const data = await res.json();
      const msg = data.content?.find(b => b.type === "text")?.text || "Your artwork looks amazing! 🌈✨";
      setAiMessage(msg);
    } catch {
      setAiMessage(`Wow, your ${activePage.name} is going to be SO colorful! Try mixing bright and pastel shades for a magical effect! 🎨✨`);
    }
    setAiLoading(false);
  };

  const applyAiScheme = (scheme) => {
    playMagicSound();
    setAiAnimating(true);
    setHistory(h => [...h, { ...fills }]);
    
    // Apply colors one by one with delay for animation effect
    const keys = Object.keys(scheme.colors);
    keys.forEach((key, i) => {
      setTimeout(() => {
        setFills(f => ({ ...f, [key]: scheme.colors[key] }));
        if (i === keys.length - 1) {
          setAiAnimating(false);
          playCelebration();
          setConfetti(true);
          setTimeout(() => setConfetti(false), 3500);
        }
      }, i * 80);
    });
    setShowAiPanel(false);
  };

  // ── MENU SCREEN ─────────────────────────────────────────────
  const [menuFilter, setMenuFilter] = useState("All");
  const categories = ["All","Sweet","Animals","Nature","Fun","Magic","Space","Fantasy"];
  const filteredPages = menuFilter === "All" ? PAGES : PAGES.filter(p => p.tag === menuFilter);

  if (screen === "menu") {
    return (
      <div style={{
        width:"100vw", height:"100vh", background:"#E91E7A",
        display:"flex", flexDirection:"column", alignItems:"center",
        fontFamily:"'Fredoka One', 'Nunito', cursive",
        overflow:"hidden", position:"relative",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width:4px; height:4px; }
          ::-webkit-scrollbar-track { background:transparent; }
          ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.35); border-radius:10px; }
          .page-card { transition: transform 0.18s, box-shadow 0.18s; cursor:pointer; }
          .page-card:hover { transform: scale(1.06) rotate(-1.5deg); box-shadow: 0 18px 40px rgba(0,0,0,0.4) !important; }
          .cat-btn { transition: all 0.15s; cursor:pointer; border:none; }
          .cat-btn:hover { transform:scale(1.08); }
          .cat-btn:active { transform:scale(0.95); }
        `}</style>

        {/* Header */}
        <div style={{
          width:"100%", padding:"14px 20px 0",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexShrink:0,
        }}>
          <div style={{
            background:"rgba(255,255,255,0.25)", borderRadius:50,
            padding:"5px 16px", color:"white", fontSize:"0.9rem", fontWeight:800,
            border:"2px solid rgba(255,255,255,0.5)",
          }}>✨ New</div>
          <div style={{ color:"white", fontSize:"1.5rem", fontWeight:900,
            textShadow:"0 3px 10px rgba(0,0,0,0.3)" }}>🎨 Coloring Studio</div>
          <div style={{
            background:"#8B0054", borderRadius:50, padding:"5px 14px",
            color:"white", fontSize:"0.85rem",
            border:"2px solid rgba(255,255,255,0.3)",
          }}>Art & Colors</div>
        </div>

        {/* Mascot */}
        <div style={{ textAlign:"center", padding:"8px 0 4px", flexShrink:0 }}>
          <div style={{ fontSize:"4.5rem", filter:"drop-shadow(0 5px 14px rgba(0,0,0,0.3))",
            animation:"mascotBounce 2.2s ease-in-out infinite" }}>🎨</div>
          <div style={{ color:"rgba(255,255,255,0.85)", fontSize:"0.95rem",
            fontFamily:"Nunito, sans-serif", fontWeight:700 }}>
            {PAGES.length} paintings to colour • Tap to begin!
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{
          display:"flex", gap:8, padding:"8px 16px",
          overflowX:"auto", width:"100%", flexShrink:0,
        }}>
          {categories.map(cat => (
            <button key={cat} className="cat-btn"
              onClick={() => setMenuFilter(cat)}
              style={{
                flexShrink:0,
                padding:"6px 16px", borderRadius:50,
                background: menuFilter===cat ? "white" : "rgba(255,255,255,0.22)",
                color: menuFilter===cat ? "#E91E7A" : "white",
                fontSize:"0.82rem", fontFamily:"Fredoka One, cursive",
                fontWeight: menuFilter===cat ? 900 : 600,
                boxShadow: menuFilter===cat ? "0 3px 12px rgba(0,0,0,0.25)" : "none",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of cards */}
        <div style={{
          flex:1, overflowY:"auto", width:"100%",
          padding:"8px 14px 24px",
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(2, 1fr)",
            gap:14,
          }}>
            {filteredPages.map((page, i) => (
              <div key={page.id} className="page-card" onClick={() => openPage(page)}
                style={{
                  background:"white", borderRadius:22,
                  overflow:"hidden",
                  boxShadow:"0 6px 22px rgba(0,0,0,0.28)",
                  display:"flex", flexDirection:"column",
                }}>
                {/* Emoji preview */}
                <div style={{
                  height:110, background: page.bg || "#FFE0EE",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative",
                }}>
                  <div style={{
                    fontSize:"4.2rem",
                    filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
                    animation:"float 3s ease-in-out infinite",
                    animationDelay:`${i * 0.35}s`,
                  }}>{page.emoji}</div>
                  {/* Tag badge */}
                  <div style={{
                    position:"absolute", top:8, right:8,
                    background:"rgba(0,0,0,0.55)", color:"white",
                    borderRadius:20, padding:"2px 9px", fontSize:"0.62rem",
                    fontFamily:"Nunito, sans-serif",
                  }}>{page.tag}</div>
                </div>
                {/* Info */}
                <div style={{ padding:"10px 12px 12px" }}>
                  <div style={{ fontSize:"1.15rem", color:"#1A1A2E", marginBottom:2 }}>{page.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"#999", fontFamily:"Nunito, sans-serif", marginBottom:8 }}>
                    {page.regions.length} regions
                  </div>
                  <div style={{
                    background:"linear-gradient(90deg, #E91E7A, #9C27B0)",
                    color:"white", borderRadius:30, padding:"7px 0",
                    textAlign:"center", fontSize:"0.82rem",
                    boxShadow:"0 3px 10px rgba(233,30,122,0.38)",
                  }}>🎨 Paint Now</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes mascotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-7px) scale(1.06)} }
        `}</style>
      </div>
    );
  }

  // ── GAME SCREEN ─────────────────────────────────────────────
  const filledCount = Object.values(fills).filter(c => c !== "#FFFFFF").length;
  const totalRegions = activePage?.regions.length || 1;
  const progress = Math.round((filledCount / totalRegions) * 100);

  return (
    <div style={{
      width:"100vw", height:"100vh",
      background:"#0D1B2A",
      display:"flex", flexDirection:"column",
      fontFamily:"'Fredoka One', cursive",
      overflow:"hidden",
      position:"relative",
    }}>


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        * { box-sizing:border-box; }
        .color-chip { transition: transform 0.15s, box-shadow 0.15s; cursor:pointer; }
        .color-chip:hover { transform: scale(1.15); }
        .color-chip:active { transform: scale(0.92); }
        .action-btn { transition: transform 0.15s, opacity 0.15s; cursor:pointer; }
        .action-btn:hover { transform: scale(1.1); }
        .action-btn:active { transform: scale(0.9); }
        .color-palette-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .color-palette-scroll::-webkit-scrollbar { height:0; }
        .scheme-card { transition: transform 0.15s, box-shadow 0.15s; cursor:pointer; }
        .scheme-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }
      `}</style>

      <Confetti active={confetti}/>

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <div style={{
        background:"#0D1B2A", padding:"10px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"2px solid #1E3A5F", flexShrink:0,
      }}>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
          <span style={{ color:"#888", fontSize:"0.75rem" }}>Progress</span>
          <div style={{ flex:1, height:8, background:"#1E3A5F", borderRadius:10, overflow:"hidden", maxWidth:100 }}>
            <div style={{ width:`${progress}%`, height:"100%",
              background:"linear-gradient(90deg,#6BCB77,#4ECDC4)", borderRadius:10,
              transition:"width 0.4s ease" }}/>
          </div>
          <span style={{ color:"#6BCB77", fontSize:"0.75rem" }}>{progress}%</span>
        </div>

        {/* Title */}
        <div style={{ color:"white", fontSize:"1.1rem", textAlign:"center" }}>
          {activePage?.emoji} {activePage?.name}
        </div>

        {/* Close */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Music */}
          <button onClick={() => setMusicOn(m => !m)} className="action-btn"
            style={{
              width:36, height:36, borderRadius:"50%",
              background: musicOn ? "#6BCB77" : "#1E3A5F",
              border:"none", color:"white", fontSize:"1rem",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
            {musicOn ? "🎵" : "🔇"}
          </button>
          <button onClick={goBack} className="action-btn"
            style={{
              width:36, height:36, borderRadius:"50%",
              background:"#9C27B0", border:"none",
              color:"white", fontSize:"1.2rem",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 3px 10px rgba(156,39,176,0.5)",
            }}>✕</button>
        </div>
      </div>

      {/* ── CANVAS AREA ──────────────────────────────────────── */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        background:"white", overflow:"hidden", position:"relative",
        margin:"0 0", minHeight:0,
      }}>
        <div style={{ width:"100%", height:"100%", maxWidth:500, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ColoringCanvas
            page={activePage}
            fills={fills}
            onRegionClick={handleRegionClick}
            aiAnimating={aiAnimating}
          />
        </div>

        {/* AI Praise popup */}
        {aiMessage && !showAiPanel && (
          <div style={{
            position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
            background:"rgba(26,26,46,0.95)", color:"white", borderRadius:16,
            padding:"10px 16px", fontSize:"0.85rem", maxWidth:"88%", textAlign:"center",
            border:"2px solid #C77DFF", boxShadow:"0 4px 20px rgba(199,125,255,0.4)",
            animation:"slideDown 0.3s ease",
          }}>
            <span style={{fontSize:"1.1rem"}}>🤖 </span>{aiMessage}
            <button onClick={() => setAiMessage("")}
              style={{ marginLeft:8, background:"none", border:"none", color:"#C77DFF", cursor:"pointer", fontSize:"1rem" }}>✕</button>
          </div>
        )}
      </div>

      {/* ── COLOR PALETTE ROW ─────────────────────────────────── */}
      <div style={{
        background:"#1A2744", borderTop:"2px solid #253556",
        padding:"10px 0 8px", flexShrink:0,
      }}>
        <div ref={paletteRef} className="color-palette-scroll"
          style={{ display:"flex", gap:10, padding:"0 14px", overflowX:"auto" }}>
          {ALL_COLORS.map((color) => (
            <div key={color} className="color-chip"
              onClick={() => { setSelectedColor(color); playColorSelect(); }}
              style={{
                flexShrink:0,
                width:52, height:52,
                background:color,
                borderRadius:14,
                border: selectedColor === color
                  ? "3.5px solid white"
                  : color === "#FFFFFF" ? "3.5px solid #555" : "3.5px solid transparent",
                boxShadow: selectedColor === color
                  ? "0 0 0 3px #4361EE, 0 4px 12px rgba(0,0,0,0.4)"
                  : "0 3px 8px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── BOTTOM TOOLBAR ────────────────────────────────────── */}
      <div style={{
        background:"#132233", padding:"10px 20px 14px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, gap:10,
      }}>
      

        {/* Undo + Reset stacked */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <button className="action-btn" onClick={handleUndo}
            style={{
              width:44, height:44, borderRadius:"50%",
              background:"#2980B9", border:"none",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 3px 12px rgba(41,128,185,0.5)",
            }}>
            <span style={{ fontSize:"1.1rem" }}>↩</span>
          </button>
          <button className="action-btn" onClick={handleReset}
            style={{
              width:44, height:44, borderRadius:"50%",
              background:"#E74C3C", border:"none",
               display:"flex", alignItems:"center", justifyContent:"center",
               boxShadow:"0 3px 12px rgba(231,76,60,0.5)",
               }}>
              <span style={{ fontSize:"0.9rem" }}>🗑</span>
              </button>
        </div>

        {/* Selected Color Display */}
        <div style={{
          width:64, height:64, borderRadius:18,
          background:selectedColor,
          border: selectedColor === "#FFFFFF" ? "3px solid #555" : "3px solid rgba(255,255,255,0.4)",
          boxShadow:`0 6px 20px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15)`,
          flexShrink:0,
        }}/>

        {/* Magic AI Button */}
        <button className="action-btn" onClick={handleMagicColor}
          style={{
            width:62, height:62, borderRadius:18,
            background: aiLoading
              ? "#555"
              : "linear-gradient(135deg, #9C27B0, #673AB7)",
            border:"none", color:"white",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:2, boxShadow:"0 5px 16px rgba(156,39,176,0.5)",
            fontSize:"0.65rem",
          }}>
          {aiLoading ? (
            <div style={{ fontSize:"1.4rem", animation:"spin 1s linear infinite" }}>⚙️</div>
          ) : (
            <>
              <span style={{ fontSize:"1.4rem" }}>🪄</span>
              <span>Magic</span>
            </>
          )}
        </button>

        {/* Brush mode indicator */}
        <div style={{
          width:56, height:56, borderRadius:"50%",
          background:"#2980B9",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 14px rgba(41,128,185,0.5)",
          gap:2,
        }}>
          <span style={{ fontSize:"1.3rem" }}>🪣</span>
          <span style={{ fontSize:"0.55rem", color:"white" }}>Fill</span>
        </div>
      </div>

      {/* ── AI SCHEME PANEL ───────────────────────────────────── */}
      {showAiPanel && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          zIndex:200, backdropFilter:"blur(4px)",
        }} onClick={() => setShowAiPanel(false)}>
          <div style={{
            background:"#1A2744", borderRadius:"28px 28px 0 0",
            padding:"24px 20px 32px", width:"100%", maxWidth:500,
            boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",
            animation:"slideUp 0.3s ease",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, background:"#444", borderRadius:10, margin:"0 auto 20px" }}/>
            <div style={{ color:"white", fontSize:"1.4rem", marginBottom:8, textAlign:"center" }}>
              🪄 Magic Color Schemes
            </div>
            {aiLoading ? (
              <div style={{ textAlign:"center", color:"#C77DFF", padding:"20px 0", fontSize:"1rem" }}>
                AI is thinking of beautiful colors… ✨
              </div>
            ) : (
              <>
                {aiMessage && (
                  <div style={{
                    background:"rgba(199,125,255,0.15)", borderRadius:14,
                    padding:"10px 14px", color:"#E0C8FF",
                    fontSize:"0.85rem", marginBottom:16, textAlign:"center",
                    border:"1px solid rgba(199,125,255,0.3)",
                  }}>
                    🤖 {aiMessage}
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {aiSchemes.map((scheme, i) => (
                    <div key={i} className="scheme-card"
                      onClick={() => applyAiScheme(scheme)}
                      style={{
                        background:"#253556", borderRadius:16,
                        padding:"12px 16px",
                        display:"flex", alignItems:"center", gap:12,
                        boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
                        border:"2px solid transparent",
                      }}>
                      <div style={{ display:"flex", gap:5 }}>
                        {Object.values(scheme.colors).slice(0,6).map((c,ci) => (
                          <div key={ci} style={{
                            width:24, height:24, borderRadius:8, background:c,
                            border:"2px solid rgba(255,255,255,0.3)",
                          }}/>
                        ))}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ color:"white", fontSize:"1rem" }}>{scheme.name}</div>
                      </div>
                      <div style={{ color:"#C77DFF", fontSize:"1.4rem" }}>→</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setShowAiPanel(false)}
              style={{
                marginTop:20, width:"100%", padding:"12px",
                background:"#E74C3C", border:"none", borderRadius:50,
                color:"white", fontSize:"1rem", cursor:"pointer",
                boxShadow:"0 4px 14px rgba(231,76,60,0.4)",
              }}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  );
}
