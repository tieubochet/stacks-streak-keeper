// Represents the user data structure from the smart contract
export interface UserStats {
  currentStreak: number;
  maxStreak: number;
  totalCheckins: number;
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

export enum AppState {
  IDLE,
  CONNECTING,
  LOADING_DATA,
  READY,
  TX_PENDING
}