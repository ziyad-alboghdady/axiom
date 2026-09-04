/**
 * useCarbonScore — Axiom
 *
 * Fetches daily and weekly carbon scores from Firestore.
 */
import { useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useCarbonStore } from "../store/carbonStore";
import type { DailyScore, CarbonBreakdown } from "../types/carbon";

const EMPTY_BREAKDOWN: CarbonBreakdown = {
  transport: 0,
  food: 0,
  energy: 0,
  shopping: 0,
};

/**
 * Get today's date as YYYY-MM-DD string.
 */
function getTodayString(): string {
  return toLocalDateString(new Date());
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Hook to load and subscribe to the current user's carbon score.
 */
export function useCarbonScore(userId: string | undefined) {
  const { setScore, setWeeklyTotal, todayScore, breakdown, weeklyTotal } =
    useCarbonStore();

  useEffect(() => {
    if (!userId) return;

    const fetchTodayScore = async () => {
      try {
        const today = getTodayString();
        const scoreRef = doc(db, "users", userId, "dailyScores", today);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          const data = scoreSnap.data() as DailyScore;
          setScore(data.totalCo2Kg, data.breakdown);
        } else {
          setScore(0, EMPTY_BREAKDOWN);
        }
      } catch (error) {
        console.error("Error fetching today's score:", error);
      }
    };

    const fetchWeeklyTotal = async () => {
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = toLocalDateString(weekAgo);

        const scoresRef = collection(db, "users", userId, "dailyScores");
        const q = query(
          scoresRef,
          where("date", ">=", weekAgoStr),
          orderBy("date", "desc"),
          limit(7)
        );

        const snap = await getDocs(q);
        let total = 0;
        snap.forEach((doc) => {
          total += (doc.data() as DailyScore).totalCo2Kg;
        });

        setWeeklyTotal(Math.round(total * 100) / 100);
      } catch (error) {
        console.error("Error fetching weekly total:", error);
      }
    };

    fetchTodayScore();
    fetchWeeklyTotal();
  }, [userId]);

  return { todayScore, breakdown, weeklyTotal };
}
