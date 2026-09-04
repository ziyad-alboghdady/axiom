import {
  doc, setDoc, serverTimestamp, getDocs,
  query, collection, limit, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { LeaderboardEntry } from "../types/leaderboard";
import type { DailyScore } from "../types/carbon";

export async function updateLeaderboardEntry(
  userId: string,
  data: Partial<LeaderboardEntry>
): Promise<void> {
  const ref = doc(db, "leaderboard", userId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function calcWeeklyCo2(dailyScores: DailyScore[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  return dailyScores
    .filter((s) => new Date(s.date) >= monday)
    .reduce((sum, s) => sum + s.totalCo2Kg, 0);
}


// ── Demo seed data ─────────────────────────────────────────────────────────────

const DEMO_USERS: Array<{ _id: string; displayName: string; avatarInitials: string; city: string; country: string; isFriend: boolean; weeklyCo2Kg: number; totalXp: number; level: number; levelName: string; streakDays: number; badgeCount: number }> = [
  { _id: "demo-1",  displayName: "Alex Chen",       avatarInitials: "AC", city: "Istanbul",     country: "Turkey", isFriend: true,  weeklyCo2Kg: 2.1,  totalXp: 3200, level: 5, levelName: "Eco Champion",    streakDays: 21, badgeCount: 7 },
  { _id: "demo-2",  displayName: "Maria Santos",    avatarInitials: "MS", city: "Lisbon",       country: "Portugal", isFriend: false, weeklyCo2Kg: 3.4,  totalXp: 2750, level: 4, levelName: "Forest Guardian", streakDays: 14, badgeCount: 5 },
  { _id: "demo-3",  displayName: "Luca Bianchi",    avatarInitials: "LB", city: "Milan",        country: "Italy",  isFriend: true,  weeklyCo2Kg: 4.8,  totalXp: 2100, level: 4, levelName: "Forest Guardian", streakDays: 9,  badgeCount: 4 },
  { _id: "demo-4",  displayName: "Yuki Tanaka",     avatarInitials: "YT", city: "Tokyo",        country: "Japan",  isFriend: false, weeklyCo2Kg: 5.2,  totalXp: 1900, level: 3, levelName: "Green Sprout",    streakDays: 7,  badgeCount: 3 },
  { _id: "demo-5",  displayName: "Priya Nair",      avatarInitials: "PN", city: "Mumbai",       country: "India",  isFriend: true,  weeklyCo2Kg: 6.7,  totalXp: 1650, level: 3, levelName: "Green Sprout",    streakDays: 5,  badgeCount: 3 },
  { _id: "demo-6",  displayName: "Tom Williams",    avatarInitials: "TW", city: "London",       country: "UK",     isFriend: false, weeklyCo2Kg: 8.3,  totalXp: 1400, level: 2, levelName: "Seedling",        streakDays: 4,  badgeCount: 2 },
  { _id: "demo-7",  displayName: "Sophie Müller",   avatarInitials: "SM", city: "Berlin",       country: "Germany", isFriend: false, weeklyCo2Kg: 9.1,  totalXp: 1200, level: 2, levelName: "Seedling",        streakDays: 3,  badgeCount: 2 },
  { _id: "demo-8",  displayName: "Omar Hassan",     avatarInitials: "OH", city: "Istanbul",     country: "Turkey", isFriend: true,  weeklyCo2Kg: 10.5, totalXp: 980,  level: 2, levelName: "Seedling",        streakDays: 2,  badgeCount: 1 },
  { _id: "demo-9",  displayName: "Emma Johnson",    avatarInitials: "EJ", city: "New York",     country: "USA",    isFriend: false, weeklyCo2Kg: 12.2, totalXp: 820,  level: 1, levelName: "Earth Learner",   streakDays: 1,  badgeCount: 1 },
  { _id: "demo-10", displayName: "Carlos Rivera",   avatarInitials: "CR", city: "Mexico City",  country: "Mexico", isFriend: true,  weeklyCo2Kg: 14.0, totalXp: 650,  level: 1, levelName: "Earth Learner",   streakDays: 0,  badgeCount: 0 },
  { _id: "demo-11", displayName: "Aisha Kamara",    avatarInitials: "AK", city: "Nairobi",      country: "Kenya",  isFriend: false, weeklyCo2Kg: 15.8, totalXp: 520,  level: 1, levelName: "Earth Learner",   streakDays: 0,  badgeCount: 0 },
  { _id: "demo-12", displayName: "Jake Patterson",  avatarInitials: "JP", city: "Sydney",       country: "Australia", isFriend: false, weeklyCo2Kg: 18.4, totalXp: 340,  level: 1, levelName: "Earth Learner",   streakDays: 0,  badgeCount: 0 },
  { _id: "demo-13", displayName: "Emre Yılmaz",     avatarInitials: "EY", city: "Istanbul",     country: "Turkey", isFriend: false, weeklyCo2Kg: 7.5,  totalXp: 1500, level: 3, levelName: "Green Sprout",    streakDays: 5,  badgeCount: 2 },
  { _id: "demo-14", displayName: "Zeynep Kaya",     avatarInitials: "ZK", city: "Istanbul",     country: "Turkey", isFriend: true,  weeklyCo2Kg: 11.2, totalXp: 950,  level: 2, levelName: "Seedling",        streakDays: 3,  badgeCount: 1 },
  { _id: "demo-15", displayName: "Can Demir",       avatarInitials: "CD", city: "Istanbul",     country: "Turkey", isFriend: false, weeklyCo2Kg: 16.5, totalXp: 480,  level: 1, levelName: "Earth Learner",   streakDays: 1,  badgeCount: 0 },
];

export async function seedLeaderboardIfEmpty(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const { _id, ...data } of DEMO_USERS) {
      batch.set(doc(db, "leaderboard", _id), {
        ...data,
        userId: _id,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    console.log("[leaderboard] Seeded demo users");
  } catch (err) {
    console.warn("[leaderboard] Seed failed:", err);
  }
}
