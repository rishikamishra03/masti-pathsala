import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';

const playSpeech = (text) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = 1.2;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

export default function AlphabetGame({ onBack }) {
  const [selectedLetter, setSelectedLetter] = useState(null);

  const alphabetData = [
    { letter: 'A', word: 'Apple', emoji: '🍎', bg: 'bg-red-100', border: 'border-red-400' },
    { letter: 'B', word: 'Ball', emoji: '⚽', bg: 'bg-blue-100', border: 'border-blue-400' },
    { letter: 'C', word: 'Cat', emoji: '🐱', bg: 'bg-orange-100', border: 'border-orange-400' },
    { letter: 'D', word: 'Dog', emoji: '🐶', bg: 'bg-green-100', border: 'border-green-400' },
    { letter: 'E', word: 'Elephant', emoji: '🐘', bg: 'bg-purple-100', border: 'border-purple-400' },
    { letter: 'F', word: 'Fish', emoji: '🐟', bg: 'bg-cyan-100', border: 'border-cyan-400' },
    { letter: 'G', word: 'Goat', emoji: '🐐', bg: 'bg-emerald-100', border: 'border-emerald-400' },
    { letter: 'H', word: 'Hat', emoji: '🎩', bg: 'bg-pink-100', border: 'border-pink-400' },
    { letter: 'I', word: 'Igloo', emoji: '❄️', bg: 'bg-indigo-100', border: 'border-indigo-400' },
    { letter: 'J', word: 'Juice', emoji: '🧃', bg: 'bg-yellow-100', border: 'border-yellow-400' },
    { letter: 'K', word: 'Kite', emoji: '🪁', bg: 'bg-red-100', border: 'border-red-400' },
    { letter: 'L', word: 'Lion', emoji: '🦁', bg: 'bg-orange-100', border: 'border-orange-400' },
    { letter: 'M', word: 'Monkey', emoji: '🐒', bg: 'bg-amber-100', border: 'border-amber-400' },
    { letter: 'N', word: 'Nose', emoji: '👃', bg: 'bg-sky-100', border: 'border-sky-400' },
    { letter: 'O', word: 'Orange', emoji: '🍊', bg: 'bg-orange-200', border: 'border-orange-500' },
    { letter: 'P', word: 'Parrot', emoji: '🦜', bg: 'bg-green-200', border: 'border-green-500' },
    { letter: 'Q', word: 'Queen', emoji: '👸', bg: 'bg-violet-100', border: 'border-violet-400' },
    { letter: 'R', word: 'Rabbit', emoji: '🐇', bg: 'bg-gray-100', border: 'border-gray-400' },
    { letter: 'S', word: 'Sun', emoji: '☀️', bg: 'bg-yellow-200', border: 'border-yellow-500' },
    { letter: 'T', word: 'Tiger', emoji: '🐯', bg: 'bg-orange-200', border: 'border-orange-600' },
    { letter: 'U', word: 'Umbrella', emoji: '☂️', bg: 'bg-blue-200', border: 'border-blue-500' },
    { letter: 'V', word: 'Violin', emoji: '🎻', bg: 'bg-purple-200', border: 'border-purple-500' },
    { letter: 'W', word: 'Watch', emoji: '⌚', bg: 'bg-slate-100', border: 'border-slate-400' },
    { letter: 'X', word: 'Xylophone', emoji: '🎹', bg: 'bg-rose-100', border: 'border-rose-400' },
    { letter: 'Y', word: 'Yo-Yo', emoji: '🪀', bg: 'bg-lime-100', border: 'border-lime-400' },
    { letter: 'Z', word: 'Zebra', emoji: '🦓', bg: 'bg-zinc-200', border: 'border-zinc-500' },
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-[#1A237E] flex flex-col overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://img.freepik.com/free-vector/cartoon-kindergarten-room-interior-with-toys_107791-1433.jpg')] bg-cover bg-center" />
      
      <header className="relative z-50 px-10 py-6 flex items-center justify-between bg-white/10 backdrop-blur-md border-b-4 border-white/20">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-2 rounded-2xl shadow-xl border-b-4 border-orange-700 animate-bounce">
             <span className="text-3xl text-white font-bold">ABC</span>
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            Alphabet <span className="text-[#FFD54F]">Adventure</span>
          </h1>
        </div>
        <button onClick={onBack} className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-xl border-b-4 border-red-800 transition-all flex items-center gap-2 font-bold">
          <X size={28} /> Close
        </button>
      </header>

      <main className="relative z-20 flex-grow p-8 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
          {alphabetData.map((item) => (
            <motion.div
              key={item.letter}
              whileHover={{ scale: 1.1, rotate: 2 }}
              onMouseEnter={() => playSpeech(`${item.letter} for ${item.word}`)}
              onClick={() => setSelectedLetter(item)}
              className={`${item.bg} ${item.border} border-b-8 rounded-[40px] p-6 flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all h-48 group`}
            >
              <span className="text-6xl font-black text-gray-800 mb-2">{item.letter}</span>
              <span className="text-4xl group-hover:animate-bounce">{item.emoji}</span>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
              className={`${selectedLetter.bg} w-full max-w-2xl rounded-[60px] border-[12px] border-white shadow-2xl p-12 flex flex-col items-center relative`}
            >
              <button onClick={() => setSelectedLetter(null)} className="absolute -top-6 -right-6 bg-red-500 text-white p-4 rounded-full border-4 border-white shadow-2xl">
                <X size={40} strokeWidth={4} />
              </button>
              <div className="flex gap-8 items-center mb-8">
                <span className="text-[12rem] font-black text-gray-900">{selectedLetter.letter}</span>
                <span className="text-[10rem] animate-pulse">{selectedLetter.emoji}</span>
              </div>
              <h2 className="text-7xl font-black text-gray-800 uppercase italic">{selectedLetter.word}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}