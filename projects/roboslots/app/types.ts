export enum PartType {
  HEAD = 'HEAD',
  BODY = 'BODY',
  ARMS = 'ARMS',
  LEGS = 'LEGS',
  WEAPON = 'WEAPON'
}

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface RobotPart {
  id: string;
  templateId: string; // Used to identify duplicates
  name: string;
  description: string;
  type: PartType;
  rarity: Rarity;
  statBonus: number;
  level: number;
  image?: string;
  equippedTo?: string; // ID of the robot this part is equipped to
}

export interface Robot {
  id:string;
  name: string;
  imageUrl?: string;
  parts: {
    [PartType.HEAD]?: RobotPart;
    [PartType.BODY]?: RobotPart;
    [PartType.ARMS]?: RobotPart;
    [PartType.LEGS]?: RobotPart;
    [PartType.WEAPON]?: RobotPart;
  };
  isActive: boolean; // Is this the currently selected robot for battle?
}

export interface BattleRecord {
  id: string;
  enemyName: string;
  outcome: 'VICTORY' | 'DEFEAT';
  date: string;
  reward: number;
  battleImageUrl?: string;
}

export interface PlayerState {
  playerName: string;
  coins: number;
  inventory: RobotPart[];
  robots: Robot[]; // Array of user's robots
  activeRobotId: string; // ID of the robot currently selected for play
  wins: number;
  losses: number;
  battleHistory: BattleRecord[];
  tutorialStep: number; 
  spinCount: number;
}

export interface BattleTurn {
  attacker: string;
  defender: string;
  damage: number;
  isCrit: boolean;
  description: string;
}

export interface BattleResult {
  winner: 'PLAYER' | 'ENEMY';
  log: BattleTurn[];
  reward: number;
  enemyName: string;
}

export enum GameView {
  SLOTS = 'SLOTS',
  WORKSHOP = 'WORKSHOP',
  BATTLE = 'BATTLE',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE'
}