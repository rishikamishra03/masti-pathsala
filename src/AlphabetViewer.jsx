// AlphabetViewer.jsx
// Usage: <AlphabetViewer onNavigateHome={() => {}} />

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ──────────────────────────────────────────────────────────────────────
const ALPHABETS = [
  { letter: "A", word: "Apple",     emoji: "🍎", color: "#ef4444" },
  { letter: "B", word: "Ball",      emoji: "⚽", color: "#3b82f6" },
  { letter: "C", word: "Cat",       emoji: "🐱", color: "#fb923c" },
  { letter: "D", word: "Dog",       emoji: "🐶", color: "#ca8a04" },
  { letter: "E", word: "Elephant",  emoji: "🐘", color: "#9ca3af" },
  { letter: "F", word: "Fish",      emoji: "🐟", color: "#93c5fd" },
  { letter: "G", word: "Grapes",    emoji: "🍇", color: "#a855f7" },
  { letter: "H", word: "Horse",     emoji: "🐎", color: "#92400e" },
  { letter: "I", word: "Ice Cream", emoji: "🍦", color: "#f9a8d4" },
  { letter: "J", word: "Jellyfish", emoji: "🪼", color: "#c084fc" },
  { letter: "K", word: "Kangaroo",  emoji: "🦘", color: "#ea580c" },
  { letter: "L", word: "Lion",      emoji: "🦁", color: "#eab308" },
  { letter: "M", word: "Monkey",    emoji: "🐒", color: "#b45309" },
  { letter: "N", word: "Nose",      emoji: "👃", color: "#fce7f3" },
  { letter: "O", word: "Orange",    emoji: "🍊", color: "#f97316" },
  { letter: "P", word: "Panda",     emoji: "🐼", color: "#1e293b" },
  { letter: "Q", word: "Queen",     emoji: "👸", color: "#a16207" },
  { letter: "R", word: "Rabbit",    emoji: "🐰", color: "#64748b" },
  { letter: "S", word: "Sun",       emoji: "☀️", color: "#facc15" },
  { letter: "T", word: "Tiger",     emoji: "🐯", color: "#f97316" },
  { letter: "U", word: "Umbrella",  emoji: "☂️", color: "#c084fc" },
  { letter: "V", word: "Violin",    emoji: "🎻", color: "#991b1b" },
  { letter: "W", word: "Whale",     emoji: "🐋", color: "#60a5fa" },
  { letter: "X", word: "Xylophone", emoji: "🎹", color: "#2dd4bf" },
  { letter: "Y", word: "Yo-yo",     emoji: "🪀", color: "#4ade80" },
  { letter: "Z", word: "Zebra",     emoji: "🦓", color: "#334155" },
];

