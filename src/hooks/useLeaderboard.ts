import { useEffect, useState, useRef } from "react";
import {
  collection, onSnapshot, orderBy, query, limit,
} from "firebase/firestore";
import { db, getRecentDailyScores } from "../services/firebase";
import {
  seedLeaderboardIfEmpty,
  updateLeaderboardEntry,
  calcWeeklyCo2,
} from "../services/leaderboard";
import type { LeaderboardEntry, RankedEntry, LeaderboardState } from "../types/leaderboard";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserProfile {
  displayName?: string | null;
  city?: string | null;
  country?: string | null;
  level?: number;
  levelName?: string;
  totalXp?: number;
  streakDays?: number;
  badgeCount?: number;
}

export function useLeaderboard(
  currentUserId: string,
  userProfile?: UserProfile,
  scope: "friends" | "city" | "country" = "country"
): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    myEntry: null,
    myPercentile: 0,
    totalUsers: 0,
    isLoading: true,
    error: null,
  });

  const seeded = useRef(false);

  // Upsert the current user's leaderboard entry with their real weekly CO₂
  const syncCurrentUser = async () => {
    if (!currentUserId) return;
    try {
      const scores = await getRecentDailyScores(currentUserId, 7);
      const weeklyCo2Kg = calcWeeklyCo2(scores);
      const displayName = userProfile?.displayName ?? "You";
      await updateLeaderboardEntry(currentUserId, {
        userId: currentUserId,
        displayName,
        avatarInitials: getInitials(displayName),
        city: userProfile?.city ?? "My City",
        country: userProfile?.country ?? "Turkey", // Default demo country
        isFriend: false, // current user is not their own friend in demo terms, or doesn't matter
        weeklyCo2Kg,
        totalXp: userProfile?.totalXp ?? 0,
        level: userProfile?.level ?? 1,
        levelName: userProfile?.levelName ?? "Earth Learner",
        streakDays: userProfile?.streakDays ?? 0,
        badgeCount: userProfile?.badgeCount ?? 0,
      });
    } catch (err) {
      console.warn("[useLeaderboard] syncCurrentUser failed:", err);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("weeklyCo2Kg", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        // Seed demo data if collection is empty (first visit ever)
        if (snap.empty && !seeded.current) {
          seeded.current = true;
          await seedLeaderboardIfEmpty();
          await syncCurrentUser();
          return; // onSnapshot will fire again after seed
        }

        // On first non-empty snapshot, also sync current user (adds/refreshes their entry)
        if (!seeded.current && currentUserId) {
          seeded.current = true;
          seedLeaderboardIfEmpty().then(() => syncCurrentUser()); // force update demo users then sync
        }

        let raw: LeaderboardEntry[] = snap.docs.map((d) => ({
          userId: d.id,
          ...(d.data() as Omit<LeaderboardEntry, "userId">),
        }));

        if (scope === "friends") {
          raw = raw.filter(e => e.isFriend || e.userId === currentUserId);
        } else if (scope === "city") {
          const myCity = userProfile?.city ?? "Istanbul";
          raw = raw.filter(e => e.city === myCity || e.userId === currentUserId);
        } else {
          const myCountry = userProfile?.country ?? "Turkey";
          raw = raw.filter(e => e.country === myCountry || e.userId === currentUserId);
        }

        const total = raw.length;
        const ranked: RankedEntry[] = raw.map((entry, idx) => ({
          ...entry,
          rank: idx + 1,
          delta: 0,
          isCurrentUser: entry.userId === currentUserId,
        }));

        const myEntry = ranked.find((e) => e.isCurrentUser) ?? null;
        const myRank = myEntry?.rank ?? total;
        const percentile =
          total > 1
            ? Math.round(((total - myRank) / (total - 1)) * 100)
            : 50;

        setState({
          entries: ranked,
          myEntry,
          myPercentile: percentile,
          totalUsers: total,
          isLoading: false,
          error: null,
        });
      },
      (err) => {
        console.error("[useLeaderboard] snapshot error:", err);
        setState((prev) => ({ ...prev, isLoading: false, error: err }));
      }
    );

    return () => unsub();
  }, [currentUserId, scope, userProfile?.city, userProfile?.country]);

  return state;
}
