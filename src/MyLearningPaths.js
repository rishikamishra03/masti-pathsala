import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// --- BACKGROUND IMAGE IMPORT ---
import bgPath from './mypath.jpg'; 
import VideoPortal from './VideoPortal';
import { useState } from 'react';

const MyLearningPaths = ({ onBack }) => {
  const labels = [
    {
      id: 'reading',
      title: 'Stories',
      subtitle: 'Read Along',
      color: 'bg-[#1976D2]',
      pos: { top: '75%', left: '25%' },
    },
    {
      id: 'numbers',
      title: 'Numbers',
      subtitle: '1 2 3 Math',
      color: 'bg-[#AB47BC]',
      pos: { top: '75%', left: '75%' },
    },
    {
      id: 'alphabets',
      title: 'Alphabets',
      subtitle: 'A B C Songs',
      color: 'bg-[#FF9800]',
      pos: { top: '50%', left: '50%' },
    },
    {
      id: 'animals',
      title: 'Animals',
      subtitle: 'Zoo & Farm',
      color: 'bg-[#4CAF50]',
      pos: { top: '30%', left: '25%' },
    },
    {
      id: 'colors',
      title: 'Colors',
      subtitle: 'Paint World',
      color: 'bg-[#E91E63]',
      pos: { top: '30%', left: '75%' },
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    return (
      <VideoPortal 
        category={selectedCategory} 
        onBack={() => setSelectedCategory(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-[#1A237E]">
      
      {/* 1. ANIMATED BACKGROUND (Subtle Floating Movement) */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ 
          scale: 1.05,
          x: [-10, 10, -10],
          y: [-5, 5, -5]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={bgPath} 
          alt="Learning Path Background" 
          className="w-full h-full object-cover" 
        />
      </motion.div>

      {/* 2. TOP UI (Exit Button with Pulse) */}
      <div className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-[100] pointer-events-none">
        <motion.button 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-14 h-14 rounded-2xl shadow-[0_10px_0_rgb(190,24,93)] flex items-center justify-center pointer-events-auto bg-pink-500 border-4 border-white active:translate-y-1 active:shadow-none transition-all"
        >
          <X size={35} className="text-white" strokeWidth={5} />
        </motion.button>
      </div>

      {/* 3. ANIMATED LABELS (Bouncy & Floating) */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {labels.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
            }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: index * 0.2 
            }}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ top: item.pos.top, left: item.pos.left }}
          >
            {/* The Label Box with Continuous Floating Animation */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: index * 0.5 
              }}
              whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 2 : -2 }}
              onClick={() => setSelectedCategory(item.id)}
              className={`${item.color} text-white px-8 py-3 rounded-[2rem] shadow-[0_8px_0_rgba(0,0,0,0.2)] text-center min-w-[220px] border-4 border-white/40 pointer-events-auto cursor-pointer relative group`}
            >
              {/* Animated Text */}
              <motion.div 
                className="text-2xl font-black tracking-tight leading-tight uppercase italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {item.title}
              </motion.div>
              <div className="text-[12px] font-bold opacity-90 uppercase leading-none mt-1 tracking-widest">
                {item.subtitle}
              </div>

              {/* Shine Effect Animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Extra: Floating Particles (Optional for extra effect) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            animate={{ 
              y: [-20, -100], 
              x: Math.random() * 100,
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: i * 2 
            }}
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${80 + Math.random() * 20}%` 
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MyLearningPaths;