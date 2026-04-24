import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind, Zap, Smile, CloudRain, ShieldCheck } from 'lucide-react';

const MOODS = [
  { 
    id: 'happy', 
    label: 'Happy', 
    emoji: '😊', 
    color: 'bg-yellow-400', 
    fish: '🐠', 
    icon: <Smile className="w-6 h-6" />, 
    thoughts: [
      "Your smile makes the world a brighter place!",
      "I am a good friend to others.",
      "I celebrate my small wins today!",
      "I am proud of who I am!",
      "I choose to see the good in today.",
      "My heart is full of sunshine!",
      "I am capable of spreading joy.",
      "I am grateful for this moment.",
      "I am a light in the world.",
      "I love being me!"
    ]
  },
  { 
    id: 'calm', 
    label: 'Calm', 
    emoji: '😌', 
    color: 'bg-teal-400', 
    fish: '🐢', 
    icon: <Wind className="w-6 h-6" />, 
    thoughts: [
      "I feel like a peaceful sea turtle.",
      "My breath is slow and steady like the waves.",
      "I am safe and relaxed.",
      "I am at peace with myself.",
      "I am as quiet as a sleeping shell.",
      "I let go of worries like bubbles rising.",
      "I am centered and grounded.",
      "My mind is a still, blue lake.",
      "I take one step at a time.",
      "I am calm and in control."
    ]
  },
  { 
    id: 'sad', 
    label: 'Sad', 
    emoji: '😢', 
    color: 'bg-blue-400', 
    fish: '🐟', 
    icon: <CloudRain className="w-6 h-6" />, 
    thoughts: [
      "It's okay to let my feelings flow like water.",
      "I can ask for a hug if I need one.",
      "A cloudy day always ends with sunshine.",
      "I am kind to myself even when I'm sad.",
      "My feelings are valid and important.",
      "I can take my time to feel better.",
      "Even the ocean has deep, quiet places.",
      "I am stronger than my sadness.",
      "Tomorrow is a fresh start.",
      "I am loved and supported."
    ]
  },
  { 
    id: 'angry', 
    label: 'Angry', 
    emoji: '😠', 
    color: 'bg-red-400', 
    fish: '🐡', 
    icon: <Zap className="w-6 h-6" />, 
    thoughts: [
      "I can use my words to say how I feel.",
      "I am the boss of my temper.",
      "Taking a big breath helps my bubbles settle.",
      "I can step back and cool down.",
      "I am in charge of my reactions.",
      "I can count to ten when I feel hot.",
      "My peace is more important than my anger.",
      "I can find a safe way to let it out.",
      "I am a problem solver.",
      "I choose kindness over anger."
    ]
  },
  { 
    id: 'excited', 
    label: 'Excited', 
    emoji: '🤩', 
    color: 'bg-purple-400', 
    fish: '🐬', 
    icon: <Heart className="w-6 h-6" />, 
    thoughts: [
      "I am ready for a fun adventure!",
      "My heart is jumping with joy!",
      "I can share my big energy with kindness.",
      "I am full of positive energy!",
      "I embrace the magic of today!",
      "My enthusiasm is contagious!",
      "I am excited to learn new things.",
      "I can do anything I put my mind to!",
      "Life is full of wonderful surprises!",
      "I am a bundle of happy energy!"
    ]
  },
  { 
    id: 'brave', 
    label: 'Brave', 
    emoji: '🦁', 
    color: 'bg-orange-400', 
    fish: '🦈', 
    icon: <ShieldCheck className="w-6 h-6" />, 
    thoughts: [
      "I can do hard things!",
      "I am brave enough to try something new.",
      "Mistakes help me grow stronger.",
      "I have the heart of a lion!",
      "I am resilient and tough.",
      "I face my fears with a smile.",
      "I am a brave explorer of life.",
      "I can handle any wave that comes my way.",
      "I believe in myself.",
      "I am powerful beyond measure."
    ]
  },
];

