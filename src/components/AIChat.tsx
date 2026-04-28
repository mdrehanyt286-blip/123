
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to Rehan arcade! I am your AI assistant. How can I help you dominate the leaderboard today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = localStorage.getItem('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('API Key missing. Please add it in settings.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are the Rehan Arcade Assistant. You are friendly, enthusiastic about retro games, and helpful. You provide tips for Brick Smash (physics-based breaker) and Neon Snake (classic arcade). Keep responses concise and gamer-themed.",
        }
      });

      const assistantMessage = response.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 w-full max-w-[350px] h-[500px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[100]"
        >
          {/* Header */}
          <div className="p-4 bg-sky-500 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="font-black text-xs tracking-widest uppercase">Arcade AI</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1 opacity-50">
                    {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="uppercase tracking-tighter text-[8px] font-black">{m.role}</span>
                  </div>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for game tips..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:border-sky-500/50 outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-sky-500 rounded-xl text-white hover:bg-sky-400 disabled:opacity-50 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
