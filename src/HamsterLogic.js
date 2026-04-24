import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy, MapPin, Brain, Grid, Shapes } from 'lucide-react';

// --- GAME DATA ---
const MAZE_LEVELS = [
  {
    id: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    start: { x: 1, y: 1 },
    hint: "Navigate the tunnels to find the seed!"
  },
  {
    id: 2,
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 2, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    start: { x: 5, y: 5 },
    hint: "Think ahead! The seed is hidden deep."
  }
];

const PATTERN_LEVELS = [
  {
    sequence: ['🍎', '🧀', '🍎', '🧀'],
    options: ['🍎', '🧀', '🌻', '🥜'],
    answer: '🍎'
  },
  {
    sequence: ['🌻', '🥜', '🥜', '🌻', '🥜'],
    options: ['🌻', '🥜', '🧀', '🍎'],
    answer: '🥜'
  },
  {
    sequence: ['🐹', '🐭', '🐰', '🐹', '🐭'],
    options: ['🐰', '🐹', '🐶', '🐱'],
    answer: '🐰'
  }
];

const MEMORY_ITEMS = ['🐹', '🌻', '🧀', '🥕', '🍎', '🥜', '🌽', '🍓'];

// --- MAIN COMPONENT ---
const HamsterLogic = ({ onBack }) => {
  const [activeGame, setActiveGame] = useState('menu'); // 'menu', 'maze', 'patterns', 'memory'

  const renderGame = () => {
    switch (activeGame) {
      case 'maze': return <MazeGame onExit={() => setActiveGame('menu')} />;
      case 'patterns': return <PatternGame onExit={() => setActiveGame('menu')} />;
      case 'memory': return <MemoryGame onExit={() => setActiveGame('menu')} />;
      default: return <GameMenu onSelect={setActiveGame} onBack={onBack} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#3E2723] overflow-hidden font-sans flex flex-col">
      {renderGame()}
    </div>
  );
};

// --- SUB-COMPONENT: MENU ---
const GameMenu = ({ onSelect, onBack }) => {
  const games = [
    { id: 'maze', title: 'Maze Navigator', desc: 'Spatial Logic', icon: <MapPin className="text-orange-400" />, color: 'bg-orange-500' },
    { id: 'patterns', title: 'Treat Patterns', desc: 'Sequence Logic', icon: <Shapes className="text-cyan-400" />, color: 'bg-cyan-500' },
    { id: 'memory', title: 'Burrow Memory', desc: 'Memory Logic', icon: <Brain className="text-pink-400" />, color: 'bg-pink-500' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] bg-[#3E2723]">
      <motion.button 
        whileHover={{ scale: 1.1 }} onClick={onBack}
        className="absolute top-8 left-8 bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-white"
      >
        <X size={24} />
      </motion.button>

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
        <h1 className="text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
          🐹 <span className="text-orange-400">Hamster</span> Logic
        </h1>
        <p className="text-xl text-orange-200 font-bold uppercase tracking-[0.3em] mt-2 opacity-80">Challenge Your Brain</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {games.map((game, idx) => (
          <motion.button
            key={game.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10, scale: 1.05 }}
            onClick={() => onSelect(game.id)}
            className="group relative bg-[#4E342E] p-10 rounded-[50px] border-4 border-white/10 shadow-2xl overflow-hidden text-left"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`} />
            <div className="mb-6 bg-white/5 w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-white/10">
              {React.cloneElement(game.icon, { size: 40 })}
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">{game.title}</h3>
            <p className="text-white/50 font-bold uppercase text-xs tracking-widest">{game.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: MAZE GAME ---
const MazeGame = ({ onExit }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = MAZE_LEVELS[levelIdx];
  const [pos, setPos] = useState(level.start);
  const [steps, setSteps] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  // Reset when level changes
  useEffect(() => {
    setPos(level.start);
    setSteps(0);
    setIsVictory(false);
  }, [levelIdx]);

  const move = (dx, dy) => {
    if (isVictory) return;
    const nx = pos.x + dx, ny = pos.y + dy;
    if (ny >= 0 && ny < level.grid.length && nx >= 0 && nx < level.grid[0].length && level.grid[ny][nx] !== 1) {
      setPos({ x: nx, y: ny });
      setSteps(s => s + 1);
      if (level.grid[ny][nx] === 2) setIsVictory(true);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pos, isVictory, levelIdx]);

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-12 px-8 bg-[#5D4037] overflow-y-auto custom-scrollbar">
      <GameHeader title="Maze Navigator" onExit={onExit} />
      
      <div className="flex gap-4 mb-6 mt-16">
        {MAZE_LEVELS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i === levelIdx ? 'bg-orange-400' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="bg-[#3E2723] p-4 rounded-[40px] border-8 border-[#4E342E] shadow-2xl relative">
        <div className="grid grid-cols-7 gap-1">
          {level.grid.map((row, y) => row.map((cell, x) => (
            <div key={`${x}-${y}`} className={`w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center relative ${cell === 1 ? 'bg-[#795548]' : 'bg-[#3E2723]'}`}>
              {cell === 1 && <span className="text-2xl">🧱</span>}
              {cell === 2 && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="text-3xl">🌻</motion.span>}
              {pos.x === x && pos.y === y && <motion.span layoutId="h" className="text-4xl md:text-5xl absolute z-10">🐹</motion.span>}
            </div>
          )))}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2 flex-shrink-0">
        <div className="grid grid-cols-3 gap-3 w-64">
          <div />
          <ControlBtn icon={<ArrowUp />} onClick={() => move(0, -1)} />
          <div />
          <ControlBtn icon={<ArrowLeft />} onClick={() => move(-1, 0)} />
          <ControlBtn icon={<ArrowDown />} onClick={() => move(0, 1)} />
          <ControlBtn icon={<ArrowRight />} onClick={() => move(1, 0)} />
        </div>
      </div>

      <AnimatePresence>
        {isVictory && (
            <VictoryModal 
                steps={steps} 
                onReset={() => { setPos(level.start); setSteps(0); setIsVictory(false); }} 
                onNext={levelIdx < MAZE_LEVELS.length - 1 ? () => setLevelIdx(i => i + 1) : null}
                onExit={onExit} 
            />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: PATTERN GAME ---
const PatternGame = ({ onExit }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const current = PATTERN_LEVELS[levelIdx];

  const handleChoice = (choice) => {
    if (choice === current.answer) {
      if (levelIdx < PATTERN_LEVELS.length - 1) setLevelIdx(l => l + 1);
      else setIsVictory(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#455A64]">
      <GameHeader title="Treat Patterns" onExit={onExit} />
      
      <div className="bg-white/10 p-12 rounded-[60px] backdrop-blur-xl border-4 border-white/10 shadow-2xl text-center">
        <h3 className="text-white/60 font-black uppercase tracking-widest mb-10">What comes next in the sequence?</h3>
        
        <div className="flex gap-4 justify-center mb-16">
          {current.sequence.map((item, i) => (
            <motion.div 
              key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
              className="w-24 h-24 bg-white/5 rounded-3xl border-2 border-white/20 flex items-center justify-center text-5xl shadow-inner"
            >
              {item}
            </motion.div>
          ))}
          <div className="w-24 h-24 bg-cyan-500/20 rounded-3xl border-4 border-dashed border-cyan-400 flex items-center justify-center text-5xl text-cyan-400 animate-pulse">?</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {current.options.map((opt, i) => (
            <motion.button
              key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleChoice(opt)}
              className="w-32 h-32 bg-white rounded-[40px] shadow-xl flex items-center justify-center text-5xl hover:bg-cyan-50 transition-colors"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isVictory && <VictoryModal message="Pattern Master!" onReset={() => { setLevelIdx(0); setIsVictory(false); }} onExit={onExit} />}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: MEMORY GAME ---
const MemoryGame = ({ onExit }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    const items = [...MEMORY_ITEMS, ...MEMORY_ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((item, i) => ({ id: i, item }));
    setCards(items);
  }, []);

  const handleFlip = (id) => {
    if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]].item === cards[newFlipped[1]].item) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) setIsVictory(true);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#AD1457]">
      <GameHeader title="Burrow Memory" onExit={onExit} />
      
      <div className="grid grid-cols-4 gap-4 bg-black/20 p-6 rounded-[50px]">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-20 h-20 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-4xl md:text-5xl transition-all duration-500 shadow-xl border-b-8 ${
                isFlipped ? 'bg-white rotate-y-180 border-gray-200' : 'bg-pink-400 border-pink-700'
              }`}
            >
              {isFlipped ? card.item : '🐹'}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isVictory && <VictoryModal message="Unforgettable Memory!" onReset={() => { setMatched([]); setIsVictory(false); }} onExit={onExit} />}
      </AnimatePresence>
    </div>
  );
};

// --- REUSABLE UI ELEMENTS ---
const GameHeader = ({ title, onExit }) => (
  <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
    <button onClick={onExit} className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-white"><X/></button>
    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{title}</h2>
    <div className="w-12"/>
  </div>
);

const ControlBtn = ({ icon, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClick}
    className="bg-orange-500 w-full aspect-square rounded-2xl flex items-center justify-center text-white shadow-lg border-b-8 border-orange-800"
  >
    {React.cloneElement(icon, { size: 32, strokeWidth: 3 })}
  </motion.button>
);

const VictoryModal = ({ steps, message = "Amazing Job!", onReset, onNext, onExit }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8">
    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-white rounded-[60px] p-12 max-w-md w-full text-center relative border-[12px] border-orange-100">
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-400 rounded-full border-8 border-white flex items-center justify-center text-6xl shadow-xl">🏆</div>
      <h2 className="text-4xl font-black text-[#5D4037] mb-4 mt-8 uppercase tracking-tighter">{message}</h2>
      {steps && <p className="text-xl text-gray-600 mb-8 font-bold italic">Completed in {steps} steps!</p>}
      <div className="flex flex-col gap-4">
        {onNext ? (
          <button onClick={onNext} className="w-full bg-orange-500 text-white py-6 rounded-3xl text-2xl font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">Next Level</button>
        ) : (
          <button onClick={onReset} className="w-full bg-orange-500 text-white py-6 rounded-3xl text-2xl font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">Play Again</button>
        )}
        <button onClick={onExit} className="text-gray-400 font-bold hover:text-orange-500">Back to Menu</button>
      </div>
    </motion.div>
  </motion.div>
);

export default HamsterLogic;
