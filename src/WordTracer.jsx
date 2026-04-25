import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ChevronRight, ChevronLeft, Volume2, Sparkles, CheckCircle, Trophy, ArrowLeft, Eraser, Star } from 'lucide-react';

const TRACING_WORDS = [
  /* SPACE & SCIENCE */
  { word: 'PLANET', icon: '🪐', category: 'space' }, { word: 'ROCKET', icon: '🚀', category: 'space' }, 
  { word: 'GALAXY', icon: '🌌', category: 'space' }, { word: 'GRAVITY', icon: '👨‍🚀', category: 'space' }, 
  { word: 'ORBIT', icon: '🛰️', category: 'space' }, { word: 'ENERGY', icon: '⚡', category: 'space' },
  { word: 'COMET', icon: '☄️', category: 'space' }, { word: 'SOLAR', icon: '☀️', category: 'space' }, 
  { word: 'ATOM', icon: '⚛️', category: 'space' }, { word: 'LASER', icon: '🔦', category: 'space' }, 
  { word: 'MAGNET', icon: '🧲', category: 'space' }, { word: 'ROBOT', icon: '🤖', category: 'space' },
  /* NATURE & ENVIRONMENT */
  { word: 'FOREST', icon: '🌲', category: 'nature' }, { word: 'OCEAN', icon: '🌊', category: 'nature' }, 
  { word: 'VOLCANO', icon: '🌋', category: 'nature' }, { word: 'RECYCLE', icon: '♻️', category: 'nature' }, 
  { word: 'OZONE', icon: '🌍', category: 'nature' }, { word: 'DESERT', icon: '🌵', category: 'nature' },
  { word: 'ISLAND', icon: '🏝️', category: 'nature' }, { word: 'JUNGLE', icon: '🌿', category: 'nature' }, 
  { word: 'MOUNTAIN', icon: '🏔️', category: 'nature' }, { word: 'VALLEY', icon: '🏞️', category: 'nature' }, 
  { word: 'RIVER', icon: '🛶', category: 'nature' }, { word: 'NATURE', icon: '🍃', category: 'nature' },
  /* HUMAN BODY & HEALTH */
  { word: 'HEART', icon: '❤️', category: 'body' }, { word: 'BRAIN', icon: '🧠', category: 'body' }, 
  { word: 'LUNGS', icon: '🫁', category: 'body' }, { word: 'SKULL', icon: '💀', category: 'body' }, 
  { word: 'MUSCLE', icon: '💪', category: 'body' }, { word: 'HEALTH', icon: '🍎', category: 'body' },
  { word: 'SIGHT', icon: '👁️', category: 'body' }, { word: 'SMELL', icon: '👃', category: 'body' }, 
  { word: 'TOUCH', icon: '✋', category: 'body' }, { word: 'DOCTOR', icon: '👨‍⚕️', category: 'body' }, 
  { word: 'DENTAL', icon: '🦷', category: 'body' }, { word: 'VITAMIN', icon: '💊', category: 'body' },
  /* SHAPES & MEASURE */
  { word: 'SPHERE', icon: '⚽', category: 'default' }, { word: 'SQUARE', icon: '🟦', category: 'default' }, 
  { word: 'PYRAMID', icon: '📐', category: 'default' }, { word: 'CIRCLE', icon: '⭕', category: 'default' }, 
  { word: 'LENGTH', icon: '📏', category: 'default' }, { word: 'WEIGHT', icon: '⚖️', category: 'default' },
  { word: 'EQUAL', icon: '🟰', category: 'default' }, { word: 'DEGREE', icon: '🌡️', category: 'default' }, 
  { word: 'VOLUME', icon: '🧪', category: 'default' },
  /* LIFE SKILLS & VALUES */
  { word: 'KIND', icon: '🤝', category: 'body' }, { word: 'BRAVE', icon: '🦁', category: 'body' }, 
  { word: 'SAFETY', icon: '🦺', category: 'body' }, { word: 'PROUD', icon: '🏆', category: 'body' }, 
  { word: 'LEARN', icon: '📚', category: 'default' }, { word: 'CREATE', icon: '🎨', category: 'default' },
  { word: 'LISTEN', icon: '👂', category: 'default' }, { word: 'POLITE', icon: '🙏', category: 'body' }, 
  { word: 'FRIEND', icon: '👫', category: 'body' },
  /* WEATHER & SEASONS */
  { word: 'THUNDER', icon: '⛈️', category: 'weather' }, { word: 'RAINBOW', icon: '🌈', category: 'weather' }, 
  { word: 'AUTUMN', icon: '🍂', category: 'weather' }, { word: 'WINTER', icon: '❄️', category: 'weather' }, 
  { word: 'SUMMER', icon: '☀️', category: 'weather' }, { word: 'SPRING', icon: '🌸', category: 'weather' },
  { word: 'CLOUDY', icon: '☁️', category: 'weather' }, { word: 'FREEZE', icon: '🍦', category: 'weather' }, 
  { word: 'BREEZE', icon: '🌬️', category: 'weather' },
  /* GEOGRAPHY & WORLD */
  { word: 'AFRICA', icon: '🌍', category: 'nature' }, { word: 'EUROPE', icon: '🇪🇺', category: 'nature' }, 
  { word: 'ASIA', icon: '🌏', category: 'nature' }, { word: 'INDIA', icon: '🇮🇳', category: 'nature' }, 
  { word: 'NATION', icon: '🚩', category: 'nature' }, { word: 'GLOBE', icon: '🌐', category: 'nature' },
  { word: 'MAPS', icon: '🗺️', category: 'nature' }, { word: 'CITIES', icon: '🏙️', category: 'nature' }, 
  { word: 'BRIDGE', icon: '🌉', category: 'nature' },
  /* TRANSPORT & TECH */
  { word: 'ENGINE', icon: '🚂', category: 'space' }, { word: 'FLIGHT', icon: '✈️', category: 'space' }, 
  { word: 'SUBWAY', icon: '🚇', category: 'space' }, { word: 'SCREEN', icon: '💻', category: 'space' }, 
  { word: 'MOBILE', icon: '📱', category: 'space' }, { word: 'SIGNAL', icon: '📡', category: 'space' },
  { word: 'REMOTE', icon: '🎮', category: 'space' }, { word: 'CAMERA', icon: '📷', category: 'space' }, 
  { word: 'ELECTRIC', icon: '🔌', category: 'space' },
  /* ANIMALS (ADVANCED) */
  { word: 'MAMMAL', icon: '🐘', category: 'nature' }, { word: 'REPTILE', icon: '🐍', category: 'nature' }, 
  { word: 'INSECT', icon: '🐝', category: 'nature' }, { word: 'EXTINCT', icon: '🦖', category: 'nature' }, 
  { word: 'MARINE', icon: '🐬', category: 'nature' }, { word: 'FOSSIL', icon: '🦴', category: 'nature' },
  /* MISC EDUCATIONAL */
  { word: 'SCHOOL', icon: '🏫', category: 'default' }, { word: 'MUSEUM', icon: '🏛️', category: 'default' }, 
  { word: 'LIBRARY', icon: '📖', category: 'default' }, { word: 'PAINTER', icon: '🧑‍🎨', category: 'default' }, 
  { word: 'MUSIC', icon: '🎵', category: 'default' }, { word: 'HISTORY', icon: '📜', category: 'default' },
  { word: 'FUTURE', icon: '🚀', category: 'space' }, { word: 'PEACE', icon: '🕊️', category: 'body' }, 
  { word: 'DREAM', icon: '💭', category: 'space' }, { word: 'FAMILY', icon: '👨‍👩‍👧‍👧', category: 'body' }, 
  { word: 'WONDER', icon: '✨', category: 'space' }
];

