/**
 * useActivityLog — Axiom
 *
 * CRUD operations for daily habit/activity entries in Firestore.
 */
import { useState, useCallback } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { calculateCo2 } from "../services/carbonEngine";
import { syncUserProgress } from "../services/progressEngine";
import { useCarbonStore } from "../store/carbonStore";
import type {
  ActivityEntry,
  ActivityCategory,
  ActivitySource,
  CarbonBreakdown,
  DailyScore,
} from "../types/carbon";

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBreakdown(
  breakdown?: Partial<CarbonBreakdown>
): CarbonBreakdown {
  return {
    transport: Number.isFinite(breakdown?.transport) ? Number(breakdown?.transport) : 0,
    food: Number.isFinite(breakdown?.food) ? Number(breakdown?.food) : 0,
    energy: Number.isFinite(breakdown?.energy) ? Number(breakdown?.energy) : 0,
    shopping: Number.isFinite(breakdown?.shopping) ? Number(breakdown?.shopping) : 0,
  };
}

function calculateActivityXp(co2Kg: number): number {
  const baseXp = 10;
  const lowImpactBonus = co2Kg <= 1 ? 5 : co2Kg <= 3 ? 2 : 0;
  return baseXp + lowImpactBonus;
}

export function useActivityLog(userId: string | undefined) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addEmission = useCarbonStore((s) => s.addEmission);

  /**
   * Fetch activities for a specific date.
   */
  const fetchActivities = useCallback(
    async (date: string) => {
      if (!userId) return;
      setIsLoading(true);

      try {
        const ref = collection(db, "users", userId, "activities");
        const q = query(ref, where("date", "==", date), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const entries: ActivityEntry[] = [];
        snap.forEach((d) => entries.push({ id: d.id, ...d.data() } as ActivityEntry));
        setActivities(entries);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  /**
   * Add a new activity entry.
   */
  const addActivity = useCallback(
    async (
      category: ActivityCategory,
      subType: string,
      value: number,
      source: ActivitySource = "manual",
      extras?: {
        photoUrl?: string;
        aiAnalysis?: string;
        co2KgOverride?: number;
        dateOverride?: string;
      }
    ) => {
      if (!userId) return null;

      const co2Override = extras?.co2KgOverride;
      const co2Kg = Number.isFinite(co2Override)
        ? co2Override
        : calculateCo2(category, subType, value);
      const date = extras?.dateOverride ?? toLocalDateString(new Date());

      const ref = collection(db, "users", userId, "activities");
      const docRef = doc(ref);
      const entry: ActivityEntry = {
        id: docRef.id,
        userId,
        date,
        category,
        subType,
        value,
        co2Kg,
        source,
        createdAt: Timestamp.now(),
        ...(extras?.photoUrl ? { photoUrl: extras.photoUrl } : {}),
        ...(extras?.aiAnalysis ? { aiAnalysis: extras.aiAnalysis } : {}),
      };

      try {
        // Write activity + update daily score in one transaction
        const scoreRef = doc(db, "users", userId, "dailyScores", date);
        const activityXp = calculateActivityXp(co2Kg);
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(scoreRef);
          const data = (snap.exists() ? (snap.data() as DailyScore) : null) ?? null;

          const currentBreakdown = normalizeBreakdown(data?.breakdown);
          const nextBreakdown = {
            ...currentBreakdown,
            [category]: (currentBreakdown[category] ?? 0) + co2Kg,
          };
          const currentTotal = data?.totalCo2Kg ?? 0;
          const nextTotal = Math.round((currentTotal + co2Kg) * 100) / 100;
          const xpEarned = (data?.xpEarned ?? 0) + activityXp;
          const nextDailyScore: DailyScore = {
            date,
            totalCo2Kg: nextTotal,
            breakdown: nextBreakdown,
            xpEarned,
            updatedAt: Date.now(),
            ...(data?.aiInsight ? { aiInsight: data.aiInsight } : {}),
            ...(data?.biggestMistake ? { biggestMistake: data.biggestMistake } : {}),
            ...(data?.suggestions ? { suggestions: data.suggestions } : {}),
          };

          tx.set(scoreRef, nextDailyScore);
          tx.set(docRef, entry);
        });

        // Update local store
        addEmission(category, co2Kg);

        setActivities((prev) => [entry, ...prev]);
        await syncUserProgress(userId);

        return entry;
      } catch (error) {
        console.error("Error adding activity:", error);
        return null;
      }
    },
    [userId, addEmission]
  );

  /**
   * Delete an activity entry.
   */
  const deleteActivity = useCallback(
    async (activityId: string) => {
      if (!userId) return;

      try {
        const activityRef = doc(db, "users", userId, "activities", activityId);
        await runTransaction(db, async (tx) => {
          const activitySnap = await tx.get(activityRef);
          if (!activitySnap.exists()) return;

          const activity = activitySnap.data() as ActivityEntry;
          const scoreRef = doc(db, "users", userId, "dailyScores", activity.date);
          const scoreSnap = await tx.get(scoreRef);

          if (scoreSnap.exists()) {
            const currentScore = scoreSnap.data() as DailyScore;
            const currentBreakdown = normalizeBreakdown(currentScore.breakdown);
            const deductedCategoryValue = Math.max(
              0,
              (currentBreakdown[activity.category] ?? 0) - activity.co2Kg
            );
            const nextBreakdown: CarbonBreakdown = {
              ...currentBreakdown,
              [activity.category]: Math.round(deductedCategoryValue * 100) / 100,
            };
            const nextTotal = Math.max(
              0,
              Math.round(((currentScore.totalCo2Kg ?? 0) - activity.co2Kg) * 100) / 100
            );
            const xpPenalty = calculateActivityXp(activity.co2Kg);
            const nextXpEarned = Math.max(0, (currentScore.xpEarned ?? 0) - xpPenalty);

            const nextDailyScore: DailyScore = {
              date: activity.date,
              totalCo2Kg: nextTotal,
              breakdown: nextBreakdown,
              xpEarned: nextXpEarned,
              updatedAt: Date.now(),
              ...(currentScore.aiInsight ? { aiInsight: currentScore.aiInsight } : {}),
              ...(currentScore.biggestMistake
                ? { biggestMistake: currentScore.biggestMistake }
                : {}),
              ...(currentScore.suggestions ? { suggestions: currentScore.suggestions } : {}),
            };
            tx.set(scoreRef, nextDailyScore);
          }

          tx.delete(activityRef);
        });
        setActivities((prev) => prev.filter((a) => a.id !== activityId));
        await syncUserProgress(userId);
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    },
    [userId]
  );

  return { activities, isLoading, fetchActivities, addActivity, deleteActivity };
}
