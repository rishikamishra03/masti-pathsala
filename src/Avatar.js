import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Audio Engine ────────────────────────────────────────────────────────────
const AudioCtx = typeof window !== "undefined" ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playTone(freq = 440, type = "sine", duration = 0.12, vol = 0.18) {
  if (!AudioCtx) return;
  try {
    const o = AudioCtx.createOscillator();
    const g = AudioCtx.createGain();
    o.connect(g); g.connect(AudioCtx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, AudioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AudioCtx.currentTime + duration);
    o.start(); o.stop(AudioCtx.currentTime + duration);
  } catch {}
}

function playClick()  { playTone(520, "sine",     0.08, 0.15); }
function playSelect() { playTone(660, "triangle", 0.14, 0.18); }
function playDone()   {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playTone(f, "sine", 0.18, 0.22), i * 100)
  );
}

// ─── Data Options ────────────────────────────────────────────────────────────
const SKIN_COLORS = ["#FFE500","#FDDBB4","#F9C799","#F5B483","#ECA070","#E8885A","#D4704A","#C45C3A","#A0422A","#7B3020","#5C2018","#3D1010"];
const HAIR_COLORS = ["#1a1a1a","#3d1c02","#6b3a2a","#8b4513","#c68642","#e8a85e","#f5d060","#d4a017","#4a0e5c","#b22222","#1c3d5a","#f0f0f0", "#FF6B9D", "#00BCD4", "#8BC34A"];
const EYE_COLORS  = ["#3d1c02","#1a3d1c","#1c3d5a","#4a0e5c","#c68642","#8b4513","#222222","#b22222","#0a5c36","#2255aa", "#9C27B0", "#FF9800"];
const TOP_COLORS  = ["#7b2d8b","#e05050","#3a7bd5","#27ae60","#e67e22","#f39c12","#1abc9c","#e91e8c","#34495e","#ffffff","#ff6b9d","#00bcd4", "#FFEB3B"];
const BOTTOM_COLORS=["#5b9bd5","#4a7c4e","#8b6914","#c0392b","#6c3483","#2c3e50","#7f8c8d","#d35400","#1abc9c","#273746", "#F06292"];
const SHOES_COLORS= ["#2c3e50","#ffffff","#c0392b","#f39c12","#1abc9c","#8e44ad","#e91e8c","#f5f5f5", "#4CAF50"];
const BG_COLORS   = [
  "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)",
  "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
  "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)",
  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
];

const HAIR_STYLES = ["none","short","messy","curly","long","pigtails","bun","afro","braids","spiky","twintails","undercut"];
const EYE_STYLES  = ["round","happy","stars","cool","cute","wink","anime","tired"];
const MOUTH_STYLES= ["smile","laugh","cat","open","smirk","tongue","surprised"];
const TOP_STYLES  = ["tshirt","hoodie","dress","sweater","tanktop","jacket","suit"];
const BOTTOM_STYLES=["shorts","pants","skirt","jeans","sweatpants"];
const SHOES_STYLES= ["sneakers","boots","flats","sandals","crocs"];
const ACCESSORIES = ["none","glasses","sunglasses","cap","bow","mask","headband","necklace"];
const COMPANIONS  = ["none","cat","dog","bird"];

// ─── Beautiful Chibi SVG Drawing Components ─────────────────────────────────

