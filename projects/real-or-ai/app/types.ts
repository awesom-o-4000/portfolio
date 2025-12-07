export enum GameMode {
  MENU = 'MENU',
  TURING = 'TURING',
  GLITCH = 'GLITCH',
  DEV_ARCHITECT = 'DEV_ARCHITECT'
}

export interface TuringRound {
  id: number;
  realImageUrl: string;
  aiImageUrl: string;
  topic: string;
  aiFirst: boolean; // if true, AI image is on the left
}

export interface GlitchState {
  originalImage: string | null;
  glitchedImage: string | null;
  diffMask: ImageData | null;
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'success' | 'fail';
  clickCoordinates: { x: number; y: number } | null;
}

export interface AnalysisSection {
  title: string;
  content: string;
  items: { label: string; text: string }[];
}