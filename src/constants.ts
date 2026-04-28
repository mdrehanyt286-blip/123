export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const BRICK_ROWS = 9;
export const BRICK_COLS = 7;
export const BRICK_GAP = 4;
export const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS;
export const BRICK_HEIGHT = 20;

export const BALL_RADIUS = 5;
export const BALL_SPEED = 7;

export const INITIAL_BALL_COUNT = 1;
export const MAX_BALLS = 200;

export const COLORS = {
  BACKGROUND: '#0f172a',
  BRICK_NORMAL: '#3b82f6',
  BRICK_HARD: '#1d4ed8',
  BRICK_EXPLOSIVE: '#ef4444',
  BRICK_REWARD: '#eab308',
  BALL: '#ffffff',
  GUIDE_LINE: 'rgba(255, 255, 255, 0.3)',
};
