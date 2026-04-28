import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEngine } from '../lib/GameEngine';
import { GameState } from '../types';
import GameCanvas from './GameCanvas';
import { Trophy, Play, RotateCcw, Home, Plus, ChevronRight, Map as MapIcon, History, ChevronLeft } from 'lucide-react';

interface BrickSmashGameProps {
  onBack: () => void;
}

const BrickSmashGame: React.FC<BrickSmashGameProps> = ({ onBack }) => {
  const engineRef = useRef<GameEngine>(new GameEngine());
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [hasSave, setHasSave] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [ballCount, setBallCount] = useState(12);

  useEffect(() => {
    setHasSave(!!localStorage.getItem('brick_smash_save'));
  }, []);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const update = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (time - lastTimeRef.current) / 1000;
      engineRef.current.update(dt);
      
      // Sync React state with engine
      if (engineRef.current.gameState !== gameState) {
        setGameState(engineRef.current.gameState);
      }
      setScore(engineRef.current.score);
      setLevel(engineRef.current.level);
      setBallCount(engineRef.current.ballCount);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const startGame = () => {
    engineRef.current.reset();
    engineRef.current.startLevel();
    setGameState(GameState.AIMING);
    import('../lib/SoundManager').then(m => m.soundManager.startMusic());
  };

  const continueGame = () => {
    if (engineRef.current.loadProgress()) {
      engineRef.current.startLevel();
      setGameState(GameState.AIMING);
      setScore(engineRef.current.score);
      setLevel(engineRef.current.level);
      setBallCount(engineRef.current.ballCount);
      import('../lib/SoundManager').then(m => m.soundManager.startMusic());
    }
  };

  const restartGame = () => {
    localStorage.removeItem('brick_smash_save');
    engineRef.current.reset();
    engineRef.current.startLevel();
    setGameState(GameState.AIMING);
    import('../lib/SoundManager').then(m => m.soundManager.startMusic());
  };

  const nextLevel = () => {
    engineRef.current.nextLevel();
    setGameState(GameState.AIMING);
  };

  const handleBack = () => {
    import('../lib/SoundManager').then(m => m.soundManager.stopMusic());
    onBack();
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-sans text-white transition-colors duration-1000"
      style={{ backgroundColor: engineRef.current.getBgColor() }}
    >
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-slate-400">Score</span>
          <span className="text-2xl font-bold font-mono tracking-tighter">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-widest text-slate-400">Status</span>
          <div className="flex items-center gap-1.5 text-sky-400">
            <MapIcon className="w-4 h-4" />
            <span className="text-sm font-bold">Level {level}</span>
          </div>
          <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
             <motion.div 
               className="h-full bg-sky-500"
               initial={{ width: 0 }}
               animate={{ width: `${Math.max(0, 100 - (engineRef.current.bricks.length / ( (3 + Math.min(5, Math.floor(level / 2))) * 7) * 100))}%` }}
             />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-center z-20 pointer-events-none">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
                <Plus className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold">{ballCount} Balls</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase ml-2">Stage: {level}</div>
         </div>
      </div>

      {/* Game Stage */}
      <div className="relative shadow-2xl border-4 border-slate-800 rounded-xl overflow-hidden bg-slate-900">
        <GameCanvas engine={engineRef.current} />
        
        {/* Overlays */}
        <AnimatePresence>
          {gameState === GameState.PLAYING && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => engineRef.current.toggleSpeed()}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full text-[10px] font-black tracking-[0.2em] border border-slate-700 pointer-events-auto hover:bg-slate-700 transition-colors z-20"
            >
              SPEED UP
            </motion.button>
          )}

          {gameState === GameState.MENU && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg flex flex-col items-center justify-center z-30 p-8"
            >
              <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-sky-400 to-indigo-500 text-center"
              >
                BRICK SMASH PRO
              </motion.h1>
              <p className="text-slate-400 text-sm mb-12 text-center max-w-xs">
                The ultimate addictive brick breaker. Aim precise, bounce smart, and smash them all.
              </p>

              <div className="mb-10 flex flex-col items-center gap-4">
                <div className="px-6 py-2 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex flex-col items-center min-w-[160px]">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-sky-400 font-black">Best Stage</span>
                  <span className="text-2xl font-black text-white">{engineRef.current.maxLevel}</span>
                </div>
                <div className="px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col items-center min-w-[160px]">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-400 font-black">High Score</span>
                  <span className="text-2xl font-black text-white font-mono">{engineRef.current.highScore.toLocaleString()}</span>
                </div>
              </div>
              
        <div className="flex flex-col gap-4 w-full max-w-[240px]">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Hub
                </button>

                {hasSave && (
                   <button 
                    onClick={continueGame}
                    className="flex items-center justify-center gap-3 bg-white text-slate-950 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 border-b-4 border-slate-300"
                  >
                    <History className="w-5 h-5 text-sky-600" /> CONTINUE
                  </button>
                )}
                
                <button 
                  onClick={startGame}
                  className="flex items-center justify-center gap-3 bg-sky-500 text-white font-bold py-4 rounded-2xl hover:bg-sky-400 transition-all shadow-xl active:scale-95 border-b-4 border-sky-700"
                >
                  <Play className="w-5 h-5 fill-current" /> NEW GAME
                </button>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-8 opacity-50">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-sky-500 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Physics</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Power</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Skill</span>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === GameState.LEVEL_COMPLETE && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-sky-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-8"
            >
              <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(14,165,233,0.5)]">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              {engineRef.current.isNewRecord && (
                <motion.div 
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 12, scale: 1 }}
                  className="absolute top-20 right-10 bg-yellow-400 text-black px-3 py-1 rounded-lg font-black text-xs shadow-lg border-2 border-white z-50"
                >
                  NEW RECORD!
                </motion.div>
              )}
              
              <h2 className="text-4xl font-black mb-1 text-white uppercase tracking-tighter">LEVEL COMPLETE!</h2>
              <p className="text-sky-200 text-sm mb-8">You smashed all bricks on level {level}</p>
              
              <div className="flex flex-col gap-4 w-full max-w-[220px]">
                <button 
                  onClick={nextLevel}
                  className="group flex items-center justify-center gap-2 bg-white text-sky-950 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                >
                  NEXT LEVEL <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === GameState.GAME_OVER && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-8"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
              <h2 className="text-4xl font-black mb-1 text-white uppercase tracking-tighter">GAME OVER</h2>
              <p className="text-red-200 text-sm mb-8">You reached level {level}</p>
              
              <div className="flex flex-col gap-4 w-full max-w-[200px]">
                <button 
                  onClick={restartGame}
                  className="flex items-center justify-center gap-2 bg-white text-red-950 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" /> RESTART
                </button>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="flex items-center justify-center gap-2 bg-red-800 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Home className="w-5 h-5" /> HOME
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-slate-500 text-xs font-medium tracking-widest uppercase flex flex-col items-center gap-2">
         <span>Drag to aim  •  Release to shoot</span>
         <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Explosive</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500" /> Hard</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Ball Up</span>
         </div>
      </div>
    </div>
  );
};

export default BrickSmashGame;
