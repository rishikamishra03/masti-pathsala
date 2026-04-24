// NumberViewer.jsx
// Usage: <NumberViewer onNavigateHome={() => {}} />

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ──────────────────────────────────────────────────────────────────────
const NUMBER_WORDS = [
  "Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
  "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen","Twenty",
  "Twenty-One","Twenty-Two","Twenty-Three","Twenty-Four","Twenty-Five","Twenty-Six","Twenty-Seven","Twenty-Eight","Twenty-Nine","Thirty",
  "Thirty-One","Thirty-Two","Thirty-Three","Thirty-Four","Thirty-Five","Thirty-Six","Thirty-Seven","Thirty-Eight","Thirty-Nine","Forty",
  "Forty-One","Forty-Two","Forty-Three","Forty-Four","Forty-Five","Forty-Six","Forty-Seven","Forty-Eight","Forty-Nine","Fifty",
  "Fifty-One","Fifty-Two","Fifty-Three","Fifty-Four","Fifty-Five","Fifty-Six","Fifty-Seven","Fifty-Eight","Fifty-Nine","Sixty",
  "Sixty-One","Sixty-Two","Sixty-Three","Sixty-Four","Sixty-Five","Sixty-Six","Sixty-Seven","Sixty-Eight","Sixty-Nine","Seventy",
  "Seventy-One","Seventy-Two","Seventy-Three","Seventy-Four","Seventy-Five","Seventy-Six","Seventy-Seven","Seventy-Eight","Seventy-Nine","Eighty",
  "Eighty-One","Eighty-Two","Eighty-Three","Eighty-Four","Eighty-Five","Eighty-Six","Eighty-Seven","Eighty-Eight","Eighty-Nine","Ninety",
  "Ninety-One","Ninety-Two","Ninety-Three","Ninety-Four","Ninety-Five","Ninety-Six","Ninety-Seven","Ninety-Eight","Ninety-Nine","One Hundred",
];
const NUM_COLORS = ["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#f97316","#ec4899","#6366f1","#14b8a6","#f43f5e"];

const NUMBERS = Array.from({ length: 100 }, (_, i) => ({
  value: i + 1,
  word: NUMBER_WORDS[i + 1],
  color: NUM_COLORS[(i + 1) % NUM_COLORS.length],
}));

// Component to visualize numbers as dots (tens and ones concept)
const NumberVisualizer = ({ count, color }) => {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-[280px] md:max-w-[360px] mx-auto p-4 bg-white/10 rounded-2xl border-2 border-white/20 shadow-inner">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (i % 20) * 0.02, type: "spring" }}
          className={`rounded-full shadow-md ${count > 50 ? 'w-3 h-3 md:w-4 md:h-4' : 'w-5 h-5 md:w-6 md:h-6'}`}
          style={{ background: color }}
        />
      ))}
    </div>
  );
};

