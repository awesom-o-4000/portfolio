export enum WordStatus {
  CORRECT = 'CORRECT', // Green
  PRESENT = 'PRESENT', // Yellow
  ABSENT = 'ABSENT',   // Gray
  PENDING = 'PENDING'  // Neutral
}

export interface GuessResult {
  word: string;
  status: WordStatus;
}

export interface GameLevel {
  id: string;
  imageUrl: string;
  targetPrompt: string[];
  wordBank: string[]; // target + distractors, shuffled
}

export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}
