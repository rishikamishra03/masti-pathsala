import { useState, useEffect, useRef, useCallback } from "react";

const TASK_TYPES = [
  { id:"even",  label:"Collect the EVEN numbers.",        check: n => n%2===0,   slots:4 },
  { id:"odd",   label:"Collect the ODD numbers.",         check: n => n%2!==0,   slots:4 },
  { id:"gt10",  label:"Collect numbers GREATER than 10.", check: n => n>10,      slots:4 },
  { id:"lt10",  label:"Collect numbers LESS than 10.",    check: n => n<10,      slots:4 },
  { id:"mult3", label:"Collect MULTIPLES of 3.",          check: n => n%3===0,   slots:4 },
];

function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

// ── AUDIO ────────────────────────────────────────────────────────
function useAudio(){
  const acRef   = useRef(null);
  const bgTids  = useRef([]);
  const bgOn    = useRef(false);

  const ctx = ()=>{
    if(!acRef.current) acRef.current = new (window.AudioContext||window.webkitAudioContext)();
    if(acRef.current.state==="suspended") acRef.current.resume();
    return acRef.current;
  };

  const tone = useCallback((freq,dur,type="sine",vol=0.25,delay=0)=>{
    try{
      const c=ctx(), o=c.createOscillator(), g=c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type=type; o.frequency.value=freq;
      const t=c.currentTime+delay;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(vol,t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,t+dur);
      o.start(t); o.stop(t+dur);
    }catch{}
  },[]);

  const collect = useCallback(()=>{
    tone(523,0.1,"sine",0.28);
    tone(784,0.14,"sine",0.28,0.09);
    tone(1047,0.18,"sine",0.22,0.17);
  },[tone]);

  const wrong = useCallback(()=>{
    tone(220,0.14,"sawtooth",0.2);
    tone(180,0.18,"sawtooth",0.18,0.1);
  },[tone]);

  const win = useCallback(()=>{
    [523,659,784,1047,1319].forEach((f,i)=>tone(f,0.28,"sine",0.28,i*0.11));
  },[tone]);

  const splash = useCallback(()=>{
    try{
      const c=ctx();
      const buf=c.createBuffer(1,c.sampleRate*0.12,c.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length)*0.7;
      const src=c.createBufferSource(), filt=c.createBiquadFilter(), g=c.createGain();
      src.buffer=buf; filt.type="bandpass"; filt.frequency.value=900;
      src.connect(filt); filt.connect(g); g.connect(c.destination);
      g.gain.value=0.14; src.start();
    }catch{}
  },[]);

  const startBg = useCallback(()=>{
    if(bgOn.current) return;
    bgOn.current=true;
    const melody=[261,329,392,329,261,220,261,329,294,349,392,349];
    let step=0;
    const tick=()=>{
      if(!bgOn.current) return;
      tone(melody[step%melody.length]*0.5,0.55,"triangle",0.06);
      tone(melody[(step+2)%melody.length],0.45,"triangle",0.04,0.02);
      step++;
      const id=setTimeout(tick,480);
      bgTids.current.push(id);
    };
    tick();
  },[tone]);

  const stopBg = useCallback(()=>{
    bgOn.current=false;
    bgTids.current.forEach(clearTimeout);
    bgTids.current=[];
  },[]);

  return {collect,wrong,win,splash,startBg,stopBg};
}

