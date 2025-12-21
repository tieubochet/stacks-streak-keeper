
// Represents the user data structure from the smart contract
export interface UserStats {
  currentStreak: number;
  maxStreak: number;
  totalCheckins: number;
}

export interface DiaryEntry {
  id: number;
  content: string;
  timestamp: number;
}

export interface StoryContributor {
  address: string;
  wordCount: number;
}

export interface GlobalStory {
  fullContent: string;
  lastWord: string;
  contributors: StoryContributor[];
}

// Represents a leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  address: string;
  streak: number;
  total: number;
  isCurrentUser: boolean;
}

// Stacks Network Types (Simplified for this context)
export interface StacksSession {
  isUserSignedIn: () => boolean;
  loadUserData: () => any;
  signUserOut: () => void;
}

export type ActiveTab = 'dashboard' | 'journal' | 'story';

export enum AppState {
  IDLE,
  CONNECTING,
  LOADING_DATA,
  READY,
  TX_PENDING
}