function ChibiHair({ style, color, cx, cy }) {
  if (style === "none") return null;
  const c = color;
  const hr = 58; // Head radius + offset for hair
  
  const hairs = {
    short: <path d={`M${cx-hr} ${cy+10} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy+10} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy+10} Z`} fill={c}/>,
    messy: <><path d={`M${cx-hr} ${cy+10} Q${cx-hr} ${cy-hr-15} ${cx} ${cy-hr-15} Q${cx+hr} ${cy-hr-15} ${cx+hr} ${cy+10} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy+10} Z`} fill={c}/><path d={`M${cx-20} ${cy-hr-10} L${cx-10} ${cy-hr-25} L${cx} ${cy-hr-12} L${cx+15} ${cy-hr-22} L${cx+20} ${cy-hr-8}`} fill={c}/></>,
    curly: <><circle cx={cx} cy={cy-hr} r={28} fill={c}/><circle cx={cx-30} cy={cy-hr+10} r={24} fill={c}/><circle cx={cx+30} cy={cy-hr+10} r={24} fill={c}/><circle cx={cx-45} cy={cy} r={20} fill={c}/><circle cx={cx+45} cy={cy} r={20} fill={c}/></>,
    long:  <><path d={`M${cx-hr+5} ${cy} L${cx-hr+15} ${cy+100} Q${cx} ${cy+110} ${cx+hr-15} ${cy+100} L${cx+hr-5} ${cy}`} fill={c}/><path d={`M${cx-hr} ${cy} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy} Z`} fill={c}/></>,
    pigtails: <><path d={`M${cx-hr} ${cy} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy} Z`} fill={c}/><circle cx={cx-hr-10} cy={cy-20} r={20} fill={c}/><circle cx={cx+hr+10} cy={cy-20} r={20} fill={c}/></>,
    bun:   <><path d={`M${cx-hr} ${cy} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy} Z`} fill={c}/><circle cx={cx} cy={cy-hr-15} r={25} fill={c}/></>,
    afro:  <circle cx={cx} cy={cy-20} r={hr+15} fill={c}/>,
    braids: <><path d={`M${cx-hr} ${cy} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy} Z`} fill={c}/>{[0,1,2,3].map(i=><circle key={`l${i}`} cx={cx-hr+10} cy={cy+15+i*15} r={12-i} fill={c}/>)}{[0,1,2,3].map(i=><circle key={`r${i}`} cx={cx+hr-10} cy={cy+15+i*15} r={12-i} fill={c}/>)}</>,
    spiky: <><path d={`M${cx-hr} ${cy+10} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy+10} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy+10} Z`} fill={c}/>{[...Array(9)].map((_,i)=><polygon key={i} points={`${cx-50+i*12},${cy-hr+15} ${cx-44+i*12},${cy-hr-35+(i%2)*15} ${cx-38+i*12},${cy-hr+15}`} fill={c}/>)}</>,
    twintails: <><path d={`M${cx-hr} ${cy} Q${cx-hr} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr} ${cy-hr-10} ${cx+hr} ${cy} Q${cx+hr} ${cy-20} ${cx} ${cy-hr+5} Q${cx-hr} ${cy-20} ${cx-hr} ${cy} Z`} fill={c}/><path d={`M${cx-hr+5} ${cy-20} Q${cx-hr-40} ${cy+40} ${cx-hr-20} ${cy+90} Q${cx-hr-10} ${cy+90} ${cx-hr+10} ${cy+40} Z`} fill={c}/><path d={`M${cx+hr-5} ${cy-20} Q${cx+hr+40} ${cy+40} ${cx+hr+20} ${cy+90} Q${cx+hr+10} ${cy+90} ${cx+hr-10} ${cy+40} Z`} fill={c}/></>,
    undercut: <><path d={`M${cx-hr+10} ${cy+10} Q${cx-hr+10} ${cy-hr-10} ${cx} ${cy-hr-10} Q${cx+hr-10} ${cy-hr-10} ${cx+hr-10} ${cy+10} Z`} fill={c} opacity={0.6}/><path d={`M${cx-hr+5} ${cy-20} Q${cx-hr-5} ${cy-hr-30} ${cx} ${cy-hr-30} Q${cx+hr+5} ${cy-hr-30} ${cx+hr-5} ${cy-20} Z`} fill={c}/></>
  };
  return hairs[style] || hairs.short;
}

