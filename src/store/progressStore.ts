/**
 * Progress Store — Axiom
 *
 * Zustand store for XP, level, streak, and badges.
 */
import { create } from "zustand";
import { getLevelForXp, xpToNextLevel } from "../constants/levels";

interface ProgressState {
  totalXp: number;
  level: number;
  levelName: string;
  streakDays: number;
  lastActiveDate: string;
  badges: string[];
  completedChallenges: string[];

  addXp: (amount: number) => void;
  updateStreak: (date: string) => void;
  addBadge: (badgeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  setProgress: (progress: Partial<ProgressState>) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  totalXp: 0,
  level: 1,
  levelName: "Beginner",
  streakDays: 0,
  lastActiveDate: "",
  badges: [],
  completedChallenges: [],

  addXp: (amount) =>
    set((state) => {
      const newXp = state.totalXp + amount;
      const levelDef = getLevelForXp(newXp);
      return {
        totalXp: newXp,
        level: levelDef.level,
        levelName: levelDef.name,
      };
    }),

  updateStreak: (date) =>
    set((state) => {
      const lastDate = state.lastActiveDate;
      if (!lastDate) {
        return { streakDays: 1, lastActiveDate: date };
      }

      // Check if the date is consecutive
      const last = new Date(lastDate);
      const current = new Date(date);
      const diffMs = current.getTime() - last.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        return {
          streakDays: state.streakDays + 1,
          lastActiveDate: date,
        };
      } else if (diffDays === 0) {
        // Same day — no change
        return {};
      } else {
        // Streak broken
        return { streakDays: 1, lastActiveDate: date };
      }
    }),

  addBadge: (badgeId) =>
    set((state) => {
      if (state.badges.includes(badgeId)) return {};
      return { badges: [...state.badges, badgeId] };
    }),

  completeChallenge: (challengeId) =>
    set((state) => {
      if (state.completedChallenges.includes(challengeId)) return {};
      return {
        completedChallenges: [...state.completedChallenges, challengeId],
      };
    }),

  setProgress: (progress) => set(progress),
}));