// ── AI TASK ──────────────────────────────────────────────────────
async function fetchAITask(){
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1000,
        messages:[{role:"user",content:`You generate tasks for a children's math swimming game (ages 6-10).
Return ONLY valid JSON, no extra text:
{"label":"fun short instruction max 8 words","check":"even|odd|gt10|lt10|mult3|mult2|prime|lt20|gt5"}
check types: even=n%2==0, odd=n%2!=0, gt10=n>10, lt10=n<10, mult3=n%3==0, mult2=n%2==0, prime=n in[2,3,5,7,11,13,17,19,23], lt20=n<20, gt5=n>5
Make it fun and child-friendly!`}]
      })
    });
    const data=await res.json();
    const txt=data.content?.find(b=>b.type==="text")?.text?.trim()||"{}";
    const p=JSON.parse(txt.replace(/```json|```/g,"").trim());
    const CHECKS={
      even:n=>n%2===0, odd:n=>n%2!==0, gt10:n=>n>10, lt10:n=>n<10,
      mult3:n=>n%3===0, mult2:n=>n%2===0,
      prime:n=>[2,3,5,7,11,13,17,19,23].includes(n), lt20:n=>n<20, gt5:n=>n>5
    };
    return {label:p.label||"Collect the even numbers.", check:CHECKS[p.check]||(n=>n%2===0), slots:4};
  }catch{
    return TASK_TYPES[rnd(0,TASK_TYPES.length-1)];
  }
}

// ── STINGRAY SVG ─────────────────────────────────────────────────
function Ray({flap,hit,glow}){
  return(
    <svg width="140" height="95" viewBox="0 0 140 95"
      style={{filter:hit?"brightness(2) saturate(0.2)":glow?"drop-shadow(0 0 12px #6BCB77)":"drop-shadow(3px 6px 10px rgba(0,0,0,0.28))",
      transition:"filter 0.15s",transform:flap?"scaleY(0.88)":"scaleY(1)"}}>
      <ellipse cx="70" cy="91" rx="48" ry="5" fill="rgba(0,0,0,0.18)"/>
      {/* wings */}
      <path d="M70 47 C12 18,2 56,22 67 C38 75,60 70,70 67 C80 70,102 75,118 67 C138 56,128 18,70 47Z" fill="#7B5EA7"/>
      <path d="M70 47 C20 24,6 52,28 64 C42 72,62 69,70 67" fill="#9B7EC7" opacity="0.55"/>
      <path d="M70 47 C120 24,134 52,112 64 C98 72,78 69,70 67" fill="#9B7EC7" opacity="0.38"/>
      <ellipse cx="70" cy="56" rx="20" ry="13" fill="#6A4E96"/>
      {/* tail */}
      <path d="M34 65 Q16 71,5 64 Q0 60,9 57 Q20 62,34 65Z" fill="#6A4E96"/>
      <path d="M9 57 Q2 53,5 49 Q9 51,9 57Z" fill="#5A3E86"/>
      {/* belly line */}
      <path d="M36 68 Q70 76,104 68" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2"/>
      {/* eye */}
      <circle cx="88" cy="50" r="8" fill="white"/>
      <circle cx="88" cy="50" r="5.5" fill="#3A2A5A"/>
      <circle cx="88" cy="50" r="2.8" fill="#111"/>
      <circle cx="90" cy="48" r="1.8" fill="white"/>
      {/* smile */}
      <path d="M83 59 Q88 64 93 59" fill="none" stroke="#3A2A5A" strokeWidth="2.2" strokeLinecap="round"/>
      <ellipse cx="96" cy="57" rx="5" ry="3" fill="#FF85A1" opacity="0.5"/>
    </svg>
  );
}

