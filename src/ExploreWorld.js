import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// --- BACKGROUND IMAGE IMPORT ---
import bgImage from './bg.jpeg'; 
import Avatar from './Avatar';
import Safari from './Safari';
import Aquarium from './Aquarium';
import HamsterLogic from './HamsterLogic';

const ExploreScene = ({ onBack, onAvatarSave }) => {
  const [activeApp, setActiveApp] = React.useState(null);
  
  // --- COORDINATES (Labels shifted slightly up) ---
  const labels = [
    {
      id: 'bot_beats',
      title: 'Bot Beats',
      subtitle: 'Coding',
      color: 'bg-[#B71C1C]', 
      pos: { top: '72%', left: '11%' },
    },
    {
      id: 'aquarium',
      title: 'Aquarium',
      subtitle: 'Social-Emotional Learning',
      color: 'bg-[#0D47A1]', 
      pos: { top: '61%', left: '35.5%' },
    },
    {
      id: 'hamster',
      title: 'Hamster',
      subtitle: 'Spatial Logic',
      color: 'bg-[#880E4F]', 
      pos: { top: '41%', left: '66%' },
    },
    {
      id: 'safari',
      title: 'Safari',
      subtitle: 'Life Science',
      color: 'bg-[#1B5E20]', 
      pos: { top: '35%', left: '15%' },
    },
    {
      id: 'avatar',
      title: 'Avatar',
      subtitle: 'Customize You',
      color: 'bg-[#E65100]', 
      pos: { top: '49%', left: '46%' },
    },
    {
      id: 'pet_town',
      title: 'Pet Town',
      subtitle: 'Narrative Play',
      color: 'bg-[#311B92]', 
      pos: { top: '85%', left: '89%' },
    },
  ];

  if (activeApp === 'safari') return <Safari onBack={() => setActiveApp(null)} />;
  if (activeApp === 'aquarium') return <Aquarium onBack={() => setActiveApp(null)} />;
  if (activeApp === 'hamster') return <HamsterLogic onBack={() => setActiveApp(null)} />;
  if (activeApp === 'avatar') return (
    <Avatar 
      onBack={() => {
        setActiveApp(null);
        if (onAvatarSave) onAvatarSave();
      }} 
    />
  );

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      
      {/* 1. BACKGROUND IMAGE WITH WAVY/BREATHING EFFECT */}
      <motion.div 
        animate={{ 
          scale: [1, 1.02, 1],
          rotate: [0, 0.5, -0.5, 0] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={bgImage} 
          alt="Playroom" 
          className="w-full h-full object-cover" 
        />
      </motion.div>

      {/* 2. TOP UI (Exit & Tickets) */}
      <div className="relative z-[100] w-full p-8 flex items-center justify-between pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center bg-[#FF00FF] border-4 border-white pointer-events-auto"
        >
          <X size={35} className="text-white" strokeWidth={5} />
        </motion.button>

        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-3 bg-white/90 px-6 py-2 rounded-2xl shadow-lg border-2 border-yellow-200 pointer-events-auto"
        >
          <span className="text-4xl">🎫</span>
          <span className="text-4xl font-black text-[#A52A2A]">24</span>
        </motion.div>
      </div>

      {/* 3. FLOATING LABELS */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {labels.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -8, 0], // Floating up and down
            }}
            transition={{ 
              y: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2 // Random-like offset
              },
              opacity: { duration: 0.5 }
            }}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ top: item.pos.top, left: item.pos.left }}
          >
            {/* The Label Box */}
            <div 
              onClick={() => {
                if (item.id === 'avatar') setActiveApp('avatar');
                if (item.id === 'safari') setActiveApp('safari');
                if (item.id === 'aquarium') setActiveApp('aquarium');
                if (item.id === 'hamster') setActiveApp('hamster');
              }}
              className={`${item.color} text-white px-5 py-1.5 rounded-xl shadow-lg text-center min-w-[180px] border-2 border-white/40 pointer-events-auto cursor-pointer hover:brightness-110 active:scale-95 transition-all`}
            >
              <div className="text-[15px] font-black tracking-tight leading-tight uppercase">
                {item.title}
              </div>
              <div className="text-[9px] font-bold opacity-80 uppercase leading-none">
                {item.subtitle}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
    </div>

  );
};

export default ExploreScene;