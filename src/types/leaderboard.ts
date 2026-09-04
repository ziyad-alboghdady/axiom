import { Timestamp } from "firebase/firestore";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarInitials: string;
  city: string;
  country: string;
  isFriend: boolean;
  weeklyCo2Kg: number;
  totalXp: number;
  level: number;
  levelName: string;
  streakDays: number;
  badgeCount: number;
  updatedAt: Timestamp;
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
  delta: number;
  isCurrentUser: boolean;
}

export interface LeaderboardState {
  entries: RankedEntry[];
  myEntry: RankedEntry | null;
  myPercentile: number;
  totalUsers: number;
  isLoading: boolean;
  error: Error | null;
}