// ── UNDERWATER BG ────────────────────────────────────────────────
function UWBg({scrollX}){
  const s1=(-scrollX*0.06)%100;
  const s2=(-scrollX*0.14)%100;
  const s3=(-scrollX*0.28)%100;
  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0}}>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(180deg,#2EC4CC 0%,#3DD4C4 22%,#4EC89A 55%,#5BB880 78%,#4A9A68 100%)"}}/>

      {/* far hills */}
      <svg style={{position:"absolute",bottom:"36%",width:`${200}%`,height:"28%",
        transform:`translateX(${s1}%)`}} viewBox="0 0 1400 200" preserveAspectRatio="none">
        {[[120,185,240,130],[400,165,290,150],[750,175,260,140],[1050,160,300,155],[1320,170,250,135]].map(([cx,cy,rx,ry],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i%2===0?"#3AB0A8":"#2E9E96"} opacity="0.55"/>
        ))}
      </svg>

      {/* mid hills */}
      <svg style={{position:"absolute",bottom:"28%",width:"200%",height:"26%",
        transform:`translateX(${s2}%)`}} viewBox="0 0 1400 200" preserveAspectRatio="none">
        {[[80,185,190,115],[350,168,240,135],[680,178,210,125],[950,162,260,140],[1220,172,230,128]].map(([cx,cy,rx,ry],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i%2===0?"#6BC8B4":"#5AB8A4"} opacity="0.65"/>
        ))}
      </svg>

      {/* seafloor */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"30%",
        background:"linear-gradient(180deg,#7DC896 0%,#5EAA78 45%,#4A9060 100%)"}}/>

      {/* wavy lines */}
      <svg style={{position:"absolute",bottom:"28%",width:"200%",transform:`translateX(${s2}%)`}}
        viewBox="0 0 1400 70" preserveAspectRatio="none">
        {[0,11,22,33,44,55].map(y=>(
          <path key={y} d={`M0 ${y} Q175 ${y-9} 350 ${y} Q525 ${y+9} 700 ${y} Q875 ${y-7} 1050 ${y} Q1225 ${y+7} 1400 ${y}`}
            fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4"/>
        ))}
      </svg>

      {/* flora */}
      <svg style={{position:"absolute",bottom:"28%",width:"300%",height:"22%",
        transform:`translateX(${s3%100}%)`}} viewBox="0 0 2100 155" preserveAspectRatio="none">
        {/* white coral trees */}
        {[70,310,580,840,1100,1370,1640,1900].map((x,i)=>(
          <g key={`t${i}`} transform={`translate(${x},152)`}>
            <line x1="0" y1="0" x2="0" y2="-52" stroke={i%2===0?"#ddf0ea":"#C77DFF"} strokeWidth="2.4"/>
            <line x1="0" y1="-18" x2="-16" y2="-40" stroke={i%2===0?"#ddf0ea":"#C77DFF"} strokeWidth="1.9"/>
            <line x1="0" y1="-18" x2="16" y2="-40" stroke={i%2===0?"#ddf0ea":"#C77DFF"} strokeWidth="1.9"/>
            <line x1="0" y1="-34" x2="-10" y2="-52" stroke={i%2===0?"#ddf0ea":"#C77DFF"} strokeWidth="1.4"/>
            <line x1="0" y1="-34" x2="10" y2="-52" stroke={i%2===0?"#ddf0ea":"#C77DFF"} strokeWidth="1.4"/>
            {[-16,16,-10,10,0].map((cx,j)=>(
              <circle key={j} cx={cx} cy={j<2?-40:j<4?-52:-52} r="2.8"
                fill={i%2===0?"#ddf0ea":"#C77DFF"}/>
            ))}
          </g>
        ))}
        {/* pink pebbles */}
        {[190,460,710,980,1240,1510,1770].map((x,i)=>(
          <ellipse key={`p${i}`} cx={x} cy={152} rx={i%2===0?28:20} ry={i%2===0?13:9}
            fill={i%2===0?"#FF85A1":"#FFB3C1"} opacity="0.85"/>
        ))}
        {/* kelp */}
        {[140,390,660,940,1190,1450,1710].map((x,i)=>(
          <g key={`k${i}`}>
            <path d={`M${x} 155 Q${x-11} 128 ${x} 108 Q${x+11} 88 ${x} 68`}
              fill="none" stroke="#2E7040" strokeWidth={i%2===0?6:4} strokeLinecap="round"/>
            <path d={`M${x+9} 155 Q${x-3} 132 ${x+9} 112 Q${x+21} 92 ${x+9} 72`}
              fill="none" stroke="#3E8850" strokeWidth={i%2===0?4:3} strokeLinecap="round"/>
          </g>
        ))}
        {/* orange coral */}
        {[530,880,1280,1580].map((x,i)=>(
          <g key={`c${i}`} transform={`translate(${x},148)`}>
            <path d="M0 0 Q-18-28-9-48 Q0-62 9-48 Q18-28 0 0" fill="#E8704A" opacity="0.82"/>
            <path d="M-14 0 Q-32-22-23-42 Q-14-56-4-42 Q4-22-14 0" fill="#C9573A" opacity="0.8"/>
            <path d="M14 0 Q32-22 23-42 Q14-56 4-42 Q-4-22 14 0" fill="#E8704A" opacity="0.82"/>
          </g>
        ))}
      </svg>

      {/* bubbles */}
      {[...Array(9)].map((_,i)=>(
        <div key={i} style={{position:"absolute",
          left:`${8+i*10}%`,bottom:`${18+(i%3)*16}%`,
          width:`${5+(i%3)*4}px`,height:`${5+(i%3)*4}px`,
          borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.45)",
          background:"rgba(255,255,255,0.1)",
          animation:`bubUp ${3.5+i*0.9}s ease-in ${i*0.7}s infinite`}}/>
      ))}
    </div>
  );
}

