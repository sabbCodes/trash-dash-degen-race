
export interface Player {
  id: string;
  name: string;
  score: number;
  position: { x: number; y: number };
  isAlive: boolean;
  gorTokens: number;
}

export interface GameState {
  phase: 'lobby' | 'countdown' | 'playing' | 'finished';
  players: Player[];
  timeLeft: number;
  raceId: string;
  obstacles: Obstacle[];
  tokens: Token[];
}

export interface Obstacle {
  id: string;
  type: 'toxic-waste' | 'spinning-trash' | 'oil-spill';
  position: { x: number; y: number };
  size: { width: number; height: number };
  animation: string;
}

export interface Token {
  id: string;
  position: { x: number; y: number };
  value: number;
  collected: boolean;
  glowEffect: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gorTokens: number;
  racesWon: number;
  totalEarnings: number;
}
