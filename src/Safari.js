import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import local images directly to bypass all network restrictions
import lionImg from './assets/safari/lion.jpg';
import elephantImg from './assets/safari/elephant.jpg';
import giraffeImg from './assets/safari/giraffe.jpg';
import cheetahImg from './assets/safari/cheetah.jpg';
import zebraImg from './assets/safari/zebra.jpg';
import monkeyImg from './assets/safari/monkey.jpg';
import tigerImg from './assets/safari/tiger.jpg';
import parrotImg from './assets/safari/parrot.jpg';
import frogImg from './assets/safari/frog.jpg';
import dolphinImg from './assets/safari/dolphin.jpg';
import turtleImg from './assets/safari/turtle.jpg';
import sharkImg from './assets/safari/shark.jpg';
import octopusImg from './assets/safari/octopus.jpg';
import whaleImg from './assets/safari/whale.jpg';


// ─── AUDIO ENGINE ────────────────────────────────────────────────────────────
const AudioCtx = typeof window !== "undefined" ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playTone(freq = 440, type = "sine", duration = 0.12, vol = 0.1) {
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

const speak = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

const playClick = () => playTone(600, "triangle", 0.1);
const playSuccess = () => {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, "sine", 0.15, 0.15), i * 100));
};
const playFail = () => {
  [300, 250].forEach((f, i) => setTimeout(() => playTone(f, "sawtooth", 0.2, 0.1), i * 150));
};

// ─── HIGH RELIABILITY STATIC IMAGE DATABASE ──────────────────────────────────
const ANIMALS = [
  // 🌍 SAVANNA
  { 
    id: 'lion', name: 'Lion', habitat: 'Savanna', diet: 'Carnivore',
    image: lionImg,
    wiki: 'https://en.wikipedia.org/wiki/Lion',
    fact: 'Lions are the only wild cats that live in large families called prides!', 
    bg: 'bg-amber-100', color: 'text-amber-800'
  },
  { 
    id: 'elephant', name: 'Elephant', habitat: 'Savanna', diet: 'Herbivore',
    image: elephantImg,
    wiki: 'https://en.wikipedia.org/wiki/Elephant',
    fact: 'An elephant trunk has over 40,000 muscles in it!', 
    bg: 'bg-stone-100', color: 'text-stone-800'
  },
  { 
    id: 'giraffe', name: 'Giraffe', habitat: 'Savanna', diet: 'Herbivore',
    image: giraffeImg,
    wiki: 'https://en.wikipedia.org/wiki/Giraffe',
    fact: 'Giraffes have dark blue tongues to protect them from sunburn while eating leaves.', 
    bg: 'bg-yellow-100', color: 'text-yellow-800'
  },
  { 
    id: 'cheetah', name: 'Cheetah', habitat: 'Savanna', diet: 'Carnivore',
    image: cheetahImg,
    wiki: 'https://en.wikipedia.org/wiki/Cheetah',
    fact: 'Cheetahs are the fastest land animals, reaching speeds of 70 mph!', 
    bg: 'bg-orange-100', color: 'text-orange-800'
  },
  { 
    id: 'zebra', name: 'Zebra', habitat: 'Savanna', diet: 'Herbivore',
    image: zebraImg,
    wiki: 'https://en.wikipedia.org/wiki/Zebra',
    fact: 'No two zebras have the exact same stripe pattern!', 
    bg: 'bg-zinc-100', color: 'text-zinc-800'
  },
  
  // 🌴 JUNGLE
  { 
    id: 'monkey', name: 'Monkey', habitat: 'Jungle', diet: 'Omnivore',
    image: monkeyImg,
    wiki: 'https://en.wikipedia.org/wiki/Monkey',
    fact: 'Many monkeys have prehensile tails they use like an extra hand to swing on branches.', 
    bg: 'bg-emerald-100', color: 'text-emerald-800'
  },
  { 
    id: 'tiger', name: 'Tiger', habitat: 'Jungle', diet: 'Carnivore',
    image: tigerImg,
    wiki: 'https://en.wikipedia.org/wiki/Tiger',
    fact: 'Tigers are excellent swimmers and love to cool off in the water!', 
    bg: 'bg-orange-200', color: 'text-orange-900'
  },
  { 
    id: 'parrot', name: 'Parrot', habitat: 'Jungle', diet: 'Herbivore',
    image: parrotImg,
    wiki: 'https://en.wikipedia.org/wiki/Parrot',
    fact: 'Parrots are incredibly smart birds and can mimic human speech.', 
    bg: 'bg-rose-100', color: 'text-rose-800'
  },
  { 
    id: 'frog', name: 'Tree Frog', habitat: 'Jungle', diet: 'Carnivore',
    image: frogImg,
    wiki: 'https://en.wikipedia.org/wiki/Tree_frog',
    fact: 'Some tree frogs have sticky pads on their toes to help them climb wet leaves.', 
    bg: 'bg-lime-100', color: 'text-lime-800'
  },

  // 🌊 OCEAN
  { 
    id: 'dolphin', name: 'Dolphin', habitat: 'Ocean', diet: 'Carnivore',
    image: dolphinImg,
    wiki: 'https://en.wikipedia.org/wiki/Dolphin',
    fact: 'Dolphins are actually mammals, not fish! They breathe air through a blowhole.', 
    bg: 'bg-sky-100', color: 'text-sky-800'
  },
  { 
    id: 'turtle', name: 'Sea Turtle', habitat: 'Ocean', diet: 'Omnivore',
    image: turtleImg,
    wiki: 'https://en.wikipedia.org/wiki/Sea_turtle',
    fact: 'Some sea turtles can hold their breath for up to 5 hours while sleeping underwater!', 
    bg: 'bg-teal-100', color: 'text-teal-800'
  },
  { 
    id: 'shark', name: 'Great White Shark', habitat: 'Ocean', diet: 'Carnivore',
    image: sharkImg,
    wiki: 'https://en.wikipedia.org/wiki/Shark',
    fact: 'Sharks have been living in the oceans for over 400 million years!', 
    bg: 'bg-slate-200', color: 'text-slate-800'
  },
  { 
    id: 'octopus', name: 'Octopus', habitat: 'Ocean', diet: 'Carnivore',
    image: octopusImg,
    wiki: 'https://en.wikipedia.org/wiki/Octopus',
    fact: 'An octopus has three hearts and blue blood!', 
    bg: 'bg-purple-100', color: 'text-purple-800'
  },
  { 
    id: 'whale', name: 'Humpback Whale', habitat: 'Ocean', diet: 'Carnivore',
    image: whaleImg,
    wiki: 'https://en.wikipedia.org/wiki/Humpback_whale',
    fact: 'Humpback whales sing complex songs that can last for 20 minutes!', 
    bg: 'bg-cyan-100', color: 'text-cyan-800'
  },
];

