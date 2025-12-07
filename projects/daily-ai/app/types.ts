export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string; // Base64 or Blob URL
  name: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface DailyUpdate {
  id: string;
  user: string;
  role: string;
  avatarColor: string;
  yesterday: string;
  today: string;
  blockers: string;
  necessityScore: number; // 1-10
  timestamp: number;
  date: string;
  isDayOff: boolean;
  attachments?: Attachment[];
  audioUrl?: string; // If the update was recorded
  comments?: Comment[];
}

export interface DayRecord {
  date: string;
  status: MeetingStatus;
  avgScore: number;
  summary: string;
  updates: DailyUpdate[];
}

export interface AIAnalysisResult {
  status: MeetingStatus;
  summary: string;
  reasoning: string;
  priorityItems: string[];
  isManualOverride?: boolean;
}

export enum MeetingStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED'
}

export const ROLES = [
  'Product Manager',
  'Frontend Engineer',
  'Backend Engineer',
  'Lead Designer',
  'QA Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Mobile Developer'
];

// Modern Cool Palette for Navy Theme
export const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-cyan-500'
];