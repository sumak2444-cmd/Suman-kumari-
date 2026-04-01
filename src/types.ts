export type Command = 'MOVE_FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'REPEAT';

export interface Level {
  id: number;
  title: string;
  description: string;
  lessonTitle: string;
  lessonContent: string;
  notes: string[];
  hint: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  gridSize: number;
  startPos: { x: number; y: number };
  startDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  goalPos: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  maxCommands: number;
  allowedCommands: Command[];
  rewardCoins: number;
  isTypingLevel?: boolean;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface GameState {
  currentLevelIndex: number;
  isExecuting: boolean;
  robotPos: { x: number; y: number };
  robotDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  commands: { type: Command; value?: number }[];
  status: 'IDLE' | 'SUCCESS' | 'FAILURE';
  coins: number;
  selectedSkin: string;
  unlockedSkins: string[];
}
