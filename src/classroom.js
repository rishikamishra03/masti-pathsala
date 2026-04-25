import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Search, Mic, Settings, User, Users, Cog, LogIn, X } from 'lucide-react';

// --- IMAGE IMPORTS ---
import teacherImg from './tre.png'; 
import abcImg from './abc.png';
import aniImg from './ani.png';
import numImg from './num.png';
import poemImg from './poem.png';
import traceImg from './trace.png';
import colorsImg from './colors.png';
import gameImg from './games.png';
import drawImg from './draw.png';

import AlphabetViewer from './AlphabetViewer';
import NumberViewer from './NumberViewer';
import ColoringGame from './Drawing';
import PoemSection from './PoemSection';
import WordTracer from './WordTracer';


const playSound = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.pitch = 1.3;
  window.speechSynthesis.speak(utterance);
};

export default function App({ onGameFinish }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Updated items with your specific images
  const items = [
    { id: 1, title: 'Alphabets', img: abcImg, extra: ['🍎', '🏏'], bg: 'bg-[#FFEBEE]', shadow: '#EF9A9A' },
    { id: 2, title: 'Numbers', img: numImg, extra: ['1️⃣', '2️⃣', '3️⃣'], bg: 'bg-[#FFF9C4]', shadow: '#FFF176' },
    { id: 3, title: 'Word Tracer', img: traceImg, extra: ['🎨', '✏️'], bg: 'bg-[#E8F5E9]', shadow: '#A5D6A7' },
    { id: 4, title: 'Poem', img: poemImg, extra: ['📖', '🪄'], bg: 'bg-[#E3F2FD]', shadow: '#90CAF9' },
    { id: 5, title: 'Games', img: gameImg, extra: ['🎮', '🧩'], bg: 'bg-[#F3E5F5]', shadow: '#CE93D8' },
    { id: 6, title: 'Animals', img: aniImg, extra: ['🦁', '🐘'], bg: 'bg-[#FFF3E0]', shadow: '#FFCC80' },
    { id: 7, title: 'Colors Name', img: colorsImg, extra: ['🎨', '🖌️'], bg: 'bg-[#FCE4EC]', shadow: '#F48FB1' },
    { id: 8, title: 'Drawing', img: drawImg, extra: ['🖍️', '🖼️'], bg: 'bg-[#E0F7FA]', shadow: '#80DEEA' },
  ];

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="min-h-screen w-full bg-[#1A237E] overflow-hidden relative font-sans">
      
      {/* --- CLASSROOM BG --- */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://img.freepik.com/free-vector/cartoon-kindergarten-room-interior-with-toys_107791-1433.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A237E]/70 via-transparent to-[#1A237E]/90 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="relative z-50 px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-xl border-b-4 border-gray-300">
             <span className="text-3xl">👩‍🏫</span>
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            MASTI <span className="text-[#FFD54F]">PATHSHALA</span>
          </h1>
        </div>

        <div className="flex-grow flex justify-center px-10">
          <div className="relative w-full max-w-xl">
            <input type="text" placeholder="Khojiye..." className="w-full py-4 px-14 rounded-full bg-white/90 border-b-8 border-gray-300 font-bold shadow-2xl outline-none" />
            <Search className="absolute left-6 top-4 text-[#3F51B5]" size={24} />
            <Mic className="absolute right-6 top-4 text-gray-400" size={24} />
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowSettings(!showSettings)} className="bg-white/90 p-4 rounded-2xl shadow-2xl border-b-4 border-gray-300 text-[#3F51B5]">
            <Settings size={30} />
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-[1900px] mx-auto px-12 flex h-[80vh] items-end relative z-20">
        
        {/* TEACHER LEFT */}
        <div className="w-1/3 flex justify-start">
          <motion.img 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            src={teacherImg} 
            className="h-[80vh] w-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] saturate-[1.3]"
          />
        </div>

        {/* CONTENT RIGHT GRID */}
        <main className="w-2/3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 pb-20 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar">
          {items.map((item) => (
            <motion.div
              layoutId={`card-${item.id}`}
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                playSound(item.title);
              }}
              style={{ boxShadow: selectedId === item.id ? 'none' : `0 12px 0 ${item.shadow}` }}
              className={`${item.bg} rounded-[50px] p-6 flex flex-col items-center justify-center cursor-pointer border-[6px] border-white transition-all relative group`}
            >
              {/* Category Image */}
              <img 
                src={item.img} 
                alt={item.title}
                className="w-32 h-32 object-contain mb-4 group-hover:scale-110 transition-transform" 
              />
              <h2 className="text-xl font-black text-[#3E2723] uppercase italic">{item.title}</h2>
            </motion.div>
          ))}
        </main>
      </div>

      {/* --- ZOOMED OVERLAY --- */}
      <AnimatePresence>
        {selectedId === 1 && (
          <div className="fixed inset-0 z-[500] bg-white">
            <button 
              onClick={() => setSelectedId(null)}
              className="absolute top-6 left-6 z-[600] bg-red-500 text-white px-6 py-2 rounded-xl font-black shadow-xl border-b-4 border-red-700 hover:bg-red-600 transition-all"
            >
              ← Back
            </button>
            <AlphabetViewer 
              onNavigateHome={() => setSelectedId(null)} 
            />
          </div>
        )}
        {selectedId === 2 && (
          <div className="fixed inset-0 z-[500] bg-white">
            <button 
              onClick={() => setSelectedId(null)}
              className="absolute top-6 left-6 z-[600] bg-red-500 text-white px-6 py-2 rounded-xl font-black shadow-xl border-b-4 border-red-700 hover:bg-red-600 transition-all"
            >
              ← Back
            </button>
            <NumberViewer 
              onNavigateHome={() => setSelectedId(null)} 
              onComplete={(score) => {
                if (onGameFinish) onGameFinish('num', score);
              }}
            />
          </div>
        )}
        {selectedId === 8 && (
          <div className="fixed inset-0 z-[500] bg-white">
            <button 
              onClick={() => setSelectedId(null)}
              className="absolute top-6 left-6 z-[600] bg-red-500 text-white px-6 py-2 rounded-xl font-black shadow-xl border-b-4 border-red-700 hover:bg-red-600 transition-all"
            >
              ← Back
            </button>
            <ColoringGame onBack={() => setSelectedId(null)} />
          </div>
        )}
        {selectedId === 4 && (
          <div className="fixed inset-0 z-[500] bg-white">
            <PoemSection onBack={() => setSelectedId(null)} />
          </div>
        )}
        {selectedId === 3 && (
          <div className="fixed inset-0 z-[500] bg-white">
            <WordTracer onBack={() => setSelectedId(null)} />
          </div>
        )}
        {selectedId > 4 && selectedId !== 8 && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/50 backdrop-blur-md">
            <motion.div 
              layoutId={`card-${selectedId}`}
              className={`${selectedItem.bg} w-full max-max-w-2xl aspect-video rounded-[60px] border-[15px] border-white shadow-2xl relative flex flex-col items-center justify-center`}
            >
              <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 p-4 bg-white rounded-full shadow-lg text-red-500 hover:rotate-90 transition-transform">
                <X size={32} strokeWidth={4} />
              </button>

              <motion.img 
                initial={{ scale: 0.5 }} 
                animate={{ scale: 1 }} 
                src={selectedItem.img} 
                className="h-64 object-contain mb-6 drop-shadow-2xl" 
              />

              <h2 className="text-6xl font-black text-[#3E2723] uppercase italic">
                {selectedItem.title}
              </h2>

              <div className="absolute top-10 left-10 flex flex-col gap-4">
                {selectedItem.extra.map((ex, idx) => (
                  <motion.span 
                    key={idx}
                    initial={{ x: -100, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="text-7xl bg-white/40 p-4 rounded-3xl backdrop-blur-sm border-2 border-white/50"
                  >
                    {ex}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FLOOR --- */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#2E7D32] to-[#4CAF50] border-t-8 border-[#1B5E20]/30 z-10 flex items-center px-16">
        <span className="text-6xl animate-bounce">🦕</span>
      </div>
    </div>
  );
}