const Aquarium = ({ onBack }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [showAffirmation, setShowAffirmation] = useState(null);
  const [modalIcon, setModalIcon] = useState('🌟');
  const [lastThoughtIndex, setLastThoughtIndex] = useState(-1);
  const [chestOpen, setChestOpen] = useState(false);

  // Generate bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => [...prev, {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * 40 + 10,
        duration: Math.random() * 5 + 5
      }].slice(-20));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Mood Selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Add 4 fish of that type
    const newFish = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      type: mood.fish,
      y: Math.random() * 60 + 20,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5
    }));
    setFishList(prev => [...newFish, ...prev].slice(0, 15));
  };

  const getNewThought = (customIcon) => {
    let index;
    do {
      index = Math.floor(Math.random() * selectedMood.thoughts.length);
    } while (index === lastThoughtIndex && selectedMood.thoughts.length > 1);
    
    setLastThoughtIndex(index);
    setModalIcon(customIcon || selectedMood.fish);
    setShowAffirmation(selectedMood.thoughts[index]);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#01579B] via-[#0288D1] to-[#01579B] overflow-hidden font-sans">
      
      {/* 1. ANIMATED BUBBLES BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
            transition={{ duration: bubble.duration, ease: "linear" }}
            className="absolute bg-white/20 rounded-full blur-[1px] border border-white/30"
            style={{ left: `${bubble.left}%`, width: bubble.size, height: bubble.size }}
          />
        ))}
      </div>

      {/* 2. TOP UI */}
      <div className="relative z-[210] p-8 flex justify-between items-center">
        {selectedMood && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 text-white"
          >
            <X size={40} strokeWidth={3} />
          </motion.button>
        )}

        <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-3xl border-2 border-white/20 text-center mx-auto">
          <h1 className="text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg">
            SEL <span className="text-cyan-300">Aquarium</span>
          </h1>
          <p className="text-xs font-bold text-white/70 uppercase">Social Emotional Learning</p>
        </div>

        {selectedMood && <div className="w-16" />}
      </div>

      {/* LIGHT RAYS EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-32 h-[100vh] bg-gradient-to-b from-white/40 to-transparent -rotate-12 blur-3xl" />
        <div className="absolute top-0 right-1/4 w-40 h-[100vh] bg-gradient-to-b from-white/30 to-transparent rotate-12 blur-3xl" />
      </div>

      {/* WATER SHIMMER */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"
      />

      {/* 3. SWIMMING FISH */}
      <div className="absolute inset-0 pointer-events-none">
        {fishList.map(fish => (
          <motion.div
            key={fish.id}
            initial={{ x: '-20vw', y: `${fish.y}%` }}
            animate={{ 
              x: '120vw',
              y: [`${fish.y}%`, `${fish.y - 5}%`, `${fish.y}%`]
            }}
            transition={{ 
              x: { duration: fish.duration, repeat: Infinity, delay: fish.delay, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute text-7xl drop-shadow-2xl select-none"
          >
            {fish.type}
          </motion.div>
        ))}

        {/* EXTRA: JELLYFISH (NOW INTERACTIVE) */}
        <motion.div 
          animate={{ y: [0, -40, 0], x: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => getNewThought('🪼')}
          className="absolute right-[15%] top-[40%] text-6xl opacity-60 filter blur-[1px] pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
        >
          🪼
        </motion.div>
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, -5, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          onClick={() => getNewThought('🪼')}
          className="absolute left-[10%] top-[20%] text-5xl opacity-40 filter blur-[1px] pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
        >
          🪼
        </motion.div>
      </div>

      {/* 4. MOOD SELECTOR */}
      {!selectedMood && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sky-950/40 backdrop-blur-md z-[220]">
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="absolute top-10 left-10 flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl border-2 border-white/20 text-white font-bold transition-all"
          >
            <X size={24} strokeWidth={3} />
            <span className="uppercase tracking-widest text-sm">Return Home</span>
          </motion.button>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-16 px-10"
          >
            <h2 className="text-6xl font-black text-white mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              How are you feeling today?
            </h2>
            <div className="h-1 w-32 bg-cyan-400 mx-auto rounded-full mb-6" />
            <p className="text-2xl text-cyan-100 font-medium italic opacity-90">
              Your feelings are like the ocean... pick a mood to explore!
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full px-10">
            {MOODS.map((mood, idx) => (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  delay: idx * 0.1,
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }
                }}
                whileHover={{ scale: 1.05, y: -15, backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect(mood)}
                className="group bg-white/10 backdrop-blur-xl p-8 rounded-[50px] flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-white/20 hover:border-white/50 transition-all relative overflow-hidden"
              >
                <div className={`absolute inset-0 ${mood.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <span className="text-8xl drop-shadow-2xl transform group-hover:rotate-12 transition-transform duration-500">
                  {mood.emoji}
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black uppercase italic text-white tracking-tighter group-hover:text-cyan-300 transition-colors">
                    {mood.label}
                  </span>
                  <div className={`h-1.5 w-0 group-hover:w-full ${mood.color} transition-all duration-500 rounded-full mt-1`} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE ELEMENTS */}
      {selectedMood && (
        <div className="absolute inset-0 pointer-events-none z-[215]">
          <div className="absolute bottom-10 left-10 pointer-events-auto">
             <motion.div 
              initial={{ x: -100 }} animate={{ x: 0 }}
              className="bg-white/20 backdrop-blur-lg p-6 rounded-[40px] border-2 border-white/30 text-white max-w-xs"
             >
                <div className="flex items-center gap-3 mb-2">
                   <div className={`${selectedMood.color} p-2 rounded-xl`}>{selectedMood.icon}</div>
                   <span className="text-xl font-bold">I feel {selectedMood.label}</span>
                </div>
                <button 
                  onClick={() => { setSelectedMood(null); setChestOpen(false); }}
                  className="mt-2 text-sm underline opacity-70 hover:opacity-100"
                >
                  Change Mood
                </button>
             </motion.div>
          </div>

          {/* Floating Wisdom Bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <motion.button
                key={i}
                initial={{ y: '110vh' }}
                animate={{ 
                  y: '-20vh',
                  x: [0, 25, -25, 0]
                }}
                transition={{ 
                  y: { duration: 12 + i*4, repeat: Infinity, delay: i * 2, ease: "linear" },
                  x: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                onClick={() => getNewThought()}
                className="absolute pointer-events-auto w-36 h-36 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center text-6xl hover:scale-125 hover:bg-white/40 transition-all shadow-inner cursor-pointer"
                style={{ left: `${15 + i * 18}%` }}
              >
                ✨
              </motion.button>
            ))}
          </div>

          {/* EXTRA: TREASURE CHEST */}
          <motion.div 
            initial={{ scale: 0.8, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute bottom-6 right-12 pointer-events-auto flex flex-col items-center"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setChestOpen(!chestOpen);
                if (!chestOpen) getNewThought('💎');
              }}
              className="text-8xl drop-shadow-2xl cursor-pointer hover:filter hover:brightness-125 transition-all"
            >
              {chestOpen ? '💎' : '📦'}
            </motion.button>
            <span className="text-white text-xs font-black uppercase mt-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              {chestOpen ? 'Found a Gem!' : 'Open for a Secret'}
            </span>
          </motion.div>
        </div>
      )}

      {/* 6. AFFIRMATION MODAL */}
      <AnimatePresence mode="wait">
        {showAffirmation && (
          <motion.div 
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xl flex items-center justify-center p-10"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 5 }}
              className="bg-white rounded-[70px] p-16 max-w-3xl w-full text-center relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-[20px] border-cyan-100"
            >
              {/* Decor in modal */}
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-t-[50px]" />
              
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-400 rounded-full border-8 border-white flex items-center justify-center text-6xl shadow-xl">
                {modalIcon}
              </div>
              
              <h3 className="text-5xl font-black text-[#01579B] mb-10 mt-6 uppercase italic tracking-tighter">
                {modalIcon === '💎' ? 'Secret Treasure' : modalIcon === '🪼' ? 'Jellyfish Secret' : 'Bubble of Wisdom'}
              </h3>
              
              <motion.p 
                key={showAffirmation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-700 leading-tight italic"
              >
                "{showAffirmation}"
              </motion.p>

              <button 
                onClick={() => setShowAffirmation(null)}
                className="mt-14 bg-gradient-to-r from-[#01579B] to-[#0288D1] text-white px-16 py-6 rounded-full text-3xl font-black uppercase hover:scale-110 active:scale-95 transition-all shadow-2xl border-b-8 border-black/20"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Bottom Floor Decorations */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#004D40]/60 to-transparent opacity-80 pointer-events-none" />
      
      {/* SWAYING PLANTS */}
      <motion.div 
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 left-10 text-8xl opacity-60 pointer-events-none"
      >
        🌿
      </motion.div>
      <motion.div 
        animate={{ rotate: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 right-32 text-7xl opacity-50 pointer-events-none"
      >
        🌿
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-2 left-1/3 text-6xl opacity-40 pointer-events-none"
      >
        🐚
      </motion.div>
      
      {/* EXTRA: STARFISH */}
      <motion.div 
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-6 right-1/4 text-5xl opacity-40 pointer-events-none"
      >
        ⭐
      </motion.div>

    </div>
  );
};

export default Aquarium;