const HABITATS = [
  { id: 'savanna', name: 'Savanna', color: 'from-[#F5B041] to-[#E67E22]', bg: 'bg-[#E67E22]' },
  { id: 'jungle', name: 'Jungle', color: 'from-[#2ECC71] to-[#27AE60]', bg: 'bg-[#27AE60]' },
  { id: 'ocean', name: 'Ocean', color: 'from-[#3498DB] to-[#2980B9]', bg: 'bg-[#2980B9]' },
];

// ─── SAFARI COMPONENT ───────────────────────────────────────────────────────
export default function Safari({ onBack }) {
  const [activeHabitat, setActiveHabitat] = useState('savanna');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  
  // Mini-game State
  const [gameActive, setGameActive] = useState(false);
  const [targetAnimal, setTargetAnimal] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentAnimals = ANIMALS.filter(a => a.habitat.toLowerCase() === activeHabitat);

  const startQuiz = () => {
    playClick();
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setTargetAnimal(randomAnimal);
    setActiveHabitat(randomAnimal.habitat.toLowerCase());
    setGameActive(true);
    setFeedback(null);

  };

  const handleAnimalClick = (animal) => {
    playClick();
    if (gameActive && targetAnimal) {
      if (animal.id === targetAnimal.id) {
        setFeedback('success');
        playSuccess();

        setTimeout(() => {
          setGameActive(false);
          setTargetAnimal(null);
          setFeedback(null);
          setSelectedAnimal(animal);
        }, 2000);
      } else {
        setFeedback('fail');
        playFail();

        setTimeout(() => setFeedback(null), 1500);
      }
    } else {
      setSelectedAnimal(animal);
    }
  };

  const handleSpeak = (text) => {
    playClick();
    speak(text);
  };


  const openWiki = (url) => {
    playClick();
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col font-sans overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet"/>
      
      {/* Dynamic Background */}
      <div className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-br ${HABITATS.find(h => h.id === activeHabitat).color}`} />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-black/10 backdrop-blur-sm">
        <button onClick={() => { playClick(); onBack(); }} className="w-14 h-14 bg-white/20 hover:bg-white/40 rounded-2xl flex items-center justify-center text-3xl shadow-lg backdrop-blur-md transition-all border-2 border-white/50 text-white">
          ✕
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-wider" style={{ fontFamily: '"Fredoka One", cursive' }}>
            SAFARI ADVENTURE
          </h1>
          <p className="text-white/90 font-bold text-lg mt-1 tracking-wide uppercase">Discover Real Animals!</p>
        </div>
        <button onClick={startQuiz} className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-2xl font-black text-xl shadow-[0_6px_0_#B7950B] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 border-2 border-white/30">
          🎮 Play Quiz
        </button>
      </div>

      {/* Mini-Game Banner */}
      <AnimatePresence>
        {gameActive && targetAnimal && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative z-30 mx-auto mt-6 px-10 py-5 bg-white rounded-3xl shadow-2xl border-4 border-yellow-400 max-w-xl text-center"
          >
            <h2 className="text-3xl font-black text-gray-800" style={{ fontFamily: '"Fredoka One", cursive' }}>Who Am I? 🤔</h2>
            <p className="text-xl text-gray-600 mt-2 font-bold">Find the <span className="text-yellow-600 text-3xl uppercase tracking-wider">{targetAnimal.name}</span>!</p>
            {feedback === 'success' && <div className="absolute inset-0 bg-green-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-inner">CORRECT! 🎉</div>}
            {feedback === 'fail' && <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-inner">Keep Looking! 🧐</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habitat Navigation */}
      <div className="relative z-20 flex justify-center gap-6 mt-auto mb-10">
        {HABITATS.map(hab => (
          <button
            key={hab.id}
            onClick={() => { playClick(); setActiveHabitat(hab.id); }}
            className={`px-10 py-4 rounded-3xl font-black text-2xl shadow-xl transition-all border-4 ${activeHabitat === hab.id ? 'bg-white border-white scale-110 shadow-2xl text-gray-900' : `${hab.bg} border-white/40 text-white hover:scale-105 opacity-90`}`}
            style={{ fontFamily: '"Fredoka One", cursive' }}
          >
            {hab.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Safari Stage (Animals) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mt-24">
        <div className="flex flex-wrap justify-center gap-10 max-w-7xl px-10 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {currentAnimals.map((animal, i) => (
              <motion.div
                key={animal.id}
                layout
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 50 }}
                transition={{ delay: i * 0.1, type: "spring", bounce: 0.5 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnimalClick(animal)}
                className={`w-56 h-56 rounded-[40px] shadow-[0_15px_35px_rgba(0,0,0,0.3)] cursor-pointer transition-all relative group overflow-hidden border-4 border-white`}
              >
                {/* Animal Image */}
                <img 
                  src={animal.image} 
                  alt={animal.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-black/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                <div className="absolute bottom-5 left-0 w-full text-center">
                  <span className="font-black text-white text-2xl tracking-wide drop-shadow-md" style={{ fontFamily: '"Fredoka One", cursive' }}>
                    {animal.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Animal Info Modal Overlay */}
      <AnimatePresence>
        {selectedAnimal && !gameActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className={`max-w-3xl w-full bg-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row`}
            >
              {/* Close Button */}
              <button onClick={() => { playClick(); setSelectedAnimal(null); }} className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm transition-all border-2 border-white/30">
                ✕
              </button>
              
              {/* Left Side: Large Image */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black/10">
                <img 
                  src={selectedAnimal.image} 
                  alt={selectedAnimal.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
              </div>
              
              {/* Right Side: Content */}
              <div className={`w-full md:w-1/2 p-8 flex flex-col justify-center ${selectedAnimal.bg}`}>
                
                <h2 className={`text-4xl font-black mb-4 uppercase ${selectedAnimal.color} drop-shadow-sm`} style={{ fontFamily: '"Fredoka One", cursive' }}>
                  {selectedAnimal.name}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-4 py-1.5 bg-white/90 rounded-2xl text-xs font-black shadow-sm text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                    🌍 {selectedAnimal.habitat}
                  </span>
                  <span className="px-4 py-1.5 bg-white/90 rounded-2xl text-xs font-black shadow-sm text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                    🍽️ {selectedAnimal.diet}
                  </span>
                </div>
                
                <div className="bg-white/80 p-5 rounded-3xl w-full mb-6 shadow-inner flex-1 overflow-y-auto">
                  <p className="text-lg font-bold text-gray-800 leading-relaxed mb-4">
                    "{selectedAnimal.fact}"
                  </p>
                  
                  {/* Read More button */}
                  <button onClick={() => openWiki(selectedAnimal.wiki)} className="px-5 py-2.5 bg-[#0e7490] hover:bg-[#164e63] text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all w-full flex items-center justify-center gap-2">
                    📖 Read More on Wikipedia
                  </button>
                </div>
                
                <div className="flex gap-3 w-full">
                  <button onClick={() => handleSpeak(selectedAnimal.fact)} className={`flex-1 py-4 rounded-2xl font-black text-white shadow-lg hover:-translate-y-1 transition-all text-xl flex items-center justify-center gap-3 ${selectedAnimal.color.replace('text-', 'bg-')} border-2 border-black/10`}>
                    🗣️ Read Animal Fact
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
