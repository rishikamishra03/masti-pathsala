import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, BarChart2, Bell, LogOut, Search, 
  Filter, CheckCircle, Clock, MessageCircle, Send, 
  Star, Trophy, TrendingUp, Calendar, Trash2, X
} from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';

export default function TeacherDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [magicalMessage, setMagicalMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    category: 'Maths',
    due_date: ''
  });

  const handleAssistantAction = (action) => {
    switch (action) {
      case 'OPEN_CREATE_ASSIGNMENT':
        setIsAssignmentModalOpen(true);
        break;
      case 'OPEN_MAGICAL_MESSAGE':
        setIsMessageModalOpen(true);
        break;
      case 'VIEW_ANALYTICS':
        setActiveTab('overview');
        break;
      case 'VIEW_STUDENTS':
        setActiveTab('students');
        break;
      case 'ADD_STUDENT':
        setActiveTab('students');
        break;
      default:
        break;
    }
  };
  
  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAssignments: 0,
    averagePoints: 0,
    submissionsToday: 0
  });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Students
      const sRes = await fetch('http://localhost:5000/api/teacher/students', { headers });
      const sData = await sRes.json();
      
      // Fetch Assignments
      const aRes = await fetch('http://localhost:5000/api/teacher/assignments', { headers });
      const aData = await aRes.json();

      // Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/teacher/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Activity
      const actRes = await fetch('http://localhost:5000/api/teacher/activity', { headers });
      if (actRes.ok) {
        const actData = await actRes.json();
        console.log("DEBUG: Teacher Activity Data fetched:", actData);
        setActivity(actData);
      }
      
      if (sRes.ok) setStudents(sData);
      if (aRes.ok) setAssignments(aData);

      // Fetch Notifications
      const nRes = await fetch('http://localhost:5000/api/teacher/notifications', { headers });
      if (nRes.ok) {
        const nData = await nRes.json();
        setNotifications(nData);
      }
    } catch (err) {
      console.error("Failed to fetch teacher data", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/teacher/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        alert("Assignment deleted!");
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };


  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description) {
      alert("Please fill in the title and description! 📝");
      return;
    }
    const assignmentData = {
      title: newAssignment.title || "Untitled Task",
      description: newAssignment.description || "",
      category: newAssignment.category || "Maths",
      due_date: newAssignment.due_date || null
    };

    console.log("Submitting sanitized assignment:", assignmentData);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/teacher/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
      });
      
      if (res.ok) {
        setIsAssignmentModalOpen(false);
        setNewAssignment({ title: '', description: '', category: 'Maths', due_date: '' });
        fetchData();
        alert("Assignment created successfully! 📚 Notification sent to all students.");
      } else {
        const errorData = await res.json();
        const fullMessage = errorData.error ? `${errorData.message}: ${errorData.error}` : errorData.message;
        alert(`Failed to create assignment: ${fullMessage || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to connect to the server. Please check if the backend is running.");
    }
  };

  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/teacher/assignments/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAssignmentSubmissions(data);
        setIsSubmissionsModalOpen(true);
      }
    } catch (err) {
      alert("Failed to fetch submissions.");
    }
  };

  const handleSendMagicalMessage = async () => {
    if (!magicalMessage.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/teacher/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: magicalMessage })
      });
      setMagicalMessage('');
      setIsMessageModalOpen(false);
      alert("Magical Message sent to all students! ✨");
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/teacher/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-[#1E293B] text-white flex flex-col shadow-2xl z-30">
        <div className="p-8 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">👩‍🏫</div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">TEACHER <span className="text-indigo-400">HUB</span></h1>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Masti Pathshala</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'overview', icon: <BarChart2 size={20} />, label: 'Overview' },
            { id: 'students', icon: <Users size={20} />, label: 'Students' },
            { id: 'assignments', icon: <BookOpen size={20} />, label: 'Assignments' },
            { id: 'messages', icon: <Bell size={20} />, label: 'Notifications' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-700/50">
          <div className="bg-slate-800/50 p-4 rounded-3xl mb-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                {user.username?.charAt(0) || 'T'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate">{user.username}</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Lead Teacher</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'students' && 'Student Management'}
              {activeTab === 'assignments' && 'Learning Tasks'}
              {activeTab === 'messages' && 'Notifications & Alerts'}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Welcome back, {user.username}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
            >
              <Send size={16} />
              Magical Message
            </button>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
               <Bell size={20} className="text-slate-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stat Grid */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Total Learners', value: stats.totalStudents, icon: <Users />, color: 'bg-blue-500', trend: '+12% this month' },
                  { label: 'Avg. Points', value: stats.averagePoints, icon: <Trophy />, color: 'bg-yellow-500', trend: 'Growing steady' },
                  { label: 'Active Tasks', value: stats.activeAssignments, icon: <BookOpen />, color: 'bg-indigo-500', trend: '3 due tomorrow' },
                  { label: 'Submissions', value: stats.submissionsToday, icon: <TrendingUp />, color: 'bg-emerald-500', trend: 'Peak activity' },
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color}/30 group-hover:scale-110 transition-transform`}>
                        {stat.icon}
                      </div>
                      <span className="text-slate-400"><TrendingUp size={20} /></span>
                    </div>
                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</h3>
                    <p className="text-3xl font-black text-slate-800 tracking-tight mb-2">{stat.value}</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase">{stat.trend}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* Recent Submissions */}
                <div className="col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Activity</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={fetchData}
                        className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                      >
                        🔄 Refresh
                      </button>
                      <button className="text-slate-400 font-black text-xs uppercase tracking-widest">View All</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {activity.length > 0 ? activity.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner font-bold ${act.type === 'assignment' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {act.username.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{act.username}</p>
                            <p className="text-xs text-slate-400 font-bold">
                              {act.type === 'assignment' ? `Completed "${act.module_title}"` : `Played "${act.module_title}" module`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${act.type === 'assignment' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                            +{act.score} PTS
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {new Date(act.activity_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-slate-400 font-bold italic">No recent activity yet.</div>
                    )}
                  </div>
                </div>

                {/* Quick Message */}
                <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Star size={120} fill="white" />
                  </div>
                  <h3 className="text-2xl font-black italic mb-4 leading-tight">Send a Magical Message ✨</h3>
                  <p className="text-indigo-100 font-bold text-sm mb-8">Encourage your little learners with a broadcast message today!</p>
                  <textarea 
                    value={magicalMessage}
                    onChange={(e) => setMagicalMessage(e.target.value)}
                    placeholder="Write something magical..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder-indigo-200/50 mb-4 focus:outline-none focus:ring-2 ring-white/30 h-32 no-scrollbar"
                  />
                  <button 
                    onClick={handleSendMagicalMessage}
                    className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
                  >
                    Broadcast Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- STUDENTS TAB --- */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search for a student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 font-bold"
                  />
                </div>
                <div className="flex gap-4">
                  <button className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm"><Filter size={20} /></button>
                  <button 
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    Create New Task
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Total Points</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Progress</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm border border-indigo-100">
                              {s.username.charAt(0)}
                            </div>
                            <span className="font-black text-slate-800">{s.username}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-500">{s.email || 'no-email@masti.com'}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-yellow-600 font-black">
                            <Trophy size={16} />
                            {s.total_score || 0}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (s.modules_completed / (s.modules_started || 1)) * 100)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 block">
                            {s.modules_completed} Modules Done
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest p-2">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- ASSIGNMENTS TAB --- */}
          {activeTab === 'assignments' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Learning Tasks</h3>
                <button 
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  Create New Assignment
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {assignments.map((a, i) => (
                  <motion.div 
                    initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={i} 
                    className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                      {a.category}
                    </div>
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
                        📚
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 mb-1">{a.title}</h4>
                        <p className="text-sm font-bold text-slate-400 line-clamp-2">{a.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                          <Clock size={16} className="text-slate-400" />
                          <span>Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                          <Users size={16} className="text-slate-400" />
                          <span>Class Task</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleViewSubmissions(a.id)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {assignments.length === 0 && (
                   <div className="col-span-2 text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                      <div className="text-5xl mb-4 opacity-20">📚</div>
                      <h3 className="text-slate-400 font-bold italic">No assignments created yet.</h3>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* --- NOTIFICATIONS TAB --- */}
          {activeTab === 'messages' && (
             <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Sent Notifications</h3>
                   <button 
                    onClick={() => setIsMessageModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all"
                   >
                     Send New Alert
                   </button>
                </div>

                <div className="grid gap-4">
                   {notifications.map((n, i) => (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors"
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${n.type === 'magical' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                               {n.type === 'magical' ? '✨' : '📚'}
                            </div>
                            <div>
                               <p className="font-black text-slate-800">{n.message}</p>
                               <div className="flex items-center gap-4 mt-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.type} broadcast</span>
                                  <span className="text-[10px] font-black text-slate-300">•</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</span>
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleDeleteNotification(n.id)}
                           className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         >
                            <Trash2 size={18} />
                         </button>
                      </motion.div>
                   ))}
                   {notifications.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                         <div className="text-5xl mb-4 opacity-20">🔔</div>
                         <h3 className="text-slate-400 font-bold italic">No notifications sent yet.</h3>
                      </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* --- MAGICAL MESSAGE MODAL --- */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl relative z-10 p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Bell size={200} />
              </div>
              <h3 className="text-3xl font-black italic text-slate-800 mb-4 tracking-tighter">Magical Message ✨</h3>
              <p className="text-slate-500 font-bold mb-8">Send an encouraging word to every child currently logged in. Your message will pop up with sparkles!</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                   <textarea 
                    value={magicalMessage}
                    onChange={(e) => setMagicalMessage(e.target.value)}
                    placeholder="e.g., You're all doing amazing today! Keep learning! 🌟"
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-800 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-500/10 h-40 no-scrollbar"
                   />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsMessageModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendMagicalMessage}
                    className="flex-2 py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                  >
                    <Send size={18} />
                    Send Magical Message
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE ASSIGNMENT MODAL --- */}
      <AnimatePresence>
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl relative z-10 p-10 overflow-hidden"
            >
              <h3 className="text-3xl font-black italic text-slate-800 mb-6 tracking-tighter">Create Assignment 📚</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g., Space Explorer Quiz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-4 ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Describe the task for your students..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-4 ring-indigo-500/10 h-24 no-scrollbar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newAssignment.category}
                      onChange={(e) => setNewAssignment({...newAssignment, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-4 ring-indigo-500/10"
                    >
                      <option>Maths</option>
                      <option>Science</option>
                      <option>Language</option>
                      <option>Creative</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      type="date"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-4 ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateAssignment}
                    className="flex-2 py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIEW SUBMISSIONS MODAL --- */}
      <AnimatePresence>
        {isSubmissionsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmissionsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl relative z-10 p-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black italic text-slate-800 tracking-tighter">Student Submissions 📝</h3>
                <button onClick={() => setIsSubmissionsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={28} className="text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
                <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Submission</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAssignmentSubmissions?.map((sub, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0">
                          <td className="px-6 py-4">
                            <div className="font-black text-slate-800">{sub.student_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-600 max-w-xs truncate">
                              {sub.submission_text || 'No submission yet'}
                            </p>
                            {sub.submission_text && (
                              <button 
                                onClick={() => alert(sub.submission_text)}
                                className="text-[10px] font-black text-indigo-600 uppercase mt-1 hover:underline"
                              >
                                View Full
                              </button>
                            )}

                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                            {sub.completed_at ? new Date(sub.completed_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <VoiceAssistant role="teacher" userId={user?.id} onAction={handleAssistantAction} />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
