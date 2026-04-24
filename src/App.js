import React, { useState, useEffect, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Trophy, Star, User, Users, Cog, MoreHorizontal, X 
} from 'lucide-react';

import bgMusic from "./assets/Bright Minds Theme.mp3";

// --- MAIN COMPONENTS ---
import MyClassroom from './classroom'; 
import { ChibiCharacter } from './Avatar';
import ExploreWorld from './ExploreWorld';
import MyLearningPaths from './MyLearningPaths';
import SpaceGame from "./space_game";
import NumberGame from "./number_game";
import AlphabetGame from "./alphabet";
import ColorGame from "./color";
import WordsGame from "./words_game";
import ColoringGame from "./Drawing";
import Login from './Login';
import Signup from './Signup';


// --- IMAGE IMPORTS ---
import worldImg from './world.webp';
import pathImg from './path.jpeg';
import classImg from './class.jpg';

// --- LOADING PAGE IMAGES ---
import micImg from './mic.png'; 
import ticImg from './tic.png'; 
import uniImg from './uni.png'; 
import drawImg from './draw.png'; 

// --- GAME IMAGES ---
import numImg from './no.jpg';
import alphaImg from './alpha.webp';
import spaceImg from './space.avif';
import wordImg from './word.jpg';
import soundImg from './sound.avif';
import clrsImg from './clrs.png';
import readImg from './read.webp';
import mathsImg from './maths.avif';

