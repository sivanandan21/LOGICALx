export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export enum PuzzleType {
  Pattern = 'Pattern',
  Logic = 'Logic',
  CodeSnippet = 'CodeSnippet',
  BrainTeaser = 'BrainTeaser',
}

export interface Puzzle {
  id: string;
  question: string;
  codeSnippet?: string; // Optional code block
  options: string[]; // Multiple choice options
  correctAnswerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  type: PuzzleType;
  xpReward: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  solvedCount: number;
  correctCount: number;
  badges: string[];
  name?: string;
  email?: string;
  avatarUrl?: string;
  subscriptionPlan?: 'free' | 'pro_monthly' | 'pro_yearly';
}

export interface DailyTask {
  id: string;
  difficulty: Difficulty;
  completed: boolean;
  puzzleId?: string; // ID of the puzzle generated for this task
}

export interface AppState {
  user: UserStats;
  dailyTasks: DailyTask[];
  history: { date: string; xpGained: number }[];
}

export const INITIAL_USER_STATE: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLoginDate: '',
  solvedCount: 0,
  correctCount: 0,
  badges: [],
  name: 'Guest',
  email: '',
  avatarUrl: '',
  subscriptionPlan: 'free',
};

export const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export const BADGES = [
  { id: 'novice', name: 'Hello World', description: 'Complete your first puzzle', icon: '🌱' },
  { id: 'streak_3', name: 'On Fire', description: '3-day streak', icon: '🔥' },
  { id: 'expert_solver', name: 'Code Ninja', description: 'Solve 10 Expert puzzles', icon: '🥷' },
  { id: 'logic_master', name: 'Vulcan Logic', description: '100% Accuracy on 5 puzzles in a row', icon: '🖖' },
];