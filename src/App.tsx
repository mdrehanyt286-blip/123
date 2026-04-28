/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import BrickSmashGame from './components/BrickSmashGame';
import NeonSnake from './components/NeonSnake';
import SettingsPanel from './components/SettingsPanel';
import AIChat from './components/AIChat';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Layers, Zap, Settings as SettingsIcon, Sparkles } from 'lucide-react';

type GameMode = 'HUB' | 'BRICK' | 'SNAKE';

export default function App() {
  const [mode, setMode] = useState<GameMode>('HUB');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setHasApiKey(!!localStorage.getItem('GEMINI_API_KEY'));
  }, [isSettingsOpen]);

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden text-white font-sans">
      <AnimatePresence mode="wait">
        {mode === 'HUB' && (
          <motion.div 
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex flex-col items-center justify-center p-6 relative"
          >
            {/* Action Bar */}
            <div className="absolute top-6 right-6 flex gap-3 z-30">
              {hasApiKey && (
                <button 
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`p-4 rounded-2xl border transition-all active:scale-95 group shadow-lg ${
                    isChatOpen 
                      ? 'bg-sky-500 border-sky-400 text-white' 
                      : 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
                  }`}
                  id="open-chat-btn"
                >
                  <Sparkles className={`w-6 h-6 ${isChatOpen ? 'animate-pulse' : ''}`} />
                </button>
              )}
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 group"
                id="open-settings-btn"
              >
                <SettingsIcon className="w-6 h-6 text-slate-400 group-hover:text-sky-400 group-hover:rotate-45 transition-all" />
              </button>
            </div>

            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-sky-500 rounded-lg shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter">REHAN ARCADE</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Multi-Game Edition</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <button 
                onClick={() => setMode('BRICK')}
                className="group relative overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-sky-500/50 transition-all active:scale-95"
                id="play-brick-smash"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers className="w-20 h-20" />
                </div>
                <div className="flex flex-col items-start relative z-10 text-left">
                  <span className="text-[10px] uppercase font-black text-sky-400 tracking-[0.2em] mb-1">Puzzle Action</span>
                  <h2 className="text-2xl font-black tracking-tighter mb-2">BRICK SMASH PRO</h2>
                  <p className="text-slate-500 text-xs">Level-based physics breaker with satisfying destruction effects.</p>
                </div>
              </button>

              <button 
                onClick={() => setMode('SNAKE')}
                className="group relative overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-green-500/50 transition-all active:scale-95"
                id="play-neon-snake"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-20 h-20 text-green-500" />
                </div>
                <div className="flex flex-col items-start relative z-10 text-left">
                  <span className="text-[10px] uppercase font-black text-green-400 tracking-[0.2em] mb-1">Retro Arcade</span>
                  <h2 className="text-2xl font-black tracking-tighter mb-2">NEON SNAKE</h2>
                  <p className="text-slate-500 text-xs">The classic snake experience reimagined with a modern neon aesthetic.</p>
                </div>
              </button>
            </div>

            <div className="absolute bottom-10 text-[10px] text-slate-700 font-bold tracking-[0.5em] uppercase">
              Created for Rehan Bhai
            </div>
            
            <SettingsPanel 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
            />

            <AIChat 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
            />
          </motion.div>
        )}

        {mode === 'BRICK' && (
          <motion.div key="brick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <BrickSmashGame onBack={() => setMode('HUB')} />
          </motion.div>
        )}

        {mode === 'SNAKE' && (
          <motion.div key="snake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <NeonSnake onBack={() => setMode('HUB')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