export default function MastiPathshalaApp() {
  const [view, setView] = useState('hub'); 
  const audioRef = useRef(null);
  const [completedGames, setCompletedGames] = useState([]);
  const [gameScores, setGameScores] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startApp, setStartApp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState('stats'); // 'stats' | 'leaderboard'
  const [leaderboard, setLeaderboard] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userAvatar, setUserAvatar] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedName = localStorage.getItem('username');
    return savedName ? { username: savedName } : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authView, setAuthView] = useState('signup');

  useEffect(() => {
    if (showProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showProfile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const theName = data.username || data.displayName || data.name;
        setCurrentUser({ username: theName, email: data.email });
        if (theName) localStorage.setItem('username', theName);
        const completedIds = data.progress
          .filter(p => p.completed)
          .map(p => p.id);
        setCompletedGames(completedIds);
        
        const scoresMap = data.progress.reduce((acc, curr) => ({ 
          ...acc, 
          [curr.id]: curr.score 
        }), {});
        setGameScores(scoresMap);
        setTotalPoints(data.totalPoints || 0);
        setUserBadges(data.badges || []);
        setUserAvatar(data.avatar || null);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    if (data.user?.username) localStorage.setItem('username', data.user.username);
    setToken(data.token);
    setCurrentUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setCurrentUser(null);
    setView('hub');
    setShowProfile(false);
  };

  useEffect(() => {
  if (!startApp) return;

  audioRef.current = new Audio(bgMusic);
  audioRef.current.loop = true;
  audioRef.current.volume = 0.3;           // keep low for background
  audioRef.current.play().catch(() => {});

  return () => {
    audioRef.current?.pause();
  };
}, [startApp]);

 
  useEffect(() => {
    if (audioRef.current) {
      if (view !== 'hub') {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [view]);

  const games = [
    { id: 'num', title: "Number Game", img: numImg, color: "bg-orange-400" },
    { id: 'alpha', title: "Alphabet Game", img: alphaImg, color: "bg-cyan-400" },
    { id: 'space', title: "Space Game", img: spaceImg, color: "bg-indigo-500" },
    { id: 'word', title: "Words Game", img: wordImg, color: "bg-pink-400" },
    { id: 'sound', title: "Sound", img: soundImg, color: "bg-yellow-400" },
    { id: 'color', title: "Colors", img: clrsImg, color: "bg-green-400" },
    { id: 'read', title: "Reading Practice", img: readImg, color: "bg-red-400" },
    { id: 'math', title: "Maths", img: mathsImg, color: "bg-blue-500" }
  ];

  const handleGameClick = async (id) => {
    new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3").play().catch(() => {});
    
    const isCompleted = !completedGames.includes(id);
    
    // Optimistic UI update
    if (isCompleted) {
      setCompletedGames([...completedGames, id]);
    } else {
      setCompletedGames(completedGames.filter(gameId => gameId !== id));
    }

    // Sync with backend
    if (token) {
      try {
        await fetch('http://localhost:5000/api/user/progress', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ module_id: id, completed: isCompleted, score: gameScores[id] || 0 })
        });
      } catch (err) {
        console.error("Failed to sync progress", err);
      }
    }
  };

  const handleGameOver = async (gameId, finalScore) => {
    // Update local state
    setGameScores(prev => ({ ...prev, [gameId]: Math.max(prev[gameId] || 0, finalScore) }));
    if (!completedGames.includes(gameId)) {
        setCompletedGames(prev => [...prev, gameId]);
    }

    // Sync with backend
    if (token) {
        try {
            const res = await fetch('http://localhost:5000/api/user/progress', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ module_id: gameId, completed: true, score: finalScore })
            });
            if (res.ok) {
                // Refresh total points
                fetchProfile();
            }
        } catch (err) {
            console.error("Failed to sync game over score", err);
        }
    }
  };

  const fetchLeaderboard = async () => {
    if (token) {
        try {
            const res = await fetch('http://localhost:5000/api/user/leaderboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        }
    }
  };

  useEffect(() => {
    if (showProfile && profileTab === 'leaderboard') {
        fetchLeaderboard();
    }
  }, [showProfile, profileTab]);

  // --- LOADING PAGE (UPDATED AS PER REQUEST) ---
  if (isLoading || !startApp) {
    return (
      <div className="min-h-screen w-full bg-[#E3F2FD] flex flex-col items-center justify-center overflow-hidden relative font-sans">
        
        {/* DARK BLUE WAVY HEADER */}
        <div className="absolute top-0 left-0 w-full z-20">
          <svg viewBox="0 0 1440 160" className="w-full drop-shadow-md text-[#0D47A1]">
            <path fill="currentColor" d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,101.3C840,85,960,75,1080,80C1200,85,1320,107,1380,117.3L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
          </svg>
        </div>

        {/* Top Left: Mouse (mic.png) */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-16 left-8 w-64 md:w-80 z-30"
        >
          <img src={micImg} alt="Mouse" className="w-full h-auto" />
        </motion.div>

        {/* Center Content: Sequential Text */}
        <div className="text-center z-10 px-4 mt-24">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl md:text-4xl font-bold text-[#1565C0] italic mb-0 uppercase tracking-widest"
          >
            Welcome to
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-9xl font-black text-orange-500 italic tracking-tighter leading-tight drop-shadow-sm"
          >
            MASTI PATHSHALA
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-2xl font-bold text-gray-500 italic mt-2"
          >
            Where learning meets fun
          </motion.p>
          
          {/* Progress Bar */}
          <div className="mt-12 w-72 md:w-[500px] h-4 bg-white/50 rounded-full mx-auto overflow-hidden border-2 border-white shadow-sm">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-full bg-[#1976D2]"
            />
            </div>
           <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setStartApp(true);
              setIsLoading(false); // Direct transition
            }}
            className="mt-10 px-10 py-4 bg-orange-500 text-white 
              text-xl font-black rounded-full 
              shadow-2xl border-b-4 border-orange-700 
              hover:bg-orange-600 transition-all"
             >
              🚀 Start Learning
            </motion.button>
          </div>

      {/* 4. UNICORN: BOTTOM LEFT (NO MARGIN) */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute bottom-0 left-0 w-[55%] md:w-[45%] h-[75%] z-10 flex items-end"
      >
        <img 
          src={uniImg} 
          alt="Unicorn" 
          className="w-full h-full object-contain object-left-bottom" // Bottom left pin
        />
      </motion.div>
        {/* Bottom Right: Teacher (tic.png) */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="absolute bottom-0 right-0 w-80 md:w-[480px] z-20"
        >
          <img src={ticImg} alt="Teacher" className="w-full h-auto" />
        </motion.div>
      </div>
    );
  }

  // --- AUTH CHECK ---
  if (!token) {
    return authView === 'login' ? (
      <Login onLogin={handleLogin} onToggleSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onSignup={handleLogin} onToggleLogin={() => setAuthView('login')} />
    );
  }

  // --- REMAINING DASHBOARD CODE (NO CHANGES) ---
  if (view === 'classroom') {
    return (
      <div className="min-h-screen w-full bg-white relative overflow-hidden">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setView('hub')}
          className="absolute bottom-6 left-6 z-[500] bg-red-500 text-white w-14 h-14 rounded-full shadow-2xl border-b-4 border-red-700 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
        >
          <X size={30} strokeWidth={4} />
        </motion.button>
        <MyClassroom onGameFinish={handleGameOver} />
      </div>
    );
  }

  if (view === 'explore') return (
    <ExploreWorld 
      onBack={() => setView('hub')} 
      onAvatarSave={fetchProfile}
    />
  );
  if (view === 'path') return <MyLearningPaths onBack={() => setView('hub')} />;

  if (view === "alpha") {
    return (
      <div className="fixed inset-0 z-[500] bg-white">
        <button
          onClick={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-black"
        >
          ← Dashboard
        </button>
        <AlphabetGame 
          onBack={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }} 
        />
      </div>
    );
  }

  if (view === "color") {
    return (
      <div className="fixed inset-0 z-[500] bg-black">
        <button
          onClick={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow-2xl font-black transition-all"
        >
          ← Dashboard
        </button>
        <ColorGame />
      </div>
    );
  }

  if (view === "word") {
    return (
      <div className="fixed inset-0 z-[500] bg-black">
        <button
          onClick={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow-2xl font-black transition-all"
        >
          ← Dashboard
        </button>
        <WordsGame />
      </div>
    );
  }

  if (view === 'space') {
    return (
      <div className="fixed inset-0 z-[500] bg-black">
        <button
          onClick={() => {
            setView('hub');
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          ← Dashboard
        </button>
        <SpaceGame onGameOver={(s) => handleGameOver('space', s)} />
      </div>
    );
  }

  if (view === "draw") {
    return (
      <div className="fixed inset-0 z-[500] bg-white">
        <button
          onClick={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow-2xl font-black transition-all"
        >
          ← Dashboard
        </button>
        <ColoringGame onBack={() => {
          setView("hub");
          audioRef.current?.play().catch(() => {});
        }} />
      </div>
    );
  }
  if (view === "num") {
    return (
      <div className="fixed inset-0 z-[500] bg-black">
        <button
          onClick={() => {
            setView("hub");
            audioRef.current?.play().catch(() => {});
          }}
          className="absolute top-4 left-4 z-[600] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          ← Back
        </button>
        <NumberGame onGameOver={(s) => handleGameOver('num', s)} />
      </div>
    );
  }

  return (
    <>
      {/* Profile Drawer Overlay */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[210] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1A237E] italic">Your Profile</h2>
                <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={32} />
                </button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-2xl mb-8 shrink-0">
                  <button 
                      onClick={() => setProfileTab('stats')}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${profileTab === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  >
                      My Stats
                  </button>
                  <button 
                      onClick={() => setProfileTab('leaderboard')}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${profileTab === 'leaderboard' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  >
                      Leaderboard
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                  {profileTab === 'stats' ? (
                      <>
                          <div className="flex flex-col items-center mb-10">
                              <div className="w-40 h-40 flex items-center justify-center mb-4">
                                  {userAvatar ? (
                                      <ChibiCharacter avatar={userAvatar} size={160} animate={true} />
                                  ) : (
                                      <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white ring-4 ring-orange-500/20">
                                          👤
                                      </div>
                                  )}
                              </div>
                              <h3 className="text-2xl font-black text-gray-800">{currentUser?.username || currentUser?.displayName || currentUser?.name || 'Learner'}</h3>
                              <p className="text-gray-500 font-bold">{currentUser?.email}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-10">
                              <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-100 flex flex-col items-center">
                                  <Trophy size={32} className="text-yellow-600 mb-2" />
                                  <span className="text-2xl font-black text-yellow-700">{totalPoints}</span>
                                  <span className="text-xs font-bold text-yellow-600/60 uppercase">Total Points</span>
                              </div>
                              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center">
                                  <Star size={32} className="text-blue-600 mb-2" />
                                  <span className="text-2xl font-black text-blue-700">{completedGames.length}</span>
                                  <span className="text-xs font-bold text-blue-600/60 uppercase">Games Done</span>
                              </div>
                          </div>

                          <h4 className="text-lg font-black text-gray-800 mb-4 uppercase tracking-wider">My Badges</h4>
                          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mb-8">
                              {userBadges.map((badge, idx) => (
                                  <div key={idx} className="flex flex-col items-center min-w-[100px] bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm">
                                      <div className="text-4xl mb-2 drop-shadow-md">🏅</div>
                                      <span className="text-[10px] font-black text-gray-800 text-center uppercase leading-tight">{badge.title}</span>
                                  </div>
                              ))}
                              {userBadges.length === 0 && (
                                  <div className="text-gray-400 font-bold text-sm italic">Play games to earn medals! 🎖️</div>
                              )}
                          </div>

                          <h4 className="text-lg font-black text-gray-800 mb-4 uppercase tracking-wider">Top Scores</h4>
                          <div className="flex flex-col gap-3">
                              {games.map(game => (
                                <div key={game.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                                      {game.icon}
                                    </div>
                                    <span className="font-bold text-gray-700">{game.title}</span>
                                  </div>
                                  <div className="font-black text-blue-600">
                                    {gameScores[game.id] || 0}
                                  </div>
                                </div>
                              ))}
                          </div>
                      </>
                  ) : (
                      <div className="flex flex-col gap-4">
                          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Top Learners</h3>
                          {leaderboard.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-white shadow-sm">
                                  <div className="flex items-center gap-4">
                                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black italic">{idx + 1}</span>
                                      <span className="font-bold text-gray-800">{item.username}</span>
                                  </div>
                                  <span className="font-black text-blue-600">{item.total_points} pts</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <button 
                onClick={handleLogout}
                className="mt-8 w-full py-4 bg-red-50 text-red-600 rounded-3xl font-black text-lg border-2 border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full relative overflow-hidden font-sans"
           style={{ background: 'repeating-linear-gradient(45deg, #00d2ff, #00d2ff 20px, #00b0ff 20px, #00b0ff 40px)' }}>
        
        <div className="relative z-[60] w-full">
          <svg viewBox="0 0 1440 120" className="absolute top-0 w-full drop-shadow-lg text-white">
            <path fill="currentColor" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
          </svg>
          <header className="relative px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-pink-400 rounded-full border-2 border-white flex items-center justify-center text-2xl shadow-md animate-bounce">🐭</div>
               <h1 className="text-3xl font-black text-[#1A237E] italic uppercase tracking-tighter">
                  MASTI <span className="text-orange-500">PATHSHALA</span>
               </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-yellow-400 px-6 py-2 rounded-full border-b-2 border-yellow-600 flex items-center gap-2 text-white font-black shadow-md cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowProfile(true)}>
                  <Trophy size={20} /> {totalPoints}
               </div>
                <button 
                  onClick={() => setShowProfile(true)} 
                  className="p-1 rounded-2xl shadow-lg border-b-2 border-blue-800 bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center overflow-hidden"
                  style={{ width: '56px', height: '56px' }}
                >
                  {userAvatar ? (
                    <div className="scale-[0.45] mt-8">
                      <ChibiCharacter avatar={userAvatar} size={120} animate={false} />
                    </div>
                  ) : (
                    <User size={28} className="text-white" />
                  )}
                </button>
            </div>
          </header>
        </div>

        <main className="relative z-20 max-w-[1600px] mx-auto mt-12 px-6 flex flex-col gap-10 pb-16">
          <div className="flex gap-8 items-stretch h-[380px]"> 
            <div className="flex-[3] bg-[#4A148C] rounded-[40px] p-1.5 border-2 border-white shadow-xl relative overflow-hidden">
              <div className="bg-[#4A148C] rounded-[35px] h-full p-6 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-white text-3xl font-black italic">Daily Learning Quest</h2>
                   <div className="flex gap-2 bg-black/30 p-2.5 rounded-2xl border border-white/10">
                     {games.slice(0, 5).map((_, i) => (
                       <Star key={i} size={24} fill={completedGames.includes(games[i].id) ? "#FFD700" : "transparent"} className={completedGames.includes(games[i].id) ? "text-yellow-400 drop-shadow-md" : "text-white/10"} />
                     ))}
                   </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth px-2">
                  {games.map((game) => (
                    <motion.div 
                      key={game.id} 
                      whileHover={{ scale: 1.05, y: -5 }} 
                      className={`min-w-[240px] bg-white rounded-[35px] p-4 shadow-2xl border-b-8 border-gray-200 relative ${["space", "num", "alpha", "color", "word"].includes(game.id) ? "cursor-pointer" : "opacity-75 cursor-not-allowed"}`}
                      onClick={(e) => {
                        const functionalGames = ["space", "num", "alpha", "color", "word"];
                        if (!functionalGames.includes(game.id)) {
                           e.preventDefault();
                           return; // Do nothing for unbuilt games
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        handleGameClick(game.id);
                        
                        if (audioRef.current) {
                          audioRef.current.pause();
                        }
                        setView(game.id);
                      }} 
                    >
                      {!["space", "num", "alpha", "color", "word"].includes(game.id) && (
                        <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-[35px] flex items-center justify-center">
                          <div className="bg-gray-800 text-white font-black px-4 py-2 rounded-xl border-2 border-white rotate-[-5deg] shadow-xl">
                            🚧 COMING SOON
                          </div>
                        </div>
                      )}
                      <div className={`${game.color} rounded-[25px] h-40 mb-4 overflow-hidden relative shadow-inner`}>
                        <img src={game.img} alt={game.title} className="w-full h-full object-cover" />
                        <AnimatePresence>
                          {completedGames.includes(game.id) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                              <div className="bg-green-500 text-white font-black px-4 py-2 rounded-full border-2 border-white animate-bounce text-sm">DONE ✓</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="text-[#1A237E] font-black text-center text-lg uppercase tracking-tight italic">{game.title}</div>
                      {gameScores[game.id] !== undefined && (
                          <div className="text-orange-500 font-black text-center text-sm">Best: ⭐ {gameScores[game.id]}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            

            <motion.div 
              whileHover={{ scale: 1.03 }} 
              onClick={() => setView('explore')} 
              className="flex-1 bg-white rounded-[40px] p-1.5 border-2 border-white shadow-xl cursor-pointer relative overflow-hidden group"
            >
               <div className="bg-green-400 rounded-[35px] h-full relative overflow-hidden">
                  <img src={worldImg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="World" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <span className="bg-white/95 text-green-700 px-8 py-3 rounded-full font-black shadow-2xl uppercase italic text-md border-b-4 border-green-100">Explore World</span>
                  </div>
               </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-10 h-[280px]">
             <motion.div 
               whileHover={{ scale: 1.03, y: -5 }} 
               onClick={() => setView('classroom')}
               className="bg-white rounded-[45px] p-2 border-2 border-white shadow-xl cursor-pointer overflow-hidden group"
             >
                <div className="bg-pink-400 rounded-[38px] h-full relative overflow-hidden">
                   <img src={classImg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Class" />
                   <div className="absolute bottom-8 right-8 bg-white/95 text-pink-600 px-10 py-4 rounded-full font-black shadow-2xl uppercase italic text-xl border-b-4 border-pink-100">My Classroom</div>
                </div>
             </motion.div>

             <motion.div 
               whileHover={{ scale: 1.03, y: -5 }} 
               onClick={() => setView('path')}
               className="bg-white rounded-[45px] p-2 border-2 border-white shadow-xl cursor-pointer overflow-hidden group"
             >
                <div className="bg-cyan-400 rounded-[38px] h-full relative overflow-hidden">
                   <img src={pathImg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Path" />
                   <div className="absolute bottom-8 right-8 bg-white/95 text-cyan-700 px-10 py-4 rounded-full font-black shadow-2xl uppercase italic text-xl border-b-4 border-cyan-100">Learning Path</div>
                </div>
             </motion.div>
          </div>
        </main>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </>
  );
}