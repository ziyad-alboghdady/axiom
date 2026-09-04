import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getLevelForXp, xpToNextLevel } from "../constants/levels";
import type { DailyScore } from "../types/carbon";
import type { UserProgress } from "../types/gamification";

type ProgressDailyScore = Pick<DailyScore, "date" | "totalCo2Kg" | "xpEarned">;

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateString(dateString: string, deltaDays: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return toLocalDateString(date);
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function calculateLongestStreak(sortedDatesAsc: string[]): number {
  if (sortedDatesAsc.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDatesAsc.length; i++) {
    const expected = shiftDateString(sortedDatesAsc[i - 1], 1);
    if (sortedDatesAsc[i] === expected) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

function calculateCurrentStreak(dateSet: Set<string>, today: string): { streakDays: number; lastActiveDate: string } {
  const yesterday = shiftDateString(today, -1);
  const startDate = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : "";
  if (!startDate) return { streakDays: 0, lastActiveDate: "" };

  let streakDays = 0;
  let cursor = startDate;
  while (dateSet.has(cursor)) {
    streakDays += 1;
    cursor = shiftDateString(cursor, -1);
  }
  return { streakDays, lastActiveDate: startDate };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

async function fetchProgressDailyScores(userId: string): Promise<ProgressDailyScore[]> {
  const ref = collection(db, "users", userId, "dailyScores");
  const q = query(ref, orderBy("date", "desc"), limit(365));
  const snap = await getDocs(q);

  const scores: ProgressDailyScore[] = [];
  snap.forEach((d) => {
    const raw = d.data() as Partial<DailyScore>;
    const date = typeof raw.date === "string" && isValidDateString(raw.date) ? raw.date : d.id;
    if (!isValidDateString(date)) return;
    scores.push({
      date,
      totalCo2Kg: Number.isFinite(raw.totalCo2Kg) ? Number(raw.totalCo2Kg) : 0,
      xpEarned: Number.isFinite(raw.xpEarned) ? Number(raw.xpEarned) : 0,
    });
  });

  return scores;
}

export async function syncUserProgress(userId: string): Promise<UserProgress> {
  const today = toLocalDateString(new Date());
  const weekStart = shiftDateString(today, -6);
  const monthStart = shiftDateString(today, -29);

  const progressRef = doc(db, "users", userId, "progress", "current");
  const [existingProgressSnap, scores] = await Promise.all([
    getDoc(progressRef),
    fetchProgressDailyScores(userId),
  ]);

  const existingProgress = existingProgressSnap.exists()
    ? (existingProgressSnap.data() as Partial<UserProgress>)
    : null;

  const dates = scores.map((s) => s.date);
  const dateSet = new Set(dates);
  const sortedAsc = [...dates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const lastActiveDate = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : "";

  const { streakDays, lastActiveDate: streakLastActiveDate } = calculateCurrentStreak(dateSet, today);
  const longestStreakDays = calculateLongestStreak(sortedAsc);

  const totalXp = scores.reduce((sum, s) => sum + s.xpEarned, 0);
  const levelDef = getLevelForXp(totalXp);

  const weeklyScores = scores.filter((s) => s.date >= weekStart);
  const monthlyScores = scores.filter((s) => s.date >= monthStart);

  const weeklyCo2Kg = round2(weeklyScores.reduce((sum, s) => sum + s.totalCo2Kg, 0));
  const monthlyCo2Kg = round2(monthlyScores.reduce((sum, s) => sum + s.totalCo2Kg, 0));
  const totalCo2Kg = round2(scores.reduce((sum, s) => sum + s.totalCo2Kg, 0));
  const avgDailyCo2Kg7d = round2(weeklyCo2Kg / 7);

  const nextProgress: UserProgress = {
    totalXp,
    level: levelDef.level,
    levelName: levelDef.name,
    xpToNextLevel: xpToNextLevel(totalXp),
    streakDays,
    longestStreakDays,
    lastActiveDate: streakLastActiveDate || lastActiveDate,
    badges: existingProgress?.badges ?? [],
    completedChallenges: existingProgress?.completedChallenges ?? [],
    stats: {
      activeDays: scores.length,
      daysWithLogsLast30: monthlyScores.length,
      totalCo2Kg,
      weeklyCo2Kg,
      monthlyCo2Kg,
      avgDailyCo2Kg7d,
    },
    leaderboardSnapshot: {
      weeklyCo2Kg,
      totalXp,
      level: levelDef.level,
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };

  await setDoc(progressRef, nextProgress);
  return nextProgress;
}

