export enum GameState {
  MENU = 'MENU',
  AIMING = 'AIMING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  type: BallType;
  lastHitBrickId?: string | null;
}

export enum BallType {
  NORMAL = 'NORMAL',
  FIREBALL = 'FIREBALL',
  EXPLOSIVE = 'EXPLOSIVE'
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  maxHits: number;
  type: BrickType;
}

export enum BrickType {
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  MOVING = 'MOVING',
  RANDOM_REWARD = 'RANDOM_REWARD',
  EXPLOSIVE = 'EXPLOSIVE'
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
}

export enum PowerUpType {
  MULTI_BALL = 'MULTI_BALL',
  FIREBALL = 'FIREBALL',
  EXPLOSIVE = 'EXPLOSIVE',
  EXTRA_LIFE = 'EXTRA_LIFE'
}
