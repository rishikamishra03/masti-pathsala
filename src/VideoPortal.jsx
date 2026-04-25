import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Play, ArrowLeft } from 'lucide-react';

const VIDEO_DATA = {
  reading: [
    { id: '4Qym37BuNoA', title: 'Read With Caitie! | Six Stories', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/4Qym37BuNoA/mqdefault.jpg' },
    { id: 'vEq9Z1dCRFo', title: 'Hush Little Baby (Bedtime)', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/vEq9Z1dCRFo/mqdefault.jpg' },
    { id: 'WF8iaqRqI60', title: 'The Tortoise and the Hare', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/WF8iaqRqI60/mqdefault.jpg' },
    { id: 'b2US1h2Z81k', title: 'Bedtime Camping Story', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/b2US1h2Z81k/mqdefault.jpg' },
    { id: 'ScwNYDtxVKI', title: 'The Three Little Pigs', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/ScwNYDtxVKI/mqdefault.jpg' },
    { id: 'LDgJj_NAqXA', title: 'The Little Mermaid', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/LDgJj_NAqXA/mqdefault.jpg' },
    { id: 'rdJeIOI6COQ', title: 'Bedtime With Blippi', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/rdJeIOI6COQ/mqdefault.jpg' },
    { id: 'dBZgA50scbM', title: 'Blippi Reads a Story!', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/dBZgA50scbM/mqdefault.jpg' },
    { id: 'mQ9SjDkM-gI', title: 'Goldilocks & The Three Bears', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/mQ9SjDkM-gI/mqdefault.jpg' },
    { id: 'Z3S_9o0fBoc', title: 'Classic Fairy Tales Compilation', category: 'Stories', thumbnail: 'https://i.ytimg.com/vi/Z3S_9o0fBoc/mqdefault.jpg' },
  ],
  numbers: [
    { id: 'Aq4UAss33qA', title: 'Count And Move Song', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/Aq4UAss33qA/mqdefault.jpg' },
    { id: '7D4K9oi7oBM', title: 'Top 10 Counting Songs', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/7D4K9oi7oBM/mqdefault.jpg' },
    { id: 'kuA-NCM5xL4', title: 'Numbers with Little Chicks', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/kuA-NCM5xL4/mqdefault.jpg' },
    { id: 'VWWEUChKo6s', title: 'Once I Caught a Fish Alive', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/VWWEUChKo6s/mqdefault.jpg' },
    { id: 'Yt8GFgxlITs', title: 'Counting 1 to 10 Songs', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/Yt8GFgxlITs/mqdefault.jpg' },
    { id: 'EbgwPx6mYu4', title: 'Counting 1 to 20 Songs', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/EbgwPx6mYu4/mqdefault.jpg' },
    { id: 'zDtRvUx-AHQ', title: 'Learn To Count With Blippi', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/zDtRvUx-AHQ/mqdefault.jpg' },
    { id: '0B1max66jds', title: 'Blippi 1-10 SONG', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/0B1max66jds/mqdefault.jpg' },
    { id: 'DR-cfDsHCGA', title: 'Five Little Monkeys Jumping', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/DR-cfDsHCGA/mqdefault.jpg' },
    { id: 'b0NHrFNZWh0', title: 'Ten In The Bed Song', category: 'Counting', thumbnail: 'https://i.ytimg.com/vi/b0NHrFNZWh0/mqdefault.jpg' },
  ],
  alphabets: [
    { id: 'vD98OvvDNEs', title: 'Phonics Song with Two Words', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/vD98OvvDNEs/mqdefault.jpg' },
    { id: '75p-N9YKqNo', title: 'Classic ABC Song', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/75p-N9YKqNo/mqdefault.jpg' },
    { id: '_UR-l3QI2nE', title: 'Alphabet Song for Kids', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/_UR-l3QI2nE/mqdefault.jpg' },
    { id: 'BELlZKpi1Zs', title: 'ABC Phonics Song 2', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/BELlZKpi1Zs/mqdefault.jpg' },
    { id: '36n93jvjkDs', title: 'Learn ABCs with Blippi', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/36n93jvjkDs/mqdefault.jpg' },
    { id: '_Y8zH1_fHVs', title: 'Alphabet Adventure Game', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/_Y8zH1_fHVs/mqdefault.jpg' },
    { id: 'ezmsrB59mj8', title: 'The ABC Song | ChuChu TV', category: 'Alphabets', thumbnail: 'https://i.ytimg.com/vi/ezmsrB59mj8/mqdefault.jpg' },
  ],
  animals: [
    { id: 'wCfWmlnJl-A', title: 'The Animal Sounds Song', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/wCfWmlnJl-A/mqdefault.jpg' },
    { id: 'q_6X2X0uV-k', title: 'Wild Animals for Kids', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/q_6X2X0uV-k/mqdefault.jpg' },
    { id: 't9WAGkQU_Ec', title: 'Let\'s Go To The Zoo!', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/t9WAGkQU_Ec/mqdefault.jpg' },
    { id: 'yvS8p_eA-lM', title: 'Old MacDonald Had A Farm', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/yvS8p_eA-lM/mqdefault.jpg' },
    { id: 'pWepfJ-8XU0', title: 'Baby Shark Animal Dance', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/pWepfJ-8XU0/mqdefault.jpg' },
    { id: 'owz9YpE391g', title: 'Jungle Animals Song', category: 'Animals', thumbnail: 'https://i.ytimg.com/vi/owz9YpE391g/mqdefault.jpg' },
  ],
  colors: [
    { id: 'yBTBy4p59mk', title: 'The Colors Song', category: 'Colors', thumbnail: 'https://i.ytimg.com/vi/yBTBy4p59mk/mqdefault.jpg' },
    { id: 'zxIpA5nF_LY', title: 'Learning Colors with Blippi', category: 'Colors', thumbnail: 'https://i.ytimg.com/vi/zxIpA5nF_LY/mqdefault.jpg' },
    { id: 'fX_vE6E-U8M', title: 'Colors Everywhere!', category: 'Colors', thumbnail: 'https://i.ytimg.com/vi/fX_vE6E-U8M/mqdefault.jpg' },
    { id: 'J_m-N8m8eY8', title: 'Colors Song for Children', category: 'Colors', thumbnail: 'https://i.ytimg.com/vi/J_m-N8m8eY8/mqdefault.jpg' },
    { id: 'pUPM3en_btY', title: 'The Color Train', category: 'Colors', thumbnail: 'https://i.ytimg.com/vi/pUPM3en_btY/mqdefault.jpg' },
  ]
};






const VideoPortal = ({ category, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);

  // Load history based on category
  React.useEffect(() => {
    const savedSearch = localStorage.getItem(`masti_search_history_${category}`);
    const savedPlay = localStorage.getItem(`masti_play_history_${category}`);
    setSearchHistory(savedSearch ? JSON.parse(savedSearch) : []);
    setPlayHistory(savedPlay ? JSON.parse(savedPlay) : []);
  }, [category]);

  const saveSearch = (query) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem(`masti_search_history_${category}`, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setPlayHistory([]);
    localStorage.removeItem(`masti_search_history_${category}`);
    localStorage.removeItem(`masti_play_history_${category}`);
  };

  const savePlay = (video) => {
    const newHistory = [video, ...playHistory.filter(v => v.id !== video.id)].slice(0, 8);
    setPlayHistory(newHistory);
    localStorage.setItem(`masti_play_history_${category}`, JSON.stringify(newHistory));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveSearch(searchQuery);
      const query = encodeURIComponent(searchQuery + " for kids educational");
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  };

  const videos = VIDEO_DATA[category] || [];
  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0F172A] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#1E293B] p-6 flex items-center justify-between shadow-2xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <ArrowLeft className="text-white" size={28} />
          </motion.button>
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {category === 'reading' ? '📖 Reading' : '🔢 Numbers'} <span className="text-blue-400">Hub</span>
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Interactive Video Learning</p>
          </div>
        </div>

        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20" size={20} />
          <input 
            type="text"
            placeholder={`Search for ${category === 'reading' ? 'stories or alphabets' : 'math or counting'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-[#334155] text-white pl-12 pr-4 py-3 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold relative z-10"
          />

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[110%] left-0 right-0 bg-[#1E293B] border-2 border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Searches</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                    className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {searchHistory.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(query);
                        const q = encodeURIComponent(query + " for kids educational");
                        window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-blue-600/20 text-blue-400 font-bold transition-all border-b border-white/5 last:border-0 flex items-center gap-3"
                    >
                      <Search size={14} className="opacity-50" />
                      {query}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={onBack}
          className="w-12 h-12 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/30 hover:bg-red-500/30 transition-all"
        >
          <X size={28} />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20" size={20} />
          <input 
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-[#334155] text-white pl-12 pr-4 py-3 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold relative z-10"
          />
          
          <AnimatePresence>
            {isSearchFocused && searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[110%] left-0 right-0 bg-[#1E293B] border-2 border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History</span>
                  <button onClick={clearHistory} className="text-[10px] font-black text-red-500 uppercase">Clear</button>
                </div>
                {searchHistory.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(query);
                      const q = encodeURIComponent(query + " for kids educational");
                      window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-blue-600/20 text-blue-400 font-bold border-b border-white/5 last:border-0"
                  >
                    {query}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Sections */}
        {(playHistory.length > 0) && !searchQuery && (
          <div className="mb-10 space-y-8">
            <section>
              <h4 className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Play size={14} /> Continue Watching
              </h4>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {playHistory.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedVideo(video);
                      savePlay(video);
                    }}
                    className="min-w-[180px] bg-[#1E293B] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
                  >
                    <div className="aspect-video relative">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play fill="white" className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-white text-xs font-bold truncate leading-tight">{video.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
            <div className="h-px bg-white/5 w-full" />
          </div>
        )}


        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => {
                  setSelectedVideo(video);
                  savePlay(video);
                }}
                className="bg-[#1E293B] rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-2xl cursor-pointer group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Play fill="white" className="text-white ml-1" size={32} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                      {video.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-white italic leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Ready to Play</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-24 h-24 bg-[#1E293B] rounded-full flex items-center justify-center mb-6 border-2 border-white/5 shadow-inner">
              <Search size={40} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-black text-white italic mb-2">No Local Videos Found</h3>
            <p className="text-gray-400 font-bold mb-8">But don't worry! We can find more for you.</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const query = encodeURIComponent(searchQuery + " for kids educational");
                window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
              }}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl flex items-center gap-3 transition-all border-b-4 border-blue-800"
            >
              <Play size={24} fill="white" />
              Search "{searchQuery}" on YouTube
            </motion.button>
          </div>
        )}

      </div>

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] border-4 border-white/10 relative"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-[2100] w-12 h-12 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20"
              >
                <X size={28} />
              </button>

              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              ></iframe>


              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button 
                  onClick={() => {
                    window.open(`https://www.youtube.com/watch?v=${selectedVideo.id}`, '_blank');
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl backdrop-blur-md transition-all border border-white/20 flex items-center gap-2 text-sm"
                >
                  <Play size={18} fill="white" /> Video not playing? Watch on YouTube
                </button>
              </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0F172A;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default VideoPortal;