export default function NumberViewer({ onNavigateHome, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTeaching, setIsTeaching] = useState(false);

  const current = NUMBERS[currentIndex];
  const ranges = [
    { label: "1-10",   start: 0  },
    { label: "11-20",  start: 10 },
    { label: "21-30",  start: 20 },
    { label: "51-60",  start: 50 },
    { label: "91-100", start: 90 },
  ];

  const playSound = useCallback((item) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${item.word}`);
    utter.rate = 0.8;
    utter.pitch = 1.2;
    window.speechSynthesis.speak(utter);
  }, []);

  const next = () => {
    if (currentIndex < NUMBERS.length - 1) {
      const ni = currentIndex + 1;
      setCurrentIndex(ni); playSound(NUMBERS[ni]);
      
      // If it's the last number (100), report completion
      if (ni === NUMBERS.length - 1 && onComplete) {
        onComplete(100);
      }
    }
  };
  const prev = () => {
    if (currentIndex > 0) {
      const ni = currentIndex - 1;
      setCurrentIndex(ni); playSound(NUMBERS[ni]);
    }
  };
  const onTeach = () => {
    setIsTeaching(true); playSound(current);
    setTimeout(() => setIsTeaching(false), 2000);
  };
  const jumpToRange = (startIdx) => {
    setCurrentIndex(startIdx); playSound(NUMBERS[startIdx]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") { e.preventDefault(); onTeach(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const progressPct = ((currentIndex + 1) / NUMBERS.length) * 100;
  const activeRange = ranges.find((r, i) => {
    const nextRange = ranges[i + 1];
    return currentIndex >= r.start && (!nextRange || currentIndex < nextRange.start);
  });

  return (
    <div className="fixed inset-0 z-[300] bg-[#f0f9ff] bg-[radial-gradient(#38bdf8_2px,transparent_2px),radial-gradient(#38bdf8_1px,transparent_1px)] bg-[size:60px_60px,30px_30px] bg-[position:0_0,30px_30px] flex flex-col items-center p-4 font-sans overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.span animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-10 left-[5%] text-5xl opacity-40">🔢</motion.span>
        <motion.span animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute top-40 right-[8%] text-6xl opacity-30">🌟</motion.span>
        <motion.span animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-20 left-[8%] text-7xl opacity-20">🧮</motion.span>
        <motion.span animate={{ y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2 }} className="absolute top-[55%] right-[5%] text-5xl opacity-30">💡</motion.span>
      </div>

      {/* Main frame */}
      <div className="relative w-full max-w-5xl bg-white/50 backdrop-blur-xl rounded-[3rem] p-6 shadow-2xl border-[12px] border-[#7dd3fc] flex flex-col flex-1 z-10">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 z-30 flex-wrap gap-3">
          <button onClick={onNavigateHome} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl p-4 text-3xl shadow-[0_8px_0_0_#b91c1c] active:shadow-none active:translate-y-2 transition-all">
            🏠
          </button>

          <motion.div animate={{ rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 4 }} className="bg-white px-10 py-3 rounded-full shadow-lg border-[6px] border-[#7dd3fc]">
            <h2 className="text-3xl font-black text-[#0c4a6e] uppercase tracking-widest m-0">🔢 Magical 123s 🔢</h2>
          </motion.div>

          <div className="flex gap-2 flex-wrap max-w-[250px] justify-end">
            {ranges.map(r => (
              <button key={r.label}
                onClick={() => jumpToRange(r.start)}
                className={`px-4 py-2 rounded-full font-black text-sm border-2 transition-all ${activeRange?.label === r.label ? 'bg-sky-500 text-white border-sky-600 scale-110 shadow-lg' : 'bg-white text-sky-800 border-sky-300 hover:bg-sky-100'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-row items-center justify-center gap-10 relative z-10 flex-wrap">
          
          {/* Enhanced Teacher */}
          <div className="flex flex-col items-center justify-end flex-none">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              animate={isTeaching ? { y: [0, -15, 0] } : {}}
              transition={{ duration: 0.5, repeat: isTeaching ? 3 : 0 }}
              onClick={onTeach}
              className="cursor-pointer relative"
            >
              <div className="w-48 h-56 bg-gradient-to-br from-sky-100 to-sky-200 rounded-[50%_50%_40%_40%] flex flex-col items-center justify-center text-8xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] border-[8px] border-sky-400 relative overflow-hidden group">
                {/* Robot Teacher for numbers */}
                <span className="relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">🤖</span>
                <div className="absolute bottom-4 w-full flex justify-center gap-4 opacity-70">
                   <div className="w-6 h-3 bg-sky-400 rounded-full"></div>
                </div>
                {isTeaching && (
                  <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute -top-2 -right-2 text-4xl">⚙️</motion.div>
                )}
              </div>
              
              {/* Speech Bubble */}
              <AnimatePresence>
                {isTeaching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -top-16 -right-16 bg-white px-6 py-3 rounded-3xl rounded-bl-none shadow-xl border-4 border-sky-300 z-50 whitespace-nowrap"
                  >
                    <span className="text-xl font-bold text-sky-600">"This is {current.word}!"</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center mt-4 font-black text-xl text-[#0c4a6e] bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                {isTeaching ? "Computing! 🧠" : "Click to hear!"}
              </p>
            </motion.div>
          </div>

          {/* Chalkboard / Display Area */}
          <div className="flex-1 flex items-center justify-center max-w-2xl">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={`w-full aspect-[4/3] rounded-[2.5rem] border-[16px] border-[#0f172a] p-6 flex flex-col items-center justify-between relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_0_80px_rgba(0,0,0,0.6)] ${isTeaching ? "scale-[1.02]" : "scale-100"} transition-transform duration-500`}
              style={{ background: "#1e293b", backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-chalkboard.png")' }}
            >
              {/* Chalkboard Ledge */}
              <div className="absolute -bottom-4 left-10 right-10 h-6 bg-[#0c1222] rounded-full shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"></div>

              {/* Number Visualizer (Dots/Stars) */}
              <div className="w-full h-32 md:h-40 flex items-center justify-center overflow-y-auto custom-scrollbar pt-4">
                 <NumberVisualizer count={current.value} color={current.color} />
              </div>

              {/* Huge Number */}
              <motion.span 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[6rem] md:text-[9rem] font-black leading-none drop-shadow-2xl z-10"
                style={{ 
                  color: "white", 
                  fontFamily: "'Chalkboard SE', cursive",
                  textShadow: `4px 4px 0px ${current.color}80, 0 0 30px ${current.color}AA`
                }}
              >
                {current.value}
              </motion.span>

              {/* Word */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="bg-white/10 backdrop-blur-md px-10 py-3 rounded-2xl border-4 border-dashed border-white/30 z-10 mb-4"
              >
                <p className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest m-0 drop-shadow-md">
                  {current.word}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-8 z-30 gap-4 flex-wrap">
          <button onClick={prev} disabled={currentIndex === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl uppercase tracking-wider border-[4px] border-[#e0f2fe] bg-white text-sky-700 shadow-[0_8px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0 transition-all">
            <span className="text-3xl">⬅️</span><span>Back</span>
          </button>

          <div className="bg-white px-8 py-4 rounded-3xl shadow-lg border-[5px] border-[#bae6fd] flex flex-col items-center min-w-[200px]">
            <span className="font-black text-sky-900 text-xl">{currentIndex + 1} / {NUMBERS.length}</span>
            <div className="w-full h-3 bg-sky-100 rounded-full mt-2 overflow-hidden border-2 border-[#bae6fd]">
              <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <button onClick={next} disabled={currentIndex === NUMBERS.length - 1}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl uppercase tracking-wider border-[4px] border-[#bae6fd] bg-sky-500 text-white shadow-[0_8px_15px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0 transition-all">
            <span>Next</span><span className="text-3xl">➡️</span>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
}