function ChibiEyes({ style, color, cx, cy }) {
  const c = color;
  const lx = cx - 22, rx = cx + 22, y = cy + 10;
  const brows = <><path d={`M${lx-10} ${y-16} Q${lx} ${y-22} ${lx+10} ${y-16}`} stroke={c} strokeWidth={4} fill="none" strokeLinecap="round"/><path d={`M${rx-10} ${y-16} Q${rx} ${y-22} ${rx+10} ${y-16}`} stroke={c} strokeWidth={4} fill="none" strokeLinecap="round"/></>;

  const eyes = {
    round: <><circle cx={lx} cy={y} r={10} fill="white"/><circle cx={rx} cy={y} r={10} fill="white"/><circle cx={lx+2} cy={y} r={6} fill={c}/><circle cx={rx+2} cy={y} r={6} fill={c}/><circle cx={lx+4} cy={y-2} r={2.5} fill="white"/><circle cx={rx+4} cy={y-2} r={2.5} fill="white"/>{brows}</>,
    happy: <><path d={`M${lx-10} ${y+4} Q${lx} ${y-10} ${lx+10} ${y+4}`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round"/><path d={`M${rx-10} ${y+4} Q${rx} ${y-10} ${rx+10} ${y+4}`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round"/>{brows}</>,
    stars: <><text x={lx-12} y={y+8} fontSize={24} fill={c}>★</text><text x={rx-12} y={y+8} fontSize={24} fill={c}>★</text>{brows}</>,
    cool:  <><path d={`M${lx-12} ${y-4} L${lx+12} ${y-4} Q${lx+12} ${y+12} ${lx} ${y+12} Q${lx-12} ${y+12} ${lx-12} ${y-4} Z`} fill={c}/><path d={`M${rx-12} ${y-4} L${rx+12} ${y-4} Q${rx+12} ${y+12} ${rx} ${y+12} Q${rx-12} ${y+12} ${rx-12} ${y-4} Z`} fill={c}/>{brows}</>,
    cute:  <><ellipse cx={lx} cy={y} rx={12} ry={14} fill={c}/><ellipse cx={rx} cy={y} rx={12} ry={14} fill={c}/><circle cx={lx+4} cy={y-4} r={4} fill="white"/><circle cx={rx+4} cy={y-4} r={4} fill="white"/><circle cx={lx-2} cy={y+6} r={2} fill="white"/><circle cx={rx-2} cy={y+6} r={2} fill="white"/>{brows}</>,
    wink:  <><circle cx={lx} cy={y} r={10} fill="white"/><circle cx={lx+2} cy={y} r={6} fill={c}/><circle cx={lx+4} cy={y-2} r={2.5} fill="white"/><path d={`M${rx-10} ${y} Q${rx} ${y-10} ${rx+10} ${y}`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round"/>{brows}</>,
    anime: <><ellipse cx={lx} cy={y} rx={10} ry={14} fill="white"/><ellipse cx={rx} cy={y} rx={10} ry={14} fill="white"/><ellipse cx={lx+1} cy={y+2} rx={6} ry={9} fill={c}/><ellipse cx={rx+1} cy={y+2} rx={6} ry={9} fill={c}/><circle cx={lx+3} cy={y-2} r={3} fill="white"/><circle cx={rx+3} cy={y-2} r={3} fill="white"/><circle cx={lx-1} cy={y+6} r={1.5} fill="white"/><circle cx={rx-1} cy={y+6} r={1.5} fill="white"/>{brows}</>,
    tired: <><path d={`M${lx-10} ${y+4} Q${lx} ${y-4} ${lx+10} ${y+4}`} stroke={c} strokeWidth={4} fill="none"/><path d={`M${rx-10} ${y+4} Q${rx} ${y-4} ${rx+10} ${y+4}`} stroke={c} strokeWidth={4} fill="none"/><path d={`M${lx-12} ${y+8} Q${lx} ${y+14} ${lx+12} ${y+8}`} stroke={c} strokeWidth={2} opacity={0.3} fill="none"/><path d={`M${rx-12} ${y+8} Q${rx} ${y+14} ${rx+12} ${y+8}`} stroke={c} strokeWidth={2} opacity={0.3} fill="none"/><path d={`M${lx-10} ${y-14} Q${lx} ${y-12} ${lx+10} ${y-14}`} stroke={c} strokeWidth={3} fill="none" strokeLinecap="round"/><path d={`M${rx-10} ${y-14} Q${rx} ${y-12} ${rx+10} ${y-14}`} stroke={c} strokeWidth={3} fill="none" strokeLinecap="round"/></>
  };
  return eyes[style] || eyes.round;
}

function ChibiMouth({ style, cx, cy }) {
  const y = cy + 30;
  const c = "#4A0E17";
  const mouths = {
    smile: <path d={`M${cx-10} ${y} Q${cx} ${y+10} ${cx+10} ${y}`} stroke={c} strokeWidth={4} fill="none" strokeLinecap="round"/>,
    laugh: <path d={`M${cx-14} ${y} Q${cx} ${y+20} ${cx+14} ${y} Z`} fill="#FF8A80" stroke={c} strokeWidth={3} strokeLinecap="round"/>,
    cat:   <><path d={`M${cx-12} ${y} Q${cx-6} ${y+8} ${cx} ${y} Q${cx+6} ${y+8} ${cx+12} ${y}`} stroke={c} strokeWidth={4} fill="none" strokeLinecap="round"/></>,
    open:  <ellipse cx={cx} cy={y+4} rx={8} ry={12} fill={c}/>,
    smirk: <path d={`M${cx-12} ${y+4} Q${cx} ${y} ${cx+12} ${y-6}`} stroke={c} strokeWidth={4} fill="none" strokeLinecap="round"/>,
    tongue:<><path d={`M${cx-10} ${y} L${cx+10} ${y}`} stroke={c} strokeWidth={4} strokeLinecap="round"/><path d={`M${cx-6} ${y} L${cx+6} ${y} Q${cx+6} ${y+16} ${cx} ${y+16} Q${cx-6} ${y+16} ${cx-6} ${y} Z`} fill="#FF5252"/></>,
    surprised:<circle cx={cx} cy={y+5} r={6} fill={c}/>
  };
  return mouths[style] || mouths.smile;
}

function ChibiTop({ style, color, cx, torsoY }) {
  const c = color;
  const torso = `M${cx-35} ${torsoY} Q${cx} ${torsoY+10} ${cx+35} ${torsoY} L${cx+38} ${torsoY+55} Q${cx} ${torsoY+65} ${cx-38} ${torsoY+55} Z`;
  
  const tops = {
    tshirt: <><path d={torso} fill={c}/><path d={`M${cx-35} ${torsoY} L${cx-55} ${torsoY+25} L${cx-40} ${torsoY+35} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx+55} ${torsoY+25} L${cx+40} ${torsoY+35} Z`} fill={c}/></>,
    hoodie: <><path d={torso} fill={c}/><path d={`M${cx-35} ${torsoY} L${cx-65} ${torsoY+40} L${cx-50} ${torsoY+50} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx+65} ${torsoY+40} L${cx+50} ${torsoY+50} Z`} fill={c}/><rect x={cx-20} y={torsoY+30} width={40} height={20} rx={10} fill="#000" opacity={0.1}/><path d={`M${cx-15} ${torsoY} Q${cx} ${torsoY+20} ${cx+15} ${torsoY}`} fill="#000" opacity={0.15}/></>,
    dress:  <><path d={`M${cx-30} ${torsoY} Q${cx} ${torsoY+10} ${cx+30} ${torsoY} L${cx+55} ${torsoY+95} Q${cx} ${torsoY+105} ${cx-55} ${torsoY+95} Z`} fill={c}/></>,
    sweater:<><path d={torso} fill={c}/>{[...Array(4)].map((_,i)=><path key={i} d={`M${cx-35} ${torsoY+10+i*12} Q${cx} ${torsoY+15+i*12} ${cx+35} ${torsoY+10+i*12}`} stroke="#fff" strokeWidth={4} fill="none"/>)}<path d={`M${cx-35} ${torsoY} L${cx-65} ${torsoY+40} L${cx-50} ${torsoY+50} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx+65} ${torsoY+40} L${cx+50} ${torsoY+50} Z`} fill={c}/></>,
    tanktop:<><path d={torso} fill={c}/><path d={`M${cx-20} ${torsoY} L${cx-30} ${torsoY} L${cx-30} ${torsoY+15} Q${cx} ${torsoY+30} ${cx+30} ${torsoY+15} L${cx+30} ${torsoY} L${cx+20} ${torsoY} Q${cx} ${torsoY+15} ${cx-20} ${torsoY}`} fill={c}/></>,
    jacket: <><path d={torso} fill="#ECEFF1"/><path d={`M${cx-35} ${torsoY} Q${cx-15} ${torsoY+10} ${cx-5} ${torsoY+55} L${cx-38} ${torsoY+55} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} Q${cx+15} ${torsoY+10} ${cx+5} ${torsoY+55} L${cx+38} ${torsoY+55} Z`} fill={c}/><path d={`M${cx-35} ${torsoY} L${cx-65} ${torsoY+40} L${cx-50} ${torsoY+50} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx+65} ${torsoY+40} L${cx+50} ${torsoY+50} Z`} fill={c}/></>,
    suit:   <><path d={torso} fill="#fff"/><path d={`M${cx-35} ${torsoY} L${cx} ${torsoY+40} L${cx-5} ${torsoY+55} L${cx-38} ${torsoY+55} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx} ${torsoY+40} L${cx+5} ${torsoY+55} L${cx+38} ${torsoY+55} Z`} fill={c}/><path d={`M${cx-5} ${torsoY+10} L${cx} ${torsoY+35} L${cx+5} ${torsoY+10} Z`} fill="#F44336"/><path d={`M${cx-35} ${torsoY} L${cx-65} ${torsoY+40} L${cx-50} ${torsoY+50} Z`} fill={c}/><path d={`M${cx+35} ${torsoY} L${cx+65} ${torsoY+40} L${cx+50} ${torsoY+50} Z`} fill={c}/></>
  };
  return tops[style] || tops.tshirt;
}

function ChibiBottom({ style, color, cx, bottomY }) {
  const c = color;
  const bottoms = {
    shorts: <><path d={`M${cx-38} ${bottomY} L${cx} ${bottomY+5} L${cx+38} ${bottomY} L${cx+35} ${bottomY+30} L${cx+5} ${bottomY+25} L${cx} ${bottomY+15} L${cx-5} ${bottomY+25} L${cx-35} ${bottomY+30} Z`} fill={c}/></>,
    pants:  <><path d={`M${cx-38} ${bottomY} L${cx} ${bottomY+5} L${cx+38} ${bottomY} L${cx+35} ${bottomY+70} L${cx+10} ${bottomY+70} L${cx} ${bottomY+20} L${cx-10} ${bottomY+70} L${cx-35} ${bottomY+70} Z`} fill={c}/></>,
    skirt:  <><path d={`M${cx-38} ${bottomY} L${cx+38} ${bottomY} Q${cx+50} ${bottomY+40} ${cx} ${bottomY+45} Q${cx-50} ${bottomY+40} ${cx-38} ${bottomY} Z`} fill={c}/></>,
    jeans:  <><path d={`M${cx-38} ${bottomY} L${cx} ${bottomY+5} L${cx+38} ${bottomY} L${cx+35} ${bottomY+70} L${cx+10} ${bottomY+70} L${cx} ${bottomY+20} L${cx-10} ${bottomY+70} L${cx-35} ${bottomY+70} Z`} fill={c}/><path d={`M${cx-22} ${bottomY+10} L${cx-22} ${bottomY+70}`} stroke="#fff" strokeWidth={2} opacity={0.3}/><path d={`M${cx+22} ${bottomY+10} L${cx+22} ${bottomY+70}`} stroke="#fff" strokeWidth={2} opacity={0.3}/></>,
    sweatpants: <><path d={`M${cx-38} ${bottomY} L${cx} ${bottomY+5} L${cx+38} ${bottomY} Q${cx+42} ${bottomY+35} ${cx+32} ${bottomY+70} L${cx+12} ${bottomY+70} L${cx} ${bottomY+20} L${cx-12} ${bottomY+70} L${cx-32} ${bottomY+70} Q${cx-42} ${bottomY+35} ${cx-38} ${bottomY} Z`} fill={c}/></>
  };
  return bottoms[style] || bottoms.shorts;
}

function ChibiShoes({ style, color, cx, shoeY }) {
  const c = color;
  const shoes = {
    sneakers: <><rect x={cx-32} y={shoeY} width={22} height={18} rx={8} fill={c}/><rect x={cx-34} y={shoeY+12} width={26} height={8} rx={4} fill="#fff"/><rect x={cx+10} y={shoeY} width={22} height={18} rx={8} fill={c}/><rect x={cx+8} y={shoeY+12} width={26} height={8} rx={4} fill="#fff"/></>,
    boots:    <><path d={`M${cx-32} ${shoeY-15} L${cx-10} ${shoeY-15} L${cx-10} ${shoeY+18} L${cx-35} ${shoeY+18} Z`} fill={c} strokeLinejoin="round"/><path d={`M${cx+10} ${shoeY-15} L${cx+32} ${shoeY-15} L${cx+35} ${shoeY+18} L${cx+10} ${shoeY+18} Z`} fill={c} strokeLinejoin="round"/></>,
    flats:    <><ellipse cx={cx-21} cy={shoeY+12} rx={14} ry={8} fill={c}/><ellipse cx={cx+21} cy={shoeY+12} rx={14} ry={8} fill={c}/></>,
    sandals:  <><ellipse cx={cx-21} cy={shoeY+12} rx={14} ry={6} fill={c}/><line x1={cx-35} y1={shoeY+10} x2={cx-7} y2={shoeY+10} stroke={c} strokeWidth={4}/><ellipse cx={cx+21} cy={shoeY+12} rx={14} ry={6} fill={c}/><line x1={cx+7} y1={shoeY+10} x2={cx+35} y2={shoeY+10} stroke={c} strokeWidth={4}/></>,
    crocs:    <><rect x={cx-34} y={shoeY+2} width={26} height={16} rx={8} fill={c}/><circle cx={cx-30} cy={shoeY+8} r={2} fill="#000" opacity={0.2}/><circle cx={cx-25} cy={shoeY+8} r={2} fill="#000" opacity={0.2}/><rect x={cx+8} y={shoeY+2} width={26} height={16} rx={8} fill={c}/><circle cx={cx+12} cy={shoeY+8} r={2} fill="#000" opacity={0.2}/><circle cx={cx+17} cy={shoeY+8} r={2} fill="#000" opacity={0.2}/></>
  };
  return shoes[style] || shoes.sneakers;
}

function ChibiAccessory({ style, cx, cy }) {
  switch (style) {
    case "glasses": return <><rect x={cx-35} y={cy+5} width={28} height={18} rx={6} fill="rgba(255,255,255,0.4)" stroke="#111" strokeWidth={4}/><rect x={cx+7} y={cy+5} width={28} height={18} rx={6} fill="rgba(255,255,255,0.4)" stroke="#111" strokeWidth={4}/><line x1={cx-7} y1={cy+12} x2={cx+7} y2={cy+12} stroke="#111" strokeWidth={4}/></>;
    case "sunglasses": return <><rect x={cx-35} y={cy+4} width={28} height={18} rx={6} fill="#111"/><rect x={cx+7} y={cy+4} width={28} height={18} rx={6} fill="#111"/><line x1={cx-7} y1={cy+10} x2={cx+7} y2={cy+10} stroke="#111" strokeWidth={4}/></>;
    case "cap": return <><path d={`M${cx-45} ${cy-15} Q${cx} ${cy-50} ${cx+45} ${cy-15} Z`} fill="#FF3366"/><path d={`M${cx-50} ${cy-15} L${cx+30} ${cy-15}`} stroke="#FF3366" strokeWidth={10} strokeLinecap="round"/></>;
    case "bow": return <><path d={`M${cx-25} ${cy-45} L${cx-5} ${cy-35} L${cx-25} ${cy-25} Z`} fill="#FF3366"/><path d={`M${cx+25} ${cy-45} L${cx+5} ${cy-35} L${cx+25} ${cy-25} Z`} fill="#FF3366"/><circle cx={cx} cy={cy-35} r={8} fill="#CC0033"/></>;
    case "mask": return <><rect x={cx-25} y={cy+18} width={50} height={25} rx={8} fill="#E0F7FA"/><path d={`M${cx-40} ${cy+5} L${cx-25} ${cy+20}`} stroke="#E0F7FA" strokeWidth={3}/><path d={`M${cx+40} ${cy+5} L${cx+25} ${cy+20}`} stroke="#E0F7FA" strokeWidth={3}/></>;
    case "headband": return <path d={`M${cx-55} ${cy-15} Q${cx} ${cy-30} ${cx+55} ${cy-15} L${cx+50} ${cy-25} Q${cx} ${cy-40} ${cx-50} ${cy-25} Z`} fill="#FFC107"/>;
    case "necklace": return <><path d={`M${cx-15} ${cy+60} Q${cx} ${cy+80} ${cx+15} ${cy+60}`} stroke="#FFD700" strokeWidth={3} fill="none"/><circle cx={cx} cy={cy+72} r={6} fill="#FF5252"/></>;
    default: return null;
  }
}

function Companion({ style, cx, cy }) {
  if (style === "none") return null;
  const px = cx + 80;
  const py = cy + 180;
  
  switch(style) {
    case "cat": return <motion.g animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}><circle cx={px} cy={py} r={20} fill="#FF9800"/><polygon points={`${px-15},${py-10} ${px-20},${py-30} ${px-5},${py-15}`} fill="#FF9800"/><polygon points={`${px+15},${py-10} ${px+20},${py-30} ${px+5},${py-15}`} fill="#FF9800"/><circle cx={px-8} cy={py} r={3} fill="#000"/><circle cx={px+8} cy={py} r={3} fill="#000"/><path d={`M${px-4} ${py+6} Q${px} ${py+10} ${px+4} ${py+6}`} stroke="#000" strokeWidth={2} fill="none"/></motion.g>;
    case "dog": return <motion.g animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><circle cx={px} cy={py} r={22} fill="#8D6E63"/><ellipse cx={px-20} cy={py} rx={8} ry={16} fill="#5D4037" transform={`rotate(-20 ${px-20} ${py})`}/><ellipse cx={px+20} cy={py} rx={8} ry={16} fill="#5D4037" transform={`rotate(20 ${px+20} ${py})`}/><circle cx={px-8} cy={py-2} r={3} fill="#000"/><circle cx={px+8} cy={py-2} r={3} fill="#000"/><circle cx={px} cy={py+6} r={4} fill="#000"/><path d={`M${px} ${py+10} Q${px+4} ${py+15} ${px+8} ${py+10}`} stroke="#000" strokeWidth={2} fill="none"/></motion.g>;
    case "bird": return <motion.g animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}><circle cx={cx-60} cy={cy-40} r={15} fill="#03A9F4"/><polygon points={`${cx-50},${cy-40} ${cx-40},${cy-35} ${cx-50},${cy-30}`} fill="#FFC107"/><circle cx={cx-55} cy={cy-45} r={2} fill="#000"/><path d={`M${cx-70} ${cy-40} Q${cx-80} ${cy-50} ${cx-70} ${cy-30} Z`} fill="#03A9F4"/></motion.g>;
    default: return null;
  }
}

