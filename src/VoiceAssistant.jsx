import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

export default function VoiceAssistant({ role, userId, onAction }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState(null);
  const [inputText, setInputText] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToAI(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResponse(null);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is needed for the voice assistant.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitToAI = async (formData) => {
    setIsProcessing(true);
    setResponse(null);
    try {
      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server returned an error");
      }

      const data = await res.json();
      setResponse(data);
      
      // Play audio response
      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audioPlayerRef.current = audio;
        audio.play().catch(e => console.log("Audio play blocked", e));
      }

      // Handle actions like navigation
      if (data.action && onAction) {
        onAction(data.action);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setResponse({ response: "Oops! My AI brain is offline right now. Please check if the magic server is running! ✨" });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendAudioToAI = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('role', role);
    formData.append('user_id', userId || 0);
    await submitToAI(formData);
  };

  const sendTextToAI = async () => {
    if (!inputText.trim() || isProcessing || isRecording) return;
    const textToSend = inputText;
    setInputText("");
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const formData = new FormData();
    formData.append('text', textToSend);
    formData.append('role', role);
    formData.append('user_id', userId || 0);
    await submitToAI(formData);
  };

  const isStudent = role === 'student';

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end pointer-events-none font-sans">
      
      {/* Response Bubble */}
      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`mb-6 p-6 rounded-[30px] rounded-br-lg max-w-sm shadow-2xl pointer-events-auto backdrop-blur-xl
              ${isStudent 
                ? 'bg-gradient-to-br from-white/95 to-white/80 text-gray-800 border-4 border-white ring-4 ring-pink-500/20' 
                : 'bg-slate-900/90 text-white border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
          >
            {response.transcription && (
              <div className={`mb-3 pb-3 border-b-2 border-dashed ${isStudent ? 'border-gray-200' : 'border-slate-700'}`}>
                 <p className={`text-xs uppercase tracking-widest font-black mb-1 ${isStudent ? 'text-pink-500' : 'text-cyan-400'}`}>You Asked:</p>
                 <p className="text-sm font-medium italic opacity-80">"{response.transcription}"</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-1 drop-shadow-md">{isStudent ? '🤖' : '✨'}</span>
              <p className={`font-black leading-snug ${isStudent ? 'text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500' : 'text-lg text-slate-100'}`}>
                {response.response}
              </p>
            </div>
            
            <button 
              onClick={() => {
                setResponse(null);
                if(audioPlayerRef.current) audioPlayerRef.current.pause();
              }}
              className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black transition-all hover:scale-110 shadow-lg
                ${isStudent ? 'bg-pink-500 text-white border-2 border-white' : 'bg-slate-700 text-slate-300 border border-slate-500 hover:bg-slate-600'}`}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-4 pointer-events-none">
        
        {/* Text Input Section */}
        <div className="pointer-events-auto mb-4 flex items-center shadow-2xl rounded-full bg-white/90 backdrop-blur-md border-2 border-slate-200 overflow-hidden pr-1 transition-all hover:shadow-indigo-500/20 focus-within:ring-4 ring-indigo-500/30">
          <input 
            type="text"
            disabled={isProcessing || isRecording}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendTextToAI()}
            placeholder={isStudent ? "Type to ask..." : "Type a command..."}
            className={`bg-transparent outline-none px-5 py-3 w-48 md:w-64 font-bold text-sm ${isStudent ? 'text-pink-600 placeholder-pink-300' : 'text-slate-700 placeholder-slate-400'}`}
          />
          <button 
            onClick={sendTextToAI}
            disabled={!inputText.trim() || isProcessing || isRecording}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all 
              ${!inputText.trim() ? 'bg-slate-200 text-slate-400' : isStudent ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md hover:scale-105' : 'bg-cyan-600 text-white shadow-md hover:bg-cyan-700 hover:scale-105'}`}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Assistant Avatar / Button */}
        <div className="relative pointer-events-auto flex items-center justify-center">
          
          {/* Pulsing Rings when recording */}
          <AnimatePresence>
            {isRecording && (
              <>
                <motion.div 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full ${isStudent ? 'bg-pink-400' : 'bg-cyan-500'}`}
                />
                <motion.div 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full ${isStudent ? 'bg-purple-400' : 'bg-blue-500'}`}
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`relative z-10 flex items-center justify-center transition-all overflow-hidden
              ${isStudent 
                ? 'w-24 h-24 rounded-[35px] border-4 border-white bg-gradient-to-br from-yellow-300 to-orange-400 shadow-[0_10px_30px_rgba(255,165,0,0.5)]' 
                : 'w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)]'}`}
          >
            {/* Animated Background Gradient */}
            <motion.div 
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 opacity-50 ${isStudent ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-[length:200%_200%]' : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 bg-[length:200%_200%]'}`}
            />

            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-white drop-shadow-md">
              {isStudent ? (
                <>
                  <motion.div 
                     animate={isProcessing ? { rotate: 360 } : isRecording ? { y: [0, -5, 0], scale: [1, 1.1, 1] } : {}}
                     transition={{ repeat: Infinity, duration: isProcessing ? 2 : 0.5, ease: isProcessing ? "linear" : "easeInOut" }}
                     className="text-5xl"
                  >
                    {isProcessing ? '⚙️' : isRecording ? '🎙️' : '🤖'}
                  </motion.div>
                  {!isRecording && !isProcessing && (
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-90 text-orange-900 bg-white/70 px-2 rounded-full shadow-sm">Hold to talk</span>
                  )}
                  {isProcessing && (
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1 text-white bg-black/30 px-2 py-0.5 rounded-full shadow-sm">Thinking & Processing</span>
                  )}
                </>
              ) : (
                <>
                  <motion.div 
                     animate={isProcessing ? { rotate: 360 } : isRecording ? { scale: [1, 1.2, 1] } : {}}
                     transition={{ repeat: Infinity, duration: isProcessing ? 2 : 1 }}
                     className="text-3xl"
                  >
                    {isProcessing ? '⚙️' : isRecording ? '🎙️' : '👨‍🏫'}
                  </motion.div>
                  <div className={`text-[8px] uppercase tracking-widest font-black mt-1 ${isRecording ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {isRecording ? 'Listening' : isProcessing ? 'Thinking & Processing' : 'Assist'}
                  </div>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </div>
      
    </div>
  );
}
