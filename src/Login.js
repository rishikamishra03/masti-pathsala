import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ onLogin, onToggleSignup }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                onLogin(data);
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
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] text-9xl opacity-10">🪐</motion.div>
            <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-20 right-20 text-7xl opacity-20">🚀</motion.div>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 left-1/4 text-6xl opacity-10">🌈</motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 backdrop-blur-lg p-10 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md border-2 border-white relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 -rotate-3"
                    >
                        <LogIn size={40} className="text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-[#1A237E] italic tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 font-bold mt-2">Ready for more fun? 🎮</p>
                </div>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-6 bg-red-50 py-2 rounded-xl border border-red-100 font-bold">
                        {error}
                    </motion.p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Your Email" 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
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
                        className="bg-blue-600 text-white p-5 rounded-2xl font-black text-xl shadow-xl border-b-4 border-blue-800 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        Log In <ArrowRight size={24} />
                    </motion.button>
                    <button type="button" onClick={() => alert("Password reset is being handled by teachers! Please ask them for help. 😊")} className="text-blue-500 font-bold text-sm mt-2 hover:underline">
                        Forgot Password?
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 font-bold">
                        New to Masti Pathshala? 
                        <button onClick={onToggleSignup} className="ml-2 text-orange-600 hover:text-orange-800 transition-colors flex items-center justify-center gap-1 mx-auto mt-2">
                           <Sparkles size={16} /> Create an Account
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