// ─── The Main Beautiful SVG Generator ─────────────────────────────────────
export function ChibiCharacter({ avatar, size = 300, animate = true }) {
  const cx = 150, cy = 100;
  const headR = 55;
  const torsoY = cy + headR + 5; 
  
  if (!avatar) return null;

  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 300 350" 
      style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.2))" }}
      animate={animate ? { y: [0, -8, 0], rotate: [0, 1, 0, -1, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <clipPath id="bgClip">
          <rect width="300" height="350" rx="40"/>
        </clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      <rect width="300" height="350" rx="40" style={{ fill: avatar.bgColor || BG_COLORS[0] }} clipPath="url(#bgClip)"/>

      <g filter="url(#shadow)">
        <Companion style={avatar.companion} cx={cx} cy={cy} />
        
        <path d={`M${cx-22} ${torsoY+50} L${cx-22} ${310} L${cx-10} ${310} L${cx-6} ${torsoY+50} Z`} fill={avatar.skinColor}/>
        <path d={`M${cx+22} ${torsoY+50} L${cx+22} ${310} L${cx+10} ${310} L${cx+6} ${torsoY+50} Z`} fill={avatar.skinColor}/>
        
        <ChibiShoes style={avatar.shoesStyle} color={avatar.shoesColor} cx={cx} shoeY={305}/>
        <ChibiBottom style={avatar.bottomStyle} color={avatar.bottomColor} cx={cx} bottomY={torsoY+50}/>
        
        <path d={`M${cx-10} ${cy+headR-5} L${cx+10} ${cy+headR-5} L${cx+12} ${torsoY+10} L${cx-12} ${torsoY+10} Z`} fill={avatar.skinColor}/>
        <ellipse cx={cx} cy={cy+headR} rx={12} ry={6} fill="#000" opacity={0.15}/>
        
        <ChibiTop style={avatar.topStyle} color={avatar.topColor} cx={cx} torsoY={torsoY}/>
        
        <path d={`M${cx-35} ${torsoY+10} Q${cx-60} ${torsoY+30} ${cx-50} ${torsoY+70}`} stroke={avatar.skinColor} strokeWidth={22} strokeLinecap="round" fill="none"/>
        <path d={`M${cx+35} ${torsoY+10} Q${cx+60} ${torsoY+30} ${cx+50} ${torsoY+70}`} stroke={avatar.skinColor} strokeWidth={22} strokeLinecap="round" fill="none"/>
        
        <circle cx={cx} cy={cy} r={headR} fill={avatar.skinColor}/>
        
        <circle cx={cx-headR-2} cy={cy+10} r={12} fill={avatar.skinColor}/>
        <circle cx={cx-headR-2} cy={cy+10} r={6} fill="#000" opacity={0.1}/>
        <circle cx={cx+headR+2} cy={cy+10} r={12} fill={avatar.skinColor}/>
        <circle cx={cx+headR+2} cy={cy+10} r={6} fill="#000" opacity={0.1}/>

        <ellipse cx={cx-25} cy={cy+15} rx={10} ry={6} fill="#FF8A80" opacity={0.6}/>
        <ellipse cx={cx+25} cy={cy+15} rx={10} ry={6} fill="#FF8A80" opacity={0.6}/>

        <ChibiHair style={avatar.hairStyle} color={avatar.hairColor} cx={cx} cy={cy}/>
        
        <ChibiEyes style={avatar.eyeStyle} color={avatar.eyeColor} cx={cx} cy={cy}/>
        <ChibiMouth style={avatar.mouthStyle} cx={cx} cy={cy}/>
        
        <ChibiAccessory style={avatar.accessory} cx={cx} cy={cy}/>
      </g>
    </motion.svg>
  );
}

// ─── TABS AND DEFAULTS ──────────────────────────────────────────────────────
const TABS = [
  { id: "skin",      label: "Skin",       icon: "🧑" },
  { id: "hair",      label: "Hair",       icon: "💇" },
  { id: "eyes",      label: "Eyes",       icon: "👀" },
  { id: "mouth",     label: "Mouth",      icon: "😊" },
  { id: "top",       label: "Top",        icon: "👕" },
  { id: "bottom",    label: "Bottom",     icon: "👖" },
  { id: "shoes",     label: "Shoes",      icon: "👟" },
  { id: "accessory", label: "Extra",      icon: "🕶️" },
  { id: "pets",      label: "Pets",       icon: "🐾" },
  { id: "bg",        label: "BG",         icon: "🖼️" },
];

const DEFAULT_AVATAR = {
  skinColor: SKIN_COLORS[1],
  hairColor: HAIR_COLORS[0],
  hairStyle: "short",
  eyeColor: EYE_COLORS[0],
  eyeStyle: "round",
  mouthStyle: "smile",
  topStyle: "tshirt",
  topColor: TOP_COLORS[0],
  bottomStyle: "shorts",
  bottomColor: BOTTOM_COLORS[0],
  shoesStyle: "sneakers",
  shoesColor: SHOES_COLORS[0],
  accessory: "none",
  companion: "none",
  bgColor: BG_COLORS[0],
};

// ─── Main Avatar Component ──────────────────────────────────────────────────
export default function Avatar({ onBack }) {
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState("skin");
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
  }, [avatar]);

  useEffect(() => {
    fetchAvatar();
  }, []);

  const fetchAvatar = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.avatar) {
        setAvatar(data.avatar);
      }
    } catch (err) {
      console.error("Failed to fetch avatar", err);
    }
  };

  const saveAvatar = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/user/avatar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(avatar)
      });
      if (res.ok) {
        playDone();
        onBack();
      }
    } catch (err) {
      console.error("Failed to save avatar", err);
    }
  };

  const set = useCallback((key, val) => {
    playSelect();
    setAvatar(a => ({ ...a, [key]: val }));
  }, []);

  const randomize = () => {
    playDone();
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    setAvatar({
      skinColor: pick(SKIN_COLORS),
      hairColor: pick(HAIR_COLORS),
      hairStyle: pick(HAIR_STYLES),
      eyeColor: pick(EYE_COLORS),
      eyeStyle: pick(EYE_STYLES),
      mouthStyle: pick(MOUTH_STYLES),
      topStyle: pick(TOP_STYLES),
      topColor: pick(TOP_COLORS),
      bottomStyle: pick(BOTTOM_STYLES),
      bottomColor: pick(BOTTOM_COLORS),
      shoesStyle: pick(SHOES_STYLES),
      shoesColor: pick(SHOES_COLORS),
      accessory: pick(ACCESSORIES),
      companion: pick(COMPANIONS),
      bgColor: pick(BG_COLORS),
    });
  };

  const renderOptions = () => {
    switch (activeTab) {
      case "skin": return <ColorGrid colors={SKIN_COLORS} selected={avatar.skinColor} onSelect={v => set("skinColor", v)}/>;
      case "hair": return (
        <>
          <ColorRow colors={HAIR_COLORS} selected={avatar.hairColor} onSelect={v => set("hairColor", v)}/>
          <StyleGrid items={HAIR_STYLES} selected={avatar.hairStyle} onSelect={v => set("hairStyle", v)} />
        </>
      );
      case "eyes": return (
        <>
          <ColorRow colors={EYE_COLORS} selected={avatar.eyeColor} onSelect={v => set("eyeColor", v)}/>
          <StyleGrid items={EYE_STYLES} selected={avatar.eyeStyle} onSelect={v => set("eyeStyle", v)} />
        </>
      );
      case "mouth": return <StyleGrid items={MOUTH_STYLES} selected={avatar.mouthStyle} onSelect={v => set("mouthStyle", v)} />;
      case "top": return (
        <>
          <ColorRow colors={TOP_COLORS} selected={avatar.topColor} onSelect={v => set("topColor", v)}/>
          <StyleGrid items={TOP_STYLES} selected={avatar.topStyle} onSelect={v => set("topStyle", v)} />
        </>
      );
      case "bottom": return (
        <>
          <ColorRow colors={BOTTOM_COLORS} selected={avatar.bottomColor} onSelect={v => set("bottomColor", v)}/>
          <StyleGrid items={BOTTOM_STYLES} selected={avatar.bottomStyle} onSelect={v => set("bottomStyle", v)} />
        </>
      );
      case "shoes": return (
        <>
          <ColorRow colors={SHOES_COLORS} selected={avatar.shoesColor} onSelect={v => set("shoesColor", v)}/>
          <StyleGrid items={SHOES_STYLES} selected={avatar.shoesStyle} onSelect={v => set("shoesStyle", v)} />
        </>
      );
      case "accessory": return <StyleGrid items={ACCESSORIES} selected={avatar.accessory} onSelect={v => set("accessory", v)} />;
      case "pets": return <StyleGrid items={COMPANIONS} selected={avatar.companion} onSelect={v => set("companion", v)} />;
      case "bg": return <ColorGrid colors={BG_COLORS} selected={avatar.bgColor} onSelect={v => set("bgColor", v)}/>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex flex-col bg-[#0f172a] text-white font-sans overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet"/>
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 px-8 relative z-20">
        <button onClick={onBack} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-md transition-all">
          ✕
        </button>
        <h1 className="text-xl font-bold tracking-widest text-white/90">AVATAR CREATOR</h1>
        <div className="flex gap-4">
          <button onClick={randomize} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-md transition-all">
            🎲
          </button>
          <button onClick={saveAvatar} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold shadow-lg hover:shadow-pink-500/50 transition-all">
            Save
          </button>
        </div>
      </div>

      {/* Avatar Preview */}
      <div className="flex-1 flex items-center justify-center relative z-10 -mt-10">
        <div className="absolute w-[350px] h-[350px] bg-pink-500/20 blur-[100px] rounded-full pointer-events-none" />
        <ChibiCharacter avatar={avatar} size={Math.min(window.innerWidth * 0.7, 360)} animate={bounce} />
      </div>

      {/* Editor Drawer */}
      <div className="bg-white text-gray-800 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col relative z-30 h-[45vh] max-h-[500px]">
        <div className="w-full flex justify-center pt-4 pb-2">
          <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="flex overflow-x-auto px-6 py-4 gap-4 no-scrollbar border-b border-gray-100">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => { playClick(); setActiveTab(tab.id); }} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-bold text-sm ${active ? 'bg-gray-900 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <span className="text-lg">{tab.icon}</span> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 rounded-b-[40px] no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderOptions()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Shared UI Sub-components ───────────────────────────────────────────────

function ColorGrid({ colors, selected, onSelect }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-4">
      {colors.map(c => (
        <button key={c} onClick={() => onSelect(c)} style={{
          width:60, height:60, borderRadius: '50%', border:`4px solid ${selected===c?"#111827":"transparent"}`,
          background:c, cursor:"pointer", boxShadow: selected===c ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
          transform: selected===c ? "scale(1.1)" : "scale(1)", transition:"all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}/>
      ))}
    </div>
  );
}

function ColorRow({ colors, selected, onSelect }) {
  return (
    <div className="flex gap-3 flex-wrap mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
      {colors.map(c => (
        <button key={c} onClick={() => onSelect(c)} style={{
          width:40, height:40, borderRadius:12, border:`3px solid ${selected===c?"#111827":"transparent"}`,
          background:c, cursor:"pointer",
          transform: selected===c ? "scale(1.15)" : "scale(1)", transition:"all 0.2s"
        }}/>
      ))}
    </div>
  );
}

function StyleGrid({ items, selected, onSelect }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
      {items.map(item => (
        <button key={item} onClick={() => onSelect(item)} className={`
          h-14 rounded-2xl flex items-center justify-center transition-all border-2 px-3
          ${selected === item ? 'bg-gray-100 border-gray-900 shadow-md scale-105' : 'bg-white border-transparent shadow-sm hover:shadow-md hover:bg-gray-50'}
        `}>
          <span className={`text-sm font-bold capitalize ${selected === item ? 'text-gray-900' : 'text-gray-500'}`}>
            {item}
          </span>
        </button>
      ))}
    </div>
  );
}
