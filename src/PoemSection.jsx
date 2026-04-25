import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, Search, BookOpen, Video, ArrowLeft, Mic } from 'lucide-react';

const POEM_DATA = [
  {
    id: 1,
    title: 'Twinkle Twinkle Little Star',
    text: `Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.`,
    videoId: 'yCjJyiqpAuU',
    thumbnail: 'https://i.ytimg.com/vi/yCjJyiqpAuU/hqdefault.jpg',
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    icon: '⭐'
  },
  {
    id: 2,
    title: 'Johny Johny Yes Papa',
    text: `Johny, Johny,\nYes, Papa?\nEating sugar?\nNo, Papa.\nTelling lies?\nNo, Papa.\nOpen your mouth,\nHa! Ha! Ha!`,
    videoId: 'WRVsOCh907o',
    thumbnail: 'https://i.ytimg.com/vi/WRVsOCh907o/hqdefault.jpg',
    color: 'bg-blue-100',
    borderColor: 'border-blue-400',
    icon: '👶'
  },
  {
    id: 4,
    title: 'Humpty Dumpty',
    text: `Humpty Dumpty sat on a wall,\nHumpty Dumpty had a great fall;\nAll the king's horses and all the king's men\nCouldn't put Humpty together again.`,
    videoId: 'nrv495corBc',
    thumbnail: 'https://i.ytimg.com/vi/nrv495corBc/hqdefault.jpg',
    color: 'bg-orange-100',
    borderColor: 'border-orange-400',
    icon: '🥚'
  },
  {
    id: 5,
    title: 'Rain Rain Go Away',
    text: `Rain, rain, go away,\nCome again another day.\nLittle Johny wants to play,\nRain, rain, go away.`,
    videoId: 'Zu6o23Pu0Do',
    thumbnail: 'https://i.ytimg.com/vi/Zu6o23Pu0Do/hqdefault.jpg',
    color: 'bg-indigo-100',
    borderColor: 'border-indigo-400',
    icon: '☔'
  },
  {
    id: 6,
    title: 'Happy & You Know It',
    text: `If you're happy and you know it, clap your hands.\nIf you're happy and you know it, clap your hands.\nIf you're happy and you know it, and you really want to show it,\nIf you're happy and you know it, clap your hands.`,
    videoId: '71hqRT9U0wg',
    thumbnail: 'https://i.ytimg.com/vi/71hqRT9U0wg/mqdefault.jpg',
    color: 'bg-pink-100',
    borderColor: 'border-pink-400',
    icon: '👏'
  },
  {
    id: 7,
    title: 'Wheels on the Bus',
    text: `The wheels on the bus go round and round,\nRound and round,\nRound and round.\nThe wheels on the bus go round and round,\nAll through the town.`,
    videoId: 'e_04ZrNroTo',
    thumbnail: 'https://i.ytimg.com/vi/e_04ZrNroTo/mqdefault.jpg',
    color: 'bg-green-100',
    borderColor: 'border-green-400',
    icon: '🚌'
  },
  {
    id: 8,
    title: 'Head & Shoulders',
    text: `Head, shoulders, knees and toes,\nKnees and toes.\nHead, shoulders, knees and toes,\nKnees and toes.\nAnd eyes, and ears, and mouth, and nose.\nHead, shoulders, knees and toes,\nKnees and toes.`,
    videoId: 'ZanHgPprl-0',
    thumbnail: 'https://i.ytimg.com/vi/ZanHgPprl-0/mqdefault.jpg',
    color: 'bg-red-100',
    borderColor: 'border-red-400',
    icon: '🤸'
  }
];

