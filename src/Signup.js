import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function Signup({ onSignup, onToggleLogin }) {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                alert("Account created successfully! 🚀 Please log in to start your adventure.");
                onToggleLogin();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Could not connect to server');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9] p-4 font-sans overflow-hidden relative">
            {/* Animated Background Elements */}
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 left-10 text-6xl opacity-20">🎈</motion.div>
            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-10 right-10 text-6xl opacity-20">🎨</motion.div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/4 right-1/4 text-6xl opacity-10">🌟</motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 backdrop-blur-lg p-10 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md border-2 border-white relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 rotate-3"
                    >
                        <Rocket size={40} className="text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-[#1A237E] italic tracking-tight">Create Account</h2>
                    <p className="text-gray-500 font-bold mt-2">Start your learning adventure! ✨</p>
                </div>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-6 bg-red-50 py-2 rounded-xl border border-red-100 font-bold">
                        {error}
                    </motion.p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cool Username" 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[#1A237E] font-black text-sm uppercase tracking-wider ml-1">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({...formData, role: 'student'})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'student' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="text-3xl">👶</div>
                                <span className={`font-bold ${formData.role === 'student' ? 'text-blue-600' : 'text-gray-500'}`}>Student</span>
                            </motion.button>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({...formData, role: 'teacher'})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'teacher' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="text-3xl">👩‍🏫</div>
                                <span className={`font-bold ${formData.role === 'teacher' ? 'text-orange-600' : 'text-gray-500'}`}>Teacher</span>
                            </motion.button>
                        </div>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Secret Password" 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="bg-orange-500 text-white p-5 rounded-2xl font-black text-xl shadow-xl border-b-4 border-orange-700 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                        Sign Up <ArrowRight size={24} />
                    </motion.button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 font-bold">
                        Already have an account? 
                        <button onClick={onToggleLogin} className="ml-2 text-blue-600 hover:text-blue-800 transition-colors">Log In</button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