export default function AlphabetViewer({ onNavigateHome, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTeaching, setIsTeaching] = useState(false);

  const current = ALPHABETS[currentIndex];

  const playSound = useCallback((item) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${item.letter} is for ${item.word}`);
    utter.rate = 0.8;
    utter.pitch = 1.2;
    window.speechSynthesis.speak(utter);
  }, []);

  const next = () => {
    if (currentIndex < ALPHABETS.length - 1) {
      const ni = currentIndex + 1;
      setCurrentIndex(ni); playSound(ALPHABETS[ni]);
      
      // If it's the last letter, report completion
      if (ni === ALPHABETS.length - 1 && onComplete) {
        onComplete(100); // 100 points for finishing ABCs
      }
    }
  };
  const prev = () => {
    if (currentIndex > 0) {
      const ni = currentIndex - 1;
      setCurrentIndex(ni); playSound(ALPHABETS[ni]);
    }
  };
  const onTeach = () => {
    setIsTeaching(true); playSound(current);
    setTimeout(() => setIsTeaching(false), 2000);
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

  const progressPct = ((currentIndex + 1) / ALPHABETS.length) * 100;

  return (
    <div className="fixed inset-0 z-[300] bg-[#fff0f6] bg-[radial-gradient(#f472b6_2px,transparent_2px),radial-gradient(#f472b6_1px,transparent_1px)] bg-[size:60px_60px,30px_30px] bg-[position:0_0,30px_30px] flex flex-col items-center p-4 font-sans overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.span animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-10 left-[5%] text-5xl opacity-40">🔤</motion.span>
        <motion.span animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute top-40 right-[8%] text-6xl opacity-30">⭐</motion.span>
        <motion.span animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-20 left-[8%] text-7xl opacity-20">📚</motion.span>
        <motion.span animate={{ y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2 }} className="absolute top-[55%] right-[5%] text-5xl opacity-30">🎨</motion.span>
      </div>

      {/* Main frame */}
      <div className="relative w-full max-w-5xl bg-white/50 backdrop-blur-xl rounded-[3rem] p-6 shadow-2xl border-[12px] border-[#f9a8d4] flex flex-col flex-1 z-10">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 z-30 flex-wrap gap-3">
          <button onClick={onNavigateHome} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl p-4 text-3xl shadow-[0_8px_0_0_#b91c1c] active:shadow-none active:translate-y-2 transition-all">
            🏠
          </button>

          <motion.div animate={{ rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 4 }} className="bg-white px-10 py-3 rounded-full shadow-lg border-[6px] border-[#f9a8d4]">
            <h2 className="text-3xl font-black text-[#831843] uppercase tracking-widest m-0">✨ Magical ABCs ✨</h2>
          </motion.div>

          <div className="flex gap-2 flex-wrap max-w-[200px] justify-end">
            {["A","F","K","P","U","Z"].map(l => (
              <button key={l}
                onClick={() => { const i = ALPHABETS.findIndex(a => a.letter === l); setCurrentIndex(i); playSound(ALPHABETS[i]); }}
                className={`w-10 h-10 rounded-full font-black text-sm border-2 border-[#f9a8d4] transition-all ${current.letter === l ? 'bg-pink-500 text-white scale-110 shadow-lg' : 'bg-white text-pink-900 hover:bg-pink-100'}`}>
                {l}
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
              <div className="w-48 h-56 bg-gradient-to-br from-pink-100 to-pink-200 rounded-[50%_50%_40%_40%] flex flex-col items-center justify-center text-8xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] border-[8px] border-pink-400 relative overflow-hidden group">
                {/* Cute Animated Owl Teacher instead of basic emoji */}
                <span className="relative z-10 drop-shadow-xl group-hover:rotate-12 transition-transform duration-300">🦉</span>
                <div className="absolute bottom-4 w-full flex justify-center gap-4 opacity-70">
                   <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                   <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                </div>
                {isTeaching && (
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity }} className="absolute -top-2 -right-2 text-4xl">✨</motion.div>
                )}
              </div>
              
              {/* Speech Bubble */}
              <AnimatePresence>
                {isTeaching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -top-16 -right-16 bg-white px-6 py-3 rounded-3xl rounded-bl-none shadow-xl border-4 border-pink-300 z-50 whitespace-nowrap"
                  >
                    <span className="text-xl font-bold text-pink-600">"{current.letter} is for {current.word}!"</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center mt-4 font-black text-xl text-[#831843] bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                {isTeaching ? "Teaching! 🎉" : "Click to listen!"}
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
              className={`w-full aspect-[4/3] rounded-[2.5rem] border-[16px] border-[#451a03] p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_0_80px_rgba(0,0,0,0.6)] ${isTeaching ? "scale-[1.02]" : "scale-100"} transition-transform duration-500`}
              style={{ background: "#1e293b", backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-chalkboard.png")' }}
            >
              {/* Chalkboard Ledge */}
              <div className="absolute -bottom-4 left-10 right-10 h-6 bg-[#3e1702] rounded-full shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"></div>

              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 12, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center text-7xl md:text-8xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.3),0_10px_30px_rgba(0,0,0,0.4)]"
                  style={{ background: current.color }}
                >
                  <span className="drop-shadow-lg">{current.emoji}</span>
                </motion.div>

                <motion.span 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[8rem] md:text-[11rem] font-black leading-none drop-shadow-2xl"
                  style={{ 
                    color: "white", 
                    fontFamily: "'Chalkboard SE', cursive",
                    textShadow: "4px 4px 0px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.4)"
                  }}
                >
                  {current.letter}
                </motion.span>

                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="bg-white/10 backdrop-blur-md px-10 py-3 rounded-2xl border-4 border-dashed border-white/30"
                >
                  <p className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest m-0 drop-shadow-md">
                    {current.word}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-8 z-30 gap-4 flex-wrap">
          <button onClick={prev} disabled={currentIndex === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl uppercase tracking-wider border-[4px] border-[#f3f4f6] bg-white text-blue-600 shadow-[0_8px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0 transition-all">
            <span className="text-3xl">⬅️</span><span>Back</span>
          </button>

          <div className="bg-white px-8 py-4 rounded-3xl shadow-lg border-[5px] border-[#fbcfe8] flex flex-col items-center min-w-[200px]">
            <span className="font-black text-pink-900 text-xl">{currentIndex + 1} / {ALPHABETS.length}</span>
            <div className="w-full h-3 bg-pink-100 rounded-full mt-2 overflow-hidden border-2 border-[#fbcfe8]">
              <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <button onClick={next} disabled={currentIndex === ALPHABETS.length - 1}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl uppercase tracking-wider border-[4px] border-[#fbcfe8] bg-pink-500 text-white shadow-[0_8px_15px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-xl disabled:opacity-40 disabled:hover:translate-y-0 transition-all">
            <span>Next</span><span className="text-3xl">➡️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