// ── MAIN GAME ────────────────────────────────────────────────────
export default function NumberSwimGame(){
  const W = typeof window!=="undefined"?window.innerWidth:800;
  const H = typeof window!=="undefined"?window.innerHeight:600;
  const RAY_X = W*0.20;
  const RAY_W = 140, RAY_H = 95;
  const SLOTS = 4;

  const [rayY,  setRayY]    = useState(H*0.44);
  const [flap,  setFlap]    = useState(false);
  const [hit,   setHit]     = useState(false);
  const [glow,  setGlow]    = useState(false);
  const [nums,  setNums]    = useState([]);
  const [collected,setColl] = useState([]);
  const [scrollX,setScroll] = useState(0);
  const [phase, setPhase]   = useState("start");
  const [task,  setTask]    = useState(TASK_TYPES[0]);
  const [lives, setLives]   = useState(3);
  const [score, setScore]   = useState(0);
  const [bgOn,  setBgOn]    = useState(true);
  const [aiLoad,setAiLoad]  = useState(false);
  const [sparks,setSparks]  = useState([]);

  const audio = useAudio();
  const rayYRef    = useRef(H*0.44);
  const velRef     = useRef(0);
  const numsRef    = useRef([]);
  const collRef    = useRef([]);
  const livesRef   = useRef(3);
  const phaseRef   = useRef("start");
  const taskRef    = useRef(TASK_TYPES[0]);
  const bgOnRef    = useRef(true);
  const animRef    = useRef(null);
  const lastSpawn  = useRef(0);
  const spawnIv    = useRef(2300);

  useEffect(()=>{rayYRef.current=rayY;},[rayY]);
  useEffect(()=>{collRef.current=collected;},[collected]);
  useEffect(()=>{livesRef.current=lives;},[lives]);
  useEffect(()=>{phaseRef.current=phase;},[phase]);
  useEffect(()=>{taskRef.current=task;},[task]);
  useEffect(()=>{bgOnRef.current=bgOn;},[bgOn]);

  // sparks burst
  const burst=useCallback((x,y,good)=>{
    const cols=good?["#FFD93D","#6BCB77","#4ECDC4","#fff"]:["#FF6B35","#FF85A1","#C77DFF","#fff"];
    const ps=Array.from({length:12},(_,i)=>({
      id:`${Date.now()}-${i}`,
      x:x+24,y:y+24,
      vx:(Math.random()-0.5)*60,
      vy:-(Math.random()*50+20),
      col:cols[i%4],sz:rnd(5,12),life:1
    }));
    setSparks(s=>[...s,...ps]);
    let frames=0;
    const fade=()=>{
      frames++;
      setSparks(s=>s.map(p=>ps.find(q=>q.id===p.id)?{...p,life:Math.max(0,1-frames/14)}:p));
      if(frames<14) requestAnimationFrame(fade);
      else setSparks(s=>s.filter(p=>!ps.find(q=>q.id===p.id)));
    };
    requestAnimationFrame(fade);
  },[]);

  const doFlap=useCallback(()=>{
    if(phaseRef.current!=="playing") return;
    velRef.current=-5.8;
    setFlap(true); setTimeout(()=>setFlap(false),160);
    audio.splash();
  },[audio]);

  // keyboard
  useEffect(()=>{
    const h=e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();doFlap();}};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[doFlap]);

  // GAME LOOP
  const loop=useCallback((ts)=>{
    if(phaseRef.current!=="playing") return;
    setScroll(x=>x+1.6);

    // gravity
    velRef.current+=0.19;
    const ny=Math.min(H*0.80-RAY_H, Math.max(H*0.07, rayYRef.current+velRef.current));
    setRayY(ny); rayYRef.current=ny;

    const ray={x:RAY_X,y:rayYRef.current,w:RAY_W,h:RAY_H};
    let newColl=[...collRef.current];
    let newLives=livesRef.current;
    let didColl=false,didHit=false,win=false,lose=false;

    const updated=numsRef.current.map(item=>{
      if(item.gone) return null;
      const nx=item.x-item.spd;
      if(nx<-80) return null;

      const overlap=(
        nx<ray.x+ray.w-12 && nx+62>ray.x+12 &&
        item.y<ray.y+ray.h-12 && item.y+62>ray.y+12
      );
      if(overlap){
        const ok=taskRef.current.check(item.n);
        burst(item.x,item.y,ok);
        if(ok){
          if(newColl.length<SLOTS){
            newColl=[...newColl,item.n];
            collRef.current=newColl;
            didColl=true;
            if(newColl.length>=SLOTS) win=true;
          }
        } else {
          newLives--;
          livesRef.current=newLives;
          didHit=true;
          if(newLives<=0) lose=true;
        }
        return null;
      }
      return {...item,x:nx};
    }).filter(Boolean);

    numsRef.current=updated;
    setNums([...updated]);

    if(didColl){ setColl([...newColl]); setScore(s=>s+10); setGlow(true); setTimeout(()=>setGlow(false),300); }
    if(didHit){ setLives(newLives); setHit(true); setTimeout(()=>setHit(false),300); }

    if(win){ setPhase("win"); phaseRef.current="win"; audio.win(); return; }
    if(lose){ setPhase("lose"); phaseRef.current="lose"; return; }

    // spawn
    if(ts-lastSpawn.current>spawnIv.current){
      const n=rnd(1,60);
      const item={id:Math.random().toString(36).slice(2),n,
        x:W+30,y:rnd(H*0.14,H*0.76),spd:1.9+Math.random()*1.3};
      numsRef.current=[...numsRef.current,item];
      lastSpawn.current=ts;
      spawnIv.current=Math.max(1100,spawnIv.current-18);
    }

    animRef.current=requestAnimationFrame(loop);
  },[H,W,RAY_X,RAY_W,RAY_H,burst,audio]);

  useEffect(()=>{
    if(phase==="playing"){ animRef.current=requestAnimationFrame(loop); }
    return()=>{ if(animRef.current) cancelAnimationFrame(animRef.current); };
  },[phase,loop]);

  useEffect(()=>{
    if(bgOn&&phase==="playing") audio.startBg();
    else audio.stopBg();
    return()=>audio.stopBg();
  },[bgOn,phase]);

  useEffect(()=>{ if(glow) audio.collect(); },[glow]);
  useEffect(()=>{ if(hit)  audio.wrong();   },[hit]);

  const startGame=useCallback((t)=>{
    numsRef.current=[]; collRef.current=[]; livesRef.current=3;
    velRef.current=0; rayYRef.current=H*0.44; lastSpawn.current=0; spawnIv.current=2300;
    setNums([]); setColl([]); setLives(3); setScore(0); setScroll(0);
    setSparks([]); setRayY(H*0.44);
    const tk=t||task; taskRef.current=tk; setTask(tk);
    setPhase("playing"); phaseRef.current="playing";
    if(bgOnRef.current) audio.startBg();
  },[H,task,audio]);

  const loadAI=useCallback(async()=>{
    setAiLoad(true); setPhase("loading");
    const t=await fetchAITask();
    setTask(t); taskRef.current=t;
    setAiLoad(false); startGame(t);
  },[startGame]);

  const hearts=[...Array(3)].map((_,i)=>
    <span key={i} style={{fontSize:"1.5rem",opacity:i<lives?1:0.18,lineHeight:1}}>❤️</span>);

  const overlayStyle={position:"absolute",inset:0,zIndex:100,
    display:"flex",alignItems:"center",justifyContent:"center",
    background:"rgba(10,30,60,0.58)",backdropFilter:"blur(7px)"};

  const cardStyle={background:"rgba(255,251,240,0.97)",
    border:"4px solid #1A1A2E",borderRadius:"32px",
    padding:"2.2rem 1.8rem",maxWidth:"430px",width:"90%",
    textAlign:"center",boxShadow:"12px 12px 0 rgba(0,0,0,0.28)",
    animation:"winPop 0.5s cubic-bezier(.175,.885,.32,1.275)"};

  const btn=(bg,col,children,fn)=>(
    <button onClick={fn} style={{fontFamily:"'Fredoka One',cursive",fontSize:"0.98rem",
      padding:"0.65rem 1.3rem",borderRadius:"50px",border:"3px solid #1A1A2E",
      background:bg,color:col,cursor:"pointer",boxShadow:"4px 4px 0 #1A1A2E",
      transition:"transform .1s,box-shadow .1s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #1A1A2E";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #1A1A2E";}}
    >{children}</button>
  );

  return(
    <div onPointerDown={phase==="playing"?doFlap:undefined}
      style={{position:"fixed",inset:0,overflow:"hidden",
        cursor:phase==="playing"?"none":"default",
        userSelect:"none",touchAction:"none",fontFamily:"'Nunito',sans-serif"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');
        @keyframes bubUp{0%{transform:translateY(0);opacity:0.45}100%{transform:translateY(-130px);opacity:0}}
        @keyframes winPop{0%{transform:scale(.3) rotate(-10deg);opacity:0}70%{transform:scale(1.08) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes slotPop{0%{transform:scale(.4)}65%{transform:scale(1.22)}100%{transform:scale(1)}}
        @keyframes numFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes flash{0%,100%{opacity:0}30%,70%{opacity:1}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes confetti{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(108vh) rotate(720deg);opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 14px rgba(107,203,119,0.5)}50%{box-shadow:0 0 30px rgba(107,203,119,0.9)}}
      `}</style>

      <UWBg scrollX={scrollX}/>

      {/* red flash */}
      {hit&&<div style={{position:"absolute",inset:0,background:"rgba(255,50,50,0.22)",
        zIndex:50,pointerEvents:"none",animation:"flash 0.32s ease"}}/>}

      {/* sparks */}
      {sparks.map(p=>(
        <div key={p.id} style={{position:"absolute",
          left:p.x+p.vx*(1-p.life)*0.8,
          top:p.y+p.vy*(1-p.life)*0.8,
          width:p.sz,height:p.sz,borderRadius:"50%",
          background:p.col,opacity:p.life,
          pointerEvents:"none",zIndex:25,
          transform:`scale(${p.life})`}}/>
      ))}

      {/* HUD — slots + task label */}
      {(phase==="playing"||phase==="win"||phase==="lose")&&(
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
          zIndex:30,display:"flex",flexDirection:"column",alignItems:"center",
          paddingTop:12,gap:5,width:"100%",maxWidth:500}}>
          <div style={{display:"flex",gap:8,
            background:"rgba(15,35,80,0.72)",
            border:"3px solid rgba(255,255,255,0.28)",
            borderRadius:18,padding:"7px 14px",
            backdropFilter:"blur(6px)"}}>
            {Array.from({length:SLOTS}).map((_,i)=>(
              <div key={i} style={{width:60,height:60,borderRadius:12,
                background:collected[i]!==undefined?"#6BCB77":"rgba(255,255,255,0.14)",
                border:collected[i]!==undefined?"3px solid #3A9A50":"3px solid rgba(255,255,255,0.22)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Fredoka One',cursive",fontSize:"1.5rem",color:"#1A1A2E",fontWeight:900,
                animation:collected[i]!==undefined?"slotPop 0.4s cubic-bezier(.175,.885,.32,1.275)":"none",
                boxShadow:collected[i]!==undefined?"0 0 14px rgba(107,203,119,0.65)":"none",
                transition:"background 0.2s,border 0.2s"}}>
                {collected[i]!==undefined?collected[i]:""}
              </div>
            ))}
          </div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"clamp(0.95rem,2.4vw,1.25rem)",
            color:"white",textShadow:"0 2px 8px rgba(0,0,0,0.55)"}}>
            {task.label}
          </div>
        </div>
      )}

      {/* lives + score top-right */}
      {(phase==="playing"||phase==="win"||phase==="lose")&&(
        <div style={{position:"absolute",top:14,right:14,zIndex:30,
          display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <div style={{display:"flex",gap:3}}>{hearts}</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
            color:"white",textShadow:"0 2px 6px rgba(0,0,0,0.5)"}}>⭐ {score}</div>
        </div>
      )}

      {/* X + music buttons */}
      <div style={{position:"absolute",top:12,left:12,zIndex:30,display:"flex",gap:8}}>
        {phase==="playing"&&(
          <button onClick={e=>{e.stopPropagation();audio.stopBg();
            numsRef.current=[];if(animRef.current)cancelAnimationFrame(animRef.current);
            setPhase("start");}}
            style={{width:44,height:44,borderRadius:10,background:"rgba(190,0,190,0.88)",
              border:"none",color:"white",fontSize:"1.3rem",cursor:"pointer",
              fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 3px 10px rgba(0,0,0,0.3)"}}>✕</button>
        )}
        <button onClick={e=>{e.stopPropagation();setBgOn(b=>!b);}}
          style={{width:44,height:44,borderRadius:10,
            background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.38)",
            color:"white",fontSize:"1.2rem",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            backdropFilter:"blur(4px)"}}>
          {bgOn?"🎵":"🔇"}
        </button>
      </div>

      {/* floating numbers */}
      {phase==="playing"&&nums.map(item=>(
        <div key={item.id} style={{position:"absolute",left:item.x,top:item.y,
          width:64,height:64,borderRadius:14,
          background:"white",border:"3px solid rgba(0,0,0,0.1)",
          boxShadow:"0 5px 18px rgba(0,0,0,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Nunito',sans-serif",fontWeight:900,
          fontSize:item.n>=100?"1.2rem":"1.75rem",color:"#1A1A2E",
          zIndex:5,pointerEvents:"none",
          animation:"numFloat 2s ease-in-out infinite"}}>
          {item.n}
        </div>
      ))}

      {/* stingray */}
      {phase==="playing"&&(
        <div style={{position:"absolute",left:RAY_X,top:rayY,zIndex:10,pointerEvents:"none"}}>
          <Ray flap={flap} hit={hit} glow={glow}/>
        </div>
      )}

      {/* hint text */}
      {phase==="playing"&&collected.length===0&&nums.length===0&&(
        <div style={{position:"absolute",bottom:"13%",left:"50%",transform:"translateX(-50%)",
          fontFamily:"'Fredoka One',cursive",fontSize:"1.3rem",
          color:"rgba(255,255,255,0.85)",textShadow:"0 2px 8px rgba(0,0,0,0.4)",
          animation:"numFloat 1.6s ease-in-out infinite",zIndex:15,textAlign:"center",
          whiteSpace:"nowrap"}}>
          🐟 Tap / Click / Space to swim up!
        </div>
      )}

      {/* ── START SCREEN ── */}
      {phase==="start"&&(
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{fontSize:"3.8rem",marginBottom:"0.3rem"}}>🐟</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"2rem",color:"#1A1A2E",marginBottom:"0.2rem"}}>
              Number Swim!
            </div>
            <div style={{color:"#666",fontSize:"0.9rem",marginBottom:"1.4rem",lineHeight:1.6}}>
              Guide the stingray to collect the right numbers!<br/>
              <strong>Tap · Click · Space</strong> to swim up 🌊
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
              {TASK_TYPES.map(t=>(
                <button key={t.id} onClick={()=>startGame(t)}
                  style={{fontFamily:"'Fredoka One',cursive",fontSize:"0.95rem",
                    padding:"0.62rem 1rem",borderRadius:"50px",
                    border:"3px solid #1A1A2E",
                    background:task.id===t.id?"#FFD93D":"white",
                    color:"#1A1A2E",cursor:"pointer",
                    boxShadow:"4px 4px 0 #1A1A2E",textAlign:"left",transition:"all .12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #1A1A2E";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #1A1A2E";}}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={loadAI} style={{fontFamily:"'Fredoka One',cursive",fontSize:"1rem",
              padding:"0.75rem 1.8rem",borderRadius:"50px",border:"3px solid #1A1A2E",
              background:"linear-gradient(135deg,#C77DFF,#4ECDC4,#FFD93D)",
              backgroundSize:"300% 300%",animation:"shimmer 2.5s linear infinite",
              color:"white",cursor:"pointer",boxShadow:"4px 4px 0 #1A1A2E",width:"100%"}}>
              ✨ Challenge!
            </button>
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {phase==="loading"&&(
        <div style={overlayStyle}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"4.5rem",animation:"numFloat 0.7s ease-in-out infinite"}}>🐟</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.6rem",color:"white",marginTop:"1rem"}}>
              AI is cooking a challenge…
            </div>
          </div>
        </div>
      )}

      {/* ── WIN ── */}
      {phase==="win"&&(
        <>
          {Array.from({length:28}).map((_,i)=>(
            <div key={i} style={{position:"fixed",left:Math.random()*100+"vw",top:"-30px",
              fontSize:(1+Math.random())+"rem",
              animation:`confetti ${1+Math.random()*0.9}s ease-in ${i*0.055}s forwards`,
              zIndex:90,pointerEvents:"none"}}>
              {["⭐","🎊","🎉","✨","🔢","💛","🌟","🎈"][i%8]}
            </div>
          ))}
          <div style={overlayStyle}>
            <div style={cardStyle}>
              <div style={{fontSize:"3.5rem"}}>🏆</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"2rem",color:"#6BCB77",margin:"0.3rem 0"}}>
                Amazing Job!
              </div>
              <div style={{color:"#555",marginBottom:"0.4rem"}}>You collected all {SLOTS} numbers!</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.4rem",color:"#FF6B35",marginBottom:"1.4rem"}}>
                ⭐ Score: {score}
              </div>
              <div style={{display:"flex",gap:"0.8rem",flexWrap:"wrap",justifyContent:"center"}}>
                {btn("#6BCB77","#1A1A2E","🔄 Play Again",()=>startGame())}
                {btn("#C77DFF","white","✨ Next Challenge",loadAI)}
                {btn("#FFD93D","#1A1A2E","🏠 Menu",()=>{audio.stopBg();numsRef.current=[];setPhase("start");})}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── LOSE ── */}
      {phase==="lose"&&(
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{fontSize:"3.5rem"}}>🐟</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"2rem",color:"#FF6B35",margin:"0.3rem 0"}}>
              Oops!
            </div>
            <div style={{color:"#555",marginBottom:"0.4rem"}}>
              Got {collected.length} / {SLOTS} numbers
            </div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.3rem",color:"#888",marginBottom:"1.4rem"}}>
              ⭐ {score} pts
            </div>
            <div style={{display:"flex",gap:"0.8rem",flexWrap:"wrap",justifyContent:"center"}}>
              {btn("#FF6B35","white","🔄 Try Again",()=>startGame())}
              {btn("#C77DFF","white","✨ Next Challenge",loadAI)}
              {btn("#FFD93D","#1A1A2E","🏠 Menu",()=>{audio.stopBg();numsRef.current=[];setPhase("start");})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
