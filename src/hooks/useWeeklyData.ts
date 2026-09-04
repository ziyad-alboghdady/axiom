/**
 * useWeeklyData — Axiom
 *
 * Fetches past 7 days of CO2 scores and seeds demo data if needed.
 */
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function seedWeeklyData(userId: string) {
  const today = new Date();
  const baseData = [
    { day: 6, value: 8.2, breakdown: { transport: 3, food: 2.5, energy: 1.2, shopping: 1.5 } },
    { day: 5, value: 7.5, breakdown: { transport: 2.5, food: 2, energy: 1.5, shopping: 1.5 } },
    { day: 4, value: 9.1, breakdown: { transport: 4, food: 2.5, energy: 1.2, shopping: 1.4 } },
    { day: 3, value: 6.8, breakdown: { transport: 2, food: 1.8, energy: 1.5, shopping: 1.5 } },
    { day: 2, value: 10.2, breakdown: { transport: 5, food: 2.5, energy: 1.2, shopping: 1.5 } },
    { day: 1, value: 7.9, breakdown: { transport: 3, food: 2, energy: 1.4, shopping: 1.5 } },
    { day: 0, value: 8.5, breakdown: { transport: 3.5, food: 2.5, energy: 1.2, shopping: 1.3 } },
  ];

  baseData.forEach(async ({ day, value, breakdown }) => {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = toLocalDateString(date);

    const scoreRef = doc(db, "users", userId, "dailyScores", dateStr);
    await setDoc(scoreRef, {
      date: dateStr,
      totalCo2Kg: value,
      breakdown,
      xpEarned: Math.round(value * 10),
      updatedAt: Timestamp.now().toMillis(),
    }, { merge: true });
  });
}

export function useWeeklyData(userId: string | undefined) {
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);

        const weekAgoStr = toLocalDateString(weekAgo);

        const scoresRef = collection(db, "users", userId, "dailyScores");
        const q = query(
          scoresRef,
          where("date", ">=", weekAgoStr),
          orderBy("date", "asc")
        );

        const snap = await getDocs(q);
        const dailyScores: Record<string, number> = {};

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          dailyScores[data.date] = data.totalCo2Kg;
        });

        // Build array for past 7 days
        const data: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = toLocalDateString(date);
          data.push(dailyScores[dateStr] ?? 0);
        }

        // If all zeros, seed data
        if (data.every(v => v === 0)) {
          await seedWeeklyData(userId);
          // Fetch again
          const snap2 = await getDocs(q);
          const dailyScores2: Record<string, number> = {};
          snap2.forEach((docSnap) => {
            const data = docSnap.data();
            dailyScores2[data.date] = data.totalCo2Kg;
          });
          const data2: number[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = toLocalDateString(date);
            data2.push(dailyScores2[dateStr] ?? 0);
          }
          setWeeklyData(data2);
        } else {
          setWeeklyData(data);
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error);
        setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userId]);

  return { weeklyData, loading };
}