const PRAISE_MESSAGES = ["Amazing Job!", "You're a Star!", "Brilliant!", "Fantastic!", "Great Tracing!", "Super!", "Wow!"];
const IMPROVE_MESSAGES = ["Nice Try!", "Keep Practicing!", "Almost there!", "Trace carefully!", "Follow the lines!"];

const DynamicBackground = ({ category }) => {
  const theme = category || 'default';
  const particles = {
    space: ['⭐', '✨', '🪐', '🌙', '☄️'],
    nature: ['🍃', '🌸', '🌱', '🌿', '🍂'],
    body: ['❤️', '✨', '🍎', '🩺', '💖'],
    weather: ['☁️', '💧', '☀️', '🌈', '⛅'],
    default: ['🎨', '✏️', '⭐', '✨', '🎈']
  }[theme];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div animate={{ background: theme === 'space' ? 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' : theme === 'nature' ? 'radial-gradient(circle, #f0fdf4 0%, #dcfce7 100%)' : theme === 'body' ? 'radial-gradient(circle, #fff1f2 0%, #ffe4e6 100%)' : theme === 'weather' ? 'radial-gradient(circle, #f0f9ff 0%, #e0f2fe 100%)' : 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)' }} className="absolute inset-0 transition-colors duration-1000" />
      {[...Array(8)].map((_, i) => (
        <motion.div key={`${theme}-${i}`} initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100, opacity: 0.1, scale: Math.random() * 0.4 + 0.4 }} animate={{ y: -200, opacity: [0.1, 0.3, 0.1], rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: Math.random() * 20 }} className="absolute text-5xl filter blur-[1px]">
          {particles[i % particles.length]}
        </motion.div>
      ))}
    </div>
  );
};

