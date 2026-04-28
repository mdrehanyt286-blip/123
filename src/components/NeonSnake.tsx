
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCcw, Trophy, Gamepad2 } from 'lucide-react';

interface SnakeGameProps {
  onBack: () => void;
}

const NeonSnake: React.FC<SnakeGameProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem('snake_highscore') || 0));
  const [isPaused, setIsPaused] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const dirRef = useRef({ x: 0, y: 0 });
  const nextDirRef = useRef({ x: 0, y: 0 });
  
  const GRID_SIZE = 20;
  const CELL_COUNT = 20;

  const reset = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = { x: Math.floor(Math.random() * CELL_COUNT), y: Math.floor(Math.random() * CELL_COUNT) };
    dirRef.current = { x: 0, y: 0 };
    nextDirRef.current = { x: 0, y: 0 };
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
  };

  const update = useCallback(() => {
    if (gameOver || isPaused) return;
    if (nextDirRef.current.x === 0 && nextDirRef.current.y === 0) return;

    dirRef.current = nextDirRef.current;
    const head = { ...snakeRef.current[0] };
    head.x += dirRef.current.x;
    head.y += dirRef.current.y;

    // Wall collision
    if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [head, ...snakeRef.current];

    // Food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 10);
      foodRef.current = { 
          x: Math.floor(Math.random() * CELL_COUNT), 
          y: Math.floor(Math.random() * CELL_COUNT) 
      };
    } else {
      newSnake.pop();
    }
    
    snakeRef.current = newSnake;
  }, [gameOver, isPaused]);

  useEffect(() => {
    const gameInterval = setInterval(update, 120);
    return () => clearInterval(gameInterval);
  }, [update]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
  }, [score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch(e.key) {
        case 'ArrowUp': handleInput(0, -1); break;
        case 'ArrowDown': handleInput(0, 1); break;
        case 'ArrowLeft': handleInput(-1, 0); break;
        case 'ArrowRight': handleInput(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let anim: number;
    const draw = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 0.5;
      for(let i=0; i<=CELL_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(i*GRID_SIZE, 0); ctx.lineTo(i*GRID_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*GRID_SIZE); ctx.lineTo(canvas.width, i*GRID_SIZE); ctx.stroke();
      }

      // Food
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(
          foodRef.current.x * GRID_SIZE + GRID_SIZE/2, 
          foodRef.current.y * GRID_SIZE + GRID_SIZE/2, 
          GRID_SIZE/2 - 4, 0, Math.PI * 2
      );
      ctx.fill();

      // Snake Rendering
      ctx.shadowBlur = 10;
      snakeRef.current.forEach((s, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
        ctx.shadowColor = isHead ? '#4ade80' : '#22c55e';
        ctx.globalAlpha = 1 - (i / (snakeRef.current.length + 5)) * 0.5;
        
        // Rounded snake body
        const radius = isHead ? 4 : 2;
        const x = s.x * GRID_SIZE + 2;
        const y = s.y * GRID_SIZE + 2;
        const w = GRID_SIZE - 4;
        const h = GRID_SIZE - 4;
        
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, []);

  const handleInput = (x: number, y: number) => {
    if (gameOver) return;
    if (isPaused) setIsPaused(false);

    // Prevent 180 degree turns
    if (x === -dirRef.current.x && x !== 0) return;
    if (y === -dirRef.current.y && y !== 0) return;
    
    nextDirRef.current = { x, y };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 text-white select-none overflow-hidden overscroll-none">
        {/* Header */}
        <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
            <button 
              onClick={onBack} 
              className="p-3 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
                <div className="text-[10px] tracking-widest uppercase text-slate-500 font-black">Score</div>
                <div className="text-2xl font-black text-white font-mono">{score}</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] tracking-widest uppercase text-slate-500 font-black">High</div>
                <div className="text-2xl font-black text-green-400 font-mono">{highScore}</div>
            </div>
        </div>

        {/* Board */}
        <div className="relative group p-1 bg-slate-800 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.15)] max-w-full">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              className="rounded-2xl bg-black w-full max-w-[min(85vw,400px)] aspect-square"
            />
            
            <AnimatePresence>
                {gameOver && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 rounded-2xl z-50"
                    >
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-1 text-white tracking-tighter">GAME OVER</h2>
                        <p className="text-slate-400 text-sm mb-8">Score: {score}</p>
                        <button 
                          onClick={reset} 
                          className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform"
                        >
                          <RotateCcw className="w-5 h-5" /> REPLAY
                        </button>
                    </motion.div>
                )}
                
                {isPaused && !gameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none z-40"
                  >
                    <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                      <Gamepad2 className="w-10 h-10 text-green-400 mb-3 animate-bounce" />
                      <div className="text-white text-sm font-black tracking-widest uppercase">Tap Arrows to Start</div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-[240px]">
            <div />
            <ControlButton onClick={() => handleInput(0, -1)} icon="▲" />
            <div />
            <ControlButton onClick={() => handleInput(-1, 0)} icon="◀" />
            <ControlButton onClick={() => handleInput(0, 1)} icon="▼" />
            <ControlButton onClick={() => handleInput(1, 0)} icon="▶" />
        </div>
    </div>
  );
};

const ControlButton = ({ onClick, icon }: { onClick: () => void, icon: string }) => (
    <button 
      onPointerDown={(e) => { e.preventDefault(); onClick(); }}
      className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl text-slate-300 font-bold active:bg-green-500/20 active:text-green-400 active:border-green-500/50 active:scale-95 transition-all shadow-lg touch-none"
    >
      {icon}
    </button>
);

export default NeonSnake;
