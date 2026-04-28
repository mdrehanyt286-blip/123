import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../lib/GameEngine';
import { GameState, BrickType, PowerUpType } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  COLORS, 
  BRICK_WIDTH, 
  BRICK_HEIGHT 
} from '../constants';

interface GameCanvasProps {
  engine: GameEngine;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.fillStyle = engine.getBgColor();
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Grid (Subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for(let x=0; x<CANVAS_WIDTH; x+=40) {
          ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CANVAS_HEIGHT); ctx.stroke();
      }
      for(let y=0; y<CANVAS_HEIGHT; y+=40) {
          ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_WIDTH,y); ctx.stroke();
      }

      // Draw Bricks
      const levelColor = engine.getLevelColor();
      engine.bricks.forEach(brick => {
        const progress = brick.hits / brick.maxHits;
        ctx.fillStyle = brick.type === BrickType.EXPLOSIVE ? COLORS.BRICK_EXPLOSIVE :
                        brick.type === BrickType.HARD ? COLORS.BRICK_HARD : levelColor;
        
        ctx.globalAlpha = 0.3 + progress * 0.7;
        
        // Rounded corners for bricks
        drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Brick Hits Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brick.hits.toString(), brick.x + brick.width / 2, brick.y + brick.height / 2);
      });

      // Draw Powerups
      engine.powerUps.forEach(pu => {
          ctx.beginPath();
          ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.BRICK_REWARD;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px Inter';
          ctx.fillText('+', pu.x, pu.y);
      });

      // Draw Balls
      ctx.fillStyle = COLORS.BALL;
      engine.balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,255,255,0.5)';
      });
      ctx.shadowBlur = 0;

      // Draw Launcher
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(engine.launcherPos.x, engine.launcherPos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw Aiming Guide
      if (engine.gameState === GameState.AIMING && isAiming) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = COLORS.GUIDE_LINE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(engine.launcherPos.x, engine.launcherPos.y);
        
        // Extended guide line
        const endX = engine.launcherPos.x + Math.cos(aimAngle) * 200;
        const endY = engine.launcherPos.y + Math.sin(aimAngle) * 200;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small circles along guide
        for(let i=1; i<6; i++) {
            ctx.beginPath();
            ctx.arc(
                engine.launcherPos.x + Math.cos(aimAngle) * (i * 30),
                engine.launcherPos.y + Math.sin(aimAngle) * (i * 30),
                2, 0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [engine, isAiming, aimAngle]);

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (engine.gameState !== GameState.AIMING) return;
    setIsAiming(true);
    updateAngle(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isAiming) {
      updateAngle(e);
    }
  };

  const handlePointerUp = () => {
    if (isAiming) {
      setIsAiming(false);
      engine.launchBalls(aimAngle);
    }
  };

  const updateAngle = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Angle from launcher to touch point
    let angle = Math.atan2(y - engine.launcherPos.y, x - engine.launcherPos.x);
    
    // Constraint: Can't shoot too flat
    const MIN_ANGLE = -Math.PI + 0.2;
    const MAX_ANGLE = -0.2;
    
    // If user pulls down (y > launcher.y), mirror the angle upwards
    if (y > engine.launcherPos.y) {
        angle = Math.atan2(engine.launcherPos.y - y, engine.launcherPos.x - x);
    }

    setAimAngle(Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle)));
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="touch-none cursor-crosshair block"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export default GameCanvas;