const PoemSection = ({ onBack }) => {
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'read', 'video'
  const [searchQuery, setSearchQuery] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  // Stop audio when switching modes
  React.useEffect(() => {
    setIsReading(false);
    setCurrentLineIndex(-1);
    window.speechSynthesis.cancel();
  }, [viewMode, selectedPoem]);

  const toggleReading = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentLineIndex(-1);
    } else {
      startReading(selectedPoem.text);
    }
  };

  const startReading = (text, lang = 'en-US') => {
    window.speechSynthesis.cancel();
    setIsReading(true);
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Recursive function to play lines one by one
    const playLine = (index) => {
      if (index >= lines.length) {
        setIsReading(false);
        setCurrentLineIndex(-1);
        return;
      }

      setCurrentLineIndex(index);
      const line = lines[index];
      const singLine = line.endsWith('?') || line.endsWith('!') ? line : line + '!';
      const utterance = new SpeechSynthesisUtterance(singLine);
      
      const voices = window.speechSynthesis.getVoices();
      
      // PRIORITIZE NATURAL/CHILD VOICES
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && (
          v.name.includes('Natural') || 
          v.name.includes('Neural') || 
          v.name.includes('Child') || 
          v.name.includes('Ana') || 
          v.name.includes('Google US English') ||
          v.name.includes('Samantha')
        )
      ) || voices.find(v => v.name.includes('Female') || v.name.includes('Zira'));

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.lang = lang;
      
      // CHILD-LIKE SING-SONGY PITCH
      utterance.pitch = index % 2 === 0 ? 1.8 : 1.4; 
      utterance.rate = 0.8; 
      utterance.volume = 1.0;

      utterance.onend = () => {
        // Short pause between lines for better "Reading" feel
        setTimeout(() => playLine(index + 1), 400);
      };

      utterance.onerror = () => {
        setIsReading(false);
        setCurrentLineIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    playLine(0);
  };

  const filteredPoems = POEM_DATA.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchOnYoutube = () => {
    const query = encodeURIComponent(searchQuery + " kids poem nursery rhyme");
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-[#FF9800] via-[#FFC107] to-[#FFEB3B] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-white/20 backdrop-blur-md border-b-4 border-black/10 shadow-xl">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={viewMode === 'list' ? onBack : () => setViewMode('list')}
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border-b-4 border-gray-300 text-[#FF6F00]"
          >
            <ArrowLeft size={32} strokeWidth={3} />
          </motion.button>
          <div>
            <h2 className="text-4xl font-black text-[#E65100] italic uppercase tracking-tighter drop-shadow-sm">
              {viewMode === 'list' ? 'Poem World' : selectedPoem?.title}
            </h2>
            <p className="text-[#BF360C] font-black text-xs uppercase tracking-widest">Listen, Read & Watch!</p>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              placeholder="Search poems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 pl-14 pr-4 py-4 rounded-3xl border-b-4 border-gray-200 shadow-xl outline-none font-bold text-lg"
            />
          </div>
        )}

        <button
          onClick={onBack}
          className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-b-4 border-red-700 hover:bg-red-600 transition-all"
        >
          <X size={32} strokeWidth={3} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredPoems.map((poem) => (
                <motion.div
                  key={poem.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`${poem.color} rounded-[40px] border-[6px] border-white shadow-2xl overflow-hidden group cursor-pointer flex flex-col`}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={poem.thumbnail}
                      alt={poem.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-2xl shadow-lg">
                      {poem.icon}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-black text-[#3E2723] leading-tight mb-1">{poem.title}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button
                        onClick={() => {
                          setSelectedPoem(poem);
                          setViewMode('read');
                        }}
                        className="bg-white hover:bg-[#FFF9C4] text-[#FBC02D] font-black py-3 rounded-2xl border-b-4 border-gray-200 shadow-md flex items-center justify-center gap-2 transition-all active:translate-y-1 active:border-b-0"
                      >
                        <BookOpen size={20} /> READ
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPoem(poem);
                          setViewMode('video');
                        }}
                        className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-black py-3 rounded-2xl border-b-4 border-[#B71C1C] shadow-md flex items-center justify-center gap-2 transition-all active:translate-y-1 active:border-b-0"
                      >
                        <Play size={20} fill="white" /> WATCH
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* YouTube Search Card */}
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={handleSearchOnYoutube}
                className="bg-white/30 backdrop-blur-md rounded-[40px] border-[6px] border-white/50 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer group"
              >
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Search size={48} className="text-[#E65100]" />
                </div>
                <h3 className="text-2xl font-black text-[#E65100] mb-2 italic">Want more?</h3>
                <p className="text-[#BF360C] font-bold">Search any poem on YouTube!</p>
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'read' && selectedPoem && (
            <motion.div
              key="read"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto w-full flex flex-col gap-8"
            >
              <div className="bg-white rounded-[60px] p-12 shadow-2xl border-[15px] border-[#FFF176] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-gray-100 to-transparent opacity-50" />

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-6xl font-black text-[#3E2723] uppercase mb-2">{selectedPoem.title}</h2>
                  </div>
                  <div className="text-8xl">{selectedPoem.icon}</div>
                </div>

                <div className="w-full bg-blue-50/50 p-10 rounded-[40px] border-2 border-blue-100 flex flex-col items-center text-center">
                  <div className="flex items-center justify-between w-full mb-8 pb-6 border-b border-blue-100/50">
                    <span className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      {isReading && <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                      {isReading ? 'Now Reading...' : 'Ready to Sing Along!'}
                    </span>
                    <button
                      onClick={toggleReading}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-b-4 active:translate-y-1 transition-all ${
                        isReading 
                        ? 'bg-red-500 border-red-700 text-white' 
                        : 'bg-blue-500 border-blue-700 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isReading ? <X size={32} /> : <Volume2 size={32} />}
                    </button>
                  </div>

                  <div className="space-y-4 w-full">
                    {selectedPoem.text.split('\n').map((line, idx) => (
                      <motion.div
                        key={idx}
                        animate={{ 
                          scale: currentLineIndex === idx ? 1.15 : 1,
                          color: currentLineIndex === idx ? '#1E88E5' : '#374151',
                          x: currentLineIndex === idx ? 15 : 0,
                          opacity: isReading && currentLineIndex !== idx ? 0.4 : 1
                        }}
                        className={`text-4xl font-black transition-all duration-500 font-serif italic ${currentLineIndex === idx ? 'drop-shadow-sm' : ''}`}
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setViewMode('video')}
                    className="px-10 py-5 bg-[#E53935] text-white font-black text-2xl rounded-3xl border-b-8 border-[#B71C1C] shadow-2xl flex items-center gap-4 hover:bg-[#D32F2F] active:translate-y-1 active:border-b-0 transition-all"
                  >
                    <Video size={32} /> WATCH VIDEO VERSION
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'video' && selectedPoem && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="max-w-6xl mx-auto w-full flex flex-col gap-6"
            >
              <div className="aspect-video w-full bg-black rounded-[50px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.2)] border-[12px] border-white relative">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedPoem.videoId}?autoplay=1&rel=0`}
                  title={selectedPoem.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              <div className="flex justify-center gap-6">
                <button
                  onClick={() => setViewMode('read')}
                  className="px-8 py-4 bg-white text-[#3E2723] font-black rounded-2xl shadow-xl border-b-4 border-gray-300 flex items-center gap-2 hover:bg-gray-50 active:translate-y-1 transition-all"
                >
                  <BookOpen size={24} /> SWITCH TO READING
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.youtube.com/watch?v=${selectedPoem.videoId}`, '_blank');
                  }}
                  className="px-8 py-4 bg-red-500/20 text-red-100 font-bold rounded-2xl border border-white/20 flex items-center gap-2 hover:bg-red-500/30 transition-all"
                >
                  <Search size={20} /> Video not working? YouTube link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Mic Decoration */}
      {viewMode === 'list' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/20 px-8 py-4 rounded-full backdrop-blur-md border border-white/30">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl animate-pulse">
            🎤
          </div>
          <p className="text-white font-black italic text-xl drop-shadow-md">"Sing and Learn!"</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default PoemSection;
