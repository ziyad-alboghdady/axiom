/**
 * useProgress — Axiom
 *
 * XP, levels, badges, and streak management.
 */
import { useCallback, useEffect } from "react";
import { useProgressStore } from "../store/progressStore";
import { xpToNextLevel } from "../constants/levels";
import { syncUserProgress } from "../services/progressEngine";

export function useProgress(userId: string | undefined) {
  const store = useProgressStore();

  /**
   * Recompute progress from daily scores and sync to Firestore.
   */
  useEffect(() => {
    if (!userId) return;

    const loadProgress = async () => {
      try {
        const progress = await syncUserProgress(userId);
        store.setProgress({
          totalXp: progress.totalXp,
          level: progress.level,
          levelName: progress.levelName,
          streakDays: progress.streakDays,
          lastActiveDate: progress.lastActiveDate,
          badges: progress.badges,
          completedChallenges: progress.completedChallenges,
        });
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, [userId]);

  /**
   * Kept for compatibility with existing callers.
   * The canonical XP source is dailyScores.xpEarned.
   */
  const awardXp = useCallback(
    async (_amount: number) => {
      if (!userId) return;
      try {
        const progress = await syncUserProgress(userId);
        store.setProgress({
          totalXp: progress.totalXp,
          level: progress.level,
          levelName: progress.levelName,
          streakDays: progress.streakDays,
          lastActiveDate: progress.lastActiveDate,
        });
      } catch (error) {
        console.error("Error syncing XP:", error);
      }
    },
    [userId]
  );

  /**
   * Kept for compatibility with existing callers.
   * Streak is derived automatically from dailyScores docs.
   */
  const checkInToday = useCallback(async () => {
    if (!userId) return;
    try {
      const progress = await syncUserProgress(userId);
      store.setProgress({
        streakDays: progress.streakDays,
        lastActiveDate: progress.lastActiveDate,
      });
    } catch (error) {
      console.error("Error syncing streak:", error);
    }
  }, [userId]);

  return {
    ...store,
    xpToNext: xpToNextLevel(store.totalXp),
    awardXp,
    checkInToday,
  };
}
