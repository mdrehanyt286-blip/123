import { 
  Ball, 
  Brick, 
  Vector2, 
  GameState, 
  BallType, 
  BrickType, 
  PowerUp, 
  PowerUpType 
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  BALL_RADIUS, 
  BALL_SPEED,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_GAP,
  BRICK_COLS
} from '../constants';
import { soundManager } from './SoundManager';

export class GameEngine {
  balls: Ball[] = [];
  bricks: Brick[] = [];
  powerUps: PowerUp[] = [];
  gameState: GameState = GameState.MENU;
  score: number = 0;
  level: number = 1;
  ballCount: number = 1;
  spawnedBalls: number = 0;
  ballsToSpawn: number = 0;
  spawnTimer: number = 0;
  ballsAtBottom: number = 0;
  launcherPos: Vector2 = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 };
  launchAngle: number = -Math.PI / 2;
  ballsLaunched: number = 0;
  maxLevel: number = 1;
  highScore: number = 0;
  isNewRecord: boolean = false;

  constructor() {
    this.loadProgress();
    this.reset();
  }

  reset() {
    if (this.score > this.highScore) {
       this.saveProgress();
    }
    this.balls = [];
    this.bricks = [];
    this.powerUps = [];
    this.score = 0;
    this.level = 1;
    this.ballCount = 12;
    this.gameState = GameState.MENU;
    this.setupLevel();
  }

  getLevelProgress(): number {
      const initialCount = (3 + Math.min(5, Math.floor(this.level / 2))) * BRICK_COLS * 0.8; // Estimate
      // Better way: Count total hits expected when setup?
      // For now, let's just use count of bricks.
      return this.bricks.length; 
  }

  saveProgress() {
    this.maxLevel = Math.max(this.maxLevel, this.level);
    this.highScore = Math.max(this.highScore, this.score);
    const data = {
      level: this.level,
      ballCount: this.ballCount,
      score: this.score,
      maxLevel: this.maxLevel,
      highScore: this.highScore
    };
    localStorage.setItem('brick_smash_save', JSON.stringify(data));
  }

  loadProgress(): boolean {
    const saved = localStorage.getItem('brick_smash_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.level = data.level || 1;
        this.ballCount = data.ballCount || 12;
        this.score = data.score || 0;
        this.maxLevel = data.maxLevel || 1;
        this.highScore = data.highScore || 0;
        this.setupLevel();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  nextLevel() {
    this.level++;
    this.ballCount++; 
    this.isNewRecord = false;
    this.saveProgress(); // Save on every level clear
    this.setupLevel();
    this.gameState = GameState.AIMING;
  }

  getLevelColor() {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      return colors[(this.level - 1) % colors.length];
  }

  getBgColor() {
      const colors = ['#0f172a', '#064e3b', '#451a03', '#450a0a', '#2e1065', '#4c0519'];
      return colors[(this.level - 1) % colors.length];
  }

  setupLevel() {
    this.bricks = [];
    this.powerUps = [];
    
    // Generate multiple rows for a "Stage"
    const rows = 3 + Math.min(5, Math.floor(this.level / 2));
    const startY = 80;
    
    for (let r = 0; r < rows; r++) {
      const rowY = startY + r * (BRICK_HEIGHT + BRICK_GAP);
      for (let i = 0; i < BRICK_COLS; i++) {
        if (Math.random() < 0.2) continue;

        const brickType = Math.random() < 0.1 ? BrickType.EXPLOSIVE : 
                          Math.random() < 0.2 ? BrickType.HARD : BrickType.NORMAL;
        
        // Hits scale with level but more manageable
        const hits = Math.floor(this.level * (brickType === BrickType.HARD ? 2 : 1) + Math.random() * 5);
        
        this.bricks.push({
          id: Math.random().toString(36).substr(2, 9),
          x: BRICK_GAP + i * (BRICK_WIDTH + BRICK_GAP),
          y: rowY,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          hits: Math.max(1, hits),
          maxHits: Math.max(1, hits),
          type: brickType
        });
      }
    }

    // Add some powerups in the level
    for(let k=0; k<2; k++) {
        this.powerUps.push({
             id: Math.random().toString(36).substr(2, 9),
             x: Math.random() * (CANVAS_WIDTH - 40) + 20,
             y: startY + Math.random() * (rows * (BRICK_HEIGHT + BRICK_GAP)) + 10,
             type: PowerUpType.MULTI_BALL,
             radius: 10
        });
    }
  }

  generateBricks() {
      // This is now handled by setupLevel or for endless mode
      // For now, let's keep it as a no-op or a simple row addition if needed
  }

  startLevel() {
    this.gameState = GameState.AIMING;
  }

  launchBalls(angle: number) {
    if (this.gameState !== GameState.AIMING) return;
    this.launchAngle = angle;
    this.ballsToSpawn = this.ballCount;
    this.spawnedBalls = 0;
    this.ballsAtBottom = 0;
    this.gameState = GameState.PLAYING;
    soundManager.playLaunch();
  }

  update(dt: number) {
    if (this.gameState !== GameState.PLAYING) return;

    const steps = 4;
    for (let s = 0; s < steps; s++) {
        if (s === 0 && this.spawnedBalls < this.ballsToSpawn) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnBall();
                this.spawnTimer = 0.08;
            }
        }

        for (let i = this.balls.length - 1; i >= 0; i--) {
          const ball = this.balls[i];
          ball.position.x += ball.velocity.x / steps;
          ball.position.y += ball.velocity.y / steps;

          if (ball.position.x - ball.radius < 0) {
            ball.position.x = ball.radius;
            ball.velocity.x *= -1;
            soundManager.playHit();
          }
          if (ball.position.x + ball.radius > CANVAS_WIDTH) {
            ball.position.x = CANVAS_WIDTH - ball.radius;
            ball.velocity.x *= -1;
            soundManager.playHit();
          }
          if (ball.position.y - ball.radius < 0) {
            ball.position.y = ball.radius;
            ball.velocity.y *= -1;
            soundManager.playHit();
          }

          if (ball.position.y + ball.radius > CANVAS_HEIGHT) {
            this.ballsAtBottom++;
            if (this.ballsAtBottom === 1) {
                this.launcherPos.x = ball.position.x;
            }
            this.balls.splice(i, 1);
            continue;
          }

          let collidedWithBrick = false;
          for (let j = this.bricks.length - 1; j >= 0; j--) {
            const brick = this.bricks[j];
            if (this.checkCollision(ball, brick)) {
              this.resolveCollision(ball, brick);
              brick.hits--;
              this.score += 10;
              soundManager.playHit();

              if (brick.hits <= 0) {
                soundManager.playBreak();
                if (brick.type === BrickType.EXPLOSIVE) {
                    this.explode(brick);
                }
                this.bricks.splice(j, 1);
              }
              collidedWithBrick = true;
              break; 
            }
          }

          if (!collidedWithBrick) {
            for (let j = this.powerUps.length - 1; j >= 0; j--) {
                const pu = this.powerUps[j];
                const dist = Math.hypot(ball.position.x - pu.x, ball.position.y - pu.y);
                if (dist < ball.radius + pu.radius) {
                    soundManager.playPowerUp();
                    if (pu.type === PowerUpType.MULTI_BALL) {
                        this.ballCount++;
                    }
                    this.powerUps.splice(j, 1);
                }
            }
          }
        }
    }

    // Check round end
    if (this.spawnedBalls === this.ballsToSpawn && this.balls.length === 0) {
      if (this.bricks.length === 0) {
          // LEVEL CLEAR!
          if (this.level > this.maxLevel) {
              this.isNewRecord = true;
          }
          this.gameState = GameState.LEVEL_COMPLETE;
      } else if ((this.gameState as GameState) !== GameState.GAME_OVER) {
        this.gameState = GameState.AIMING;
      }
    }
  }

  // Add a speed-up helper if rounds take too long
  toggleSpeed() {
      this.balls.forEach(b => {
          b.velocity.x *= 1.5;
          b.velocity.y *= 1.5;
      });
  }


  spawnBall() {
    const velocity = {
      x: Math.cos(this.launchAngle) * BALL_SPEED,
      y: Math.sin(this.launchAngle) * BALL_SPEED
    };
    this.balls.push({
      id: Math.random().toString(36).substr(2, 9),
      position: { ...this.launcherPos },
      velocity,
      radius: BALL_RADIUS,
      type: BallType.NORMAL
    });
    this.spawnedBalls++;
  }

  checkCollision(ball: Ball, brick: Brick) {
    const closestX = Math.max(brick.x, Math.min(ball.position.x, brick.x + brick.width));
    const closestY = Math.max(brick.y, Math.min(ball.position.y, brick.y + brick.height));
    const distance = Math.hypot(ball.position.x - closestX, ball.position.y - closestY);
    return distance < ball.radius;
  }

  resolveCollision(ball: Ball, brick: Brick) {
    const prevX = ball.position.x - ball.velocity.x;
    const prevY = ball.position.y - ball.velocity.y;

    if (prevX + ball.radius <= brick.x || prevX - ball.radius >= brick.x + brick.width) {
      ball.velocity.x *= -1;
    } else {
      ball.velocity.y *= -1;
    }
  }

  explode(brick: Brick) {
      const radius = 60;
      for (let i = this.bricks.length - 1; i >= 0; i--) {
          const b = this.bricks[i];
          const dist = Math.hypot(b.x + b.width/2 - (brick.x + brick.width/2), b.y + b.height/2 - (brick.y + brick.height/2));
          if (dist < radius) {
              b.hits -= 5;
              if (b.hits <= 0) this.bricks.splice(i, 1);
          }
      }
  }
}
