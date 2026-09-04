/**
 * Gamification types for Axiom
 */
import { Timestamp } from "firebase/firestore";

export type BadgeId =
  | "first_log"
  | "week_streak"
  | "month_streak"
  | "low_carbon_day"
  | "photo_scanner"
  | "calendar_hero"
  | "social_butterfly"
  | "green_hero";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Timestamp;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetCo2Reduction: number;
  durationDays: number;
  xpReward: number;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastActiveDate: string;
}

/**
 * User progress document.
 * Stored at: users/{userId}/progress/current
 */
export interface UserProgressStats {
  activeDays: number;
  daysWithLogsLast30: number;
  totalCo2Kg: number;
  weeklyCo2Kg: number;
  monthlyCo2Kg: number;
  avgDailyCo2Kg7d: number;
}

export interface UserProgressLeaderboardSnapshot {
  weeklyCo2Kg: number;
  totalXp: number;
  level: number;
  updatedAt: number;
}

export interface UserProgress {
  totalXp: number;
  /** 1–5 */
  level: number;
  levelName: string;
  xpToNextLevel: number;
  streakDays: number;
  longestStreakDays: number;
  /** Format: "YYYY-MM-DD" */
  lastActiveDate: string;
  badges: string[];
  completedChallenges: string[];
  stats: UserProgressStats;
  leaderboardSnapshot: UserProgressLeaderboardSnapshot;
  updatedAt: number;
}

/**
 * Leaderboard entry.
 * Stored at: leaderboard/{scope}/{userId}
 */
export type LeaderboardScope = "friends" | "campus" | "city";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarInitials: string;
  weeklyCo2Kg: number;
  totalXp: number;
  level: number;
  scope: LeaderboardScope;
  updatedAt: Timestamp;
}