const WordTracer = ({ onBack }) => {
  // PERSISTENCE: Initialize state from localStorage
  const [wordIndex, setWordIndex] = useState(() => {
    const saved = localStorage.getItem('masti_pathsala_word_index');
    return saved ? Math.min(parseInt(saved, 10), TRACING_WORDS.length - 1) : 0;
  });
  const [totalScore, setTotalScore] = useState(() => {
    const saved = localStorage.getItem('masti_pathsala_total_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastEarned, setLastEarned] = useState(null);
  const [penColor, setPenColor] = useState('#3F51B5');
  const [isEraser, setIsEraser] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [praise, setPraise] = useState(null);
  const [isCorrect, setIsCorrect] = useState(true);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentWord = TRACING_WORDS[wordIndex];

  // PERSISTENCE: Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('masti_pathsala_word_index', wordIndex);
  }, [wordIndex]);

  useEffect(() => {
    localStorage.setItem('masti_pathsala_total_score', totalScore);
  }, [totalScore]);

  useEffect(() => {
    initCanvas();
    speakWord(currentWord.word);
    setShowSuccess(false);
    setPraise(null);
    setLastEarned(null);
  }, [wordIndex]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = Math.min(window.innerWidth * 0.85, 850);
      canvas.height = 380;
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = penColor;
      context.lineWidth = 18;
      contextRef.current = context;
    }
  };

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
      contextRef.current.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      contextRef.current.lineWidth = isEraser ? 30 : 18;
    }
  }, [penColor, isEraser]);

  const speakWord = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.4;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const validateTracing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { accurate: false };
    
    const userData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    
    const mask = document.createElement('canvas');
    mask.width = canvas.width;
    mask.height = canvas.height;
    const mctx = mask.getContext('2d');
    mctx.fillStyle = 'black';
    mctx.strokeStyle = 'black';
    mctx.lineWidth = 26; 
    const fontSize = currentWord.word.length > 7 ? 110 : 140;
    mctx.font = `900 ${fontSize}px monospace`;
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.strokeText(currentWord.word.toUpperCase(), mask.width/2, mask.height/2);
    mctx.fillText(currentWord.word.toUpperCase(), mask.width/2, mask.height/2);
    
    const maskData = mctx.getImageData(0, 0, mask.width, mask.height).data;
    
    let hits = 0;
    let misses = 0;
    let totalMaskPixels = 0;
    
    for (let i = 3; i < userData.length; i += 40) {
      const userAlpha = userData[i];
      const maskAlpha = maskData[i];
      if (maskAlpha > 30) totalMaskPixels++; 
      if (userAlpha > 30) { 
        if (maskAlpha > 30) hits++;
        else misses++; 
      }
    }
    
    const accuracy = hits / (hits + misses);
    const completeness = hits / totalMaskPixels;
    const isSuccess = accuracy > 0.60 && completeness > 0.18;
    return { accurate: isSuccess }; 
  };

  const handleCheck = () => {
    if (praise) return; 

    const result = validateTracing();
    
    if (result.accurate) {
      const points = 50;
      setIsCorrect(true);
      setLastEarned(points);
      setTotalScore(prev => prev + points);
      
      const msg = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
      setPraise(`${msg} Excellent!`);
      speakWord(msg);
      
      setTimeout(() => {
        setPraise(null);
        handleNext();
      }, 2000);
    } else {
      setIsCorrect(false);
      setLastEarned(null); 
      
      const msg = IMPROVE_MESSAGES[Math.floor(Math.random() * IMPROVE_MESSAGES.length)];
      setPraise(msg);
      speakWord(msg);
      
      setTimeout(() => {
        setPraise(null);
        clearCanvas(); 
      }, 2000);
    }
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    return { offsetX: clientX - rect.left, offsetY: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (!contextRef.current) return;
    const coords = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(coords.offsetX, coords.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !contextRef.current) return;
    const coords = getCoordinates(e);
    contextRef.current.lineTo(coords.offsetX, coords.offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleNext = () => {
    if (wordIndex < TRACING_WORDS.length - 1) {
      setWordIndex(prev => prev + 1);
    } else {
      setShowSuccess(true);
    }
  };

  const handlePrev = () => {
    if (wordIndex > 0) setWordIndex(prev => prev - 1);
  };

  const resetGame = () => {
    setWordIndex(0);
    setTotalScore(0);
    setShowSuccess(false);
    localStorage.removeItem('masti_pathsala_word_index');
    localStorage.removeItem('masti_pathsala_total_score');
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col font-sans overflow-hidden">
      <DynamicBackground category={currentWord.category} />

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-blue-600/95 flex flex-col items-center justify-center text-white p-10 text-center">
            <Trophy size={140} className="text-yellow-400 mb-8 drop-shadow-2xl" />
            <h2 className="text-7xl font-black italic uppercase mb-4 tracking-tighter">Super Star Champion!</h2>
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-[40px] mb-12 border-2 border-white/30 shadow-2xl">
              <p className="text-2xl uppercase tracking-widest font-black opacity-80 mb-2">Your Career Score</p>
              <h3 className="text-8xl font-black text-yellow-400 italic tracking-tighter">{totalScore} STARS</h3>
            </div>
            <button onClick={resetGame} className="px-12 py-6 bg-white text-blue-600 font-black text-3xl rounded-[40px] shadow-2xl hover:scale-105 transition-transform">PLAY AGAIN</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {praise && (
          <motion.div initial={{ scale: 0, y: 100 }} animate={{ scale: 1.1, y: -50 }} exit={{ scale: 0, opacity: 0 }} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[600] ${isCorrect ? 'bg-yellow-400 text-blue-900 shadow-yellow-200/50' : 'bg-red-500 text-white shadow-red-200/50'} px-16 py-8 rounded-[60px] shadow-2xl border-8 border-white pointer-events-none`}>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-5xl font-black italic uppercase text-center tracking-tighter">{praise}</h3>
              {isCorrect && lastEarned && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 text-4xl font-black italic text-blue-800"><Star fill="currentColor" size={40} className="text-blue-700" /> +50 STARS!</motion.div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative p-4 bg-white shadow-lg flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl shadow-inner"><ArrowLeft size={28} /></button>
          <div className="flex flex-col -gap-1">
            <h1 className="text-3xl font-black text-[#1A237E] italic uppercase leading-none">Word <span className="text-blue-500">Tracer</span></h1>
            <p className="text-xs font-black text-gray-400 tracking-[0.3em] uppercase">Masti Pathshala</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div key={totalScore} initial={{ scale: 1.2, y: -10 }} animate={{ scale: 1, y: 0 }} className="flex items-center gap-3 bg-blue-600 px-6 py-3 rounded-2xl text-white shadow-xl">
            <Star fill="currentColor" className="text-yellow-400" size={28} />
            <span className="text-2xl font-black italic tracking-tighter">{totalScore} STARS</span>
          </motion.div>

          <div className="flex gap-3 bg-gray-100 p-2 rounded-2xl border-2 items-center">
            {['#FF5252', '#448AFF', '#4CAF50', '#FFB74D', '#3F51B5'].map(c => (
              <button key={c} onClick={() => { setPenColor(c); setIsEraser(false); }} style={{ backgroundColor: c }} className={`w-11 h-11 rounded-full border-2 transition-all ${penColor === c && !isEraser ? 'border-white scale-110 shadow-lg' : 'border-transparent scale-90'}`} />
            ))}
            <div className="w-[2px] h-8 bg-gray-300 mx-1" />
            <button onClick={() => setIsEraser(!isEraser)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isEraser ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-white text-gray-500 border-2 border-gray-200 shadow-sm'}`}><Eraser size={28} /></button>
          </div>
          <button onClick={clearCanvas} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black rounded-2xl text-xs uppercase tracking-wider shadow-sm hover:bg-red-100 transition-colors"><RotateCcw size={18} /> CLEAR</button>
        </div>
      </header>

      <div className="w-full h-3 bg-gray-200 relative z-30"><motion.div initial={{ width: 0 }} animate={{ width: `${((wordIndex + 1) / TRACING_WORDS.length) * 100}%` }} className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" /></div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 z-20">
        <div className="overflow-hidden w-full h-32 relative">
          <AnimatePresence mode="wait">
            <motion.div key={wordIndex} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="absolute inset-0 flex items-center justify-center gap-8">
              <div className="text-8xl drop-shadow-2xl">{currentWord.icon}</div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Trace carefully:</h2>
                <div className="flex items-center gap-4">
                  <h3 className="text-7xl font-black text-[#1A237E] uppercase tracking-[0.15em] italic">{currentWord.word}</h3>
                  <button onClick={() => speakWord(currentWord.word)} className="p-4 bg-blue-100 text-blue-600 rounded-full shadow-md hover:scale-110 transition-transform"><Volume2 size={36} /></button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative bg-white rounded-[50px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-[15px] border-white overflow-hidden cursor-crosshair group">
          <AnimatePresence>
            {lastEarned && (
              <motion.div initial={{ y: 0, opacity: 1 }} animate={{ y: -150, opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 text-6xl font-black text-blue-600 italic">
                +50 STARS!
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <AnimatePresence mode="wait">
              <motion.svg key={wordIndex} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} width="100%" height="100%" viewBox="0 0 850 380">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={currentWord.word.length > 7 ? "110" : "140"} fontFamily="monospace" fontWeight="900" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeDasharray="10,10" className="uppercase tracking-[0.15em]">{currentWord.word}</text>
              </motion.svg>
            </AnimatePresence>
          </div>
          <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="relative z-10" />
        </div>

        <div className="flex items-center gap-10">
          <button disabled={wordIndex === 0} onClick={handlePrev} className={`w-24 h-24 flex items-center justify-center rounded-[40px] shadow-xl border-b-[10px] transition-all ${wordIndex === 0 ? 'bg-gray-200 border-gray-300 text-gray-400' : 'bg-white border-gray-200 text-blue-600 active:translate-y-1 active:border-b-0 hover:border-b-[12px]'}`}><ChevronLeft size={50} /></button>
          <button onClick={handleCheck} className="px-16 py-8 bg-yellow-400 text-blue-900 font-black text-4xl rounded-[50px] shadow-2xl border-b-[12px] border-yellow-600 active:translate-y-1 active:border-b-0 flex items-center gap-5 hover:scale-105 transition-transform shadow-yellow-200/50"><CheckCircle size={40} /> DONE!</button>
          <button onClick={handleNext} className="w-24 h-24 flex items-center justify-center bg-blue-600 border-blue-800 text-white rounded-[40px] shadow-xl border-b-[10px] active:translate-y-1 active:border-b-0 hover:bg-blue-700">{wordIndex === TRACING_WORDS.length - 1 ? <Sparkles size={45} /> : <ChevronRight size={50} />}</button>
        </div>
        <div className="px-10 py-3 bg-blue-50 text-blue-900 font-black rounded-full text-xl shadow-inner border-2 border-blue-100 flex items-center gap-4">
          <span className="opacity-50">WORD:</span> {wordIndex + 1} / {TRACING_WORDS.length}
        </div>
      </main>
    </div>
  );
};

export default WordTracer;
