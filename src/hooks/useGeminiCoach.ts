import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { buildCoachPrompt, callGemini } from "../services/gemini";
import {
  db,
  getDailyScore,
  getRecentDailyScores,
  getTodayActivities,
  saveDailyScore,
} from "../services/firebase";
import type {
  CoachInputPayload,
  GeminiCoachResponse,
} from "../types/gemini";
import type { ActivityEntry, CarbonBreakdown, DailyScore } from "../types/carbon";
import type { UserProfile } from "../types/user";

const CITY_AVG_DAILY_CO2_KG: Record<string, number> = {
  istanbul: 10.2,
  london: 9.4,
  berlin: 8.3,
  paris: 8.1,
};

const EMPTY_BREAKDOWN: CarbonBreakdown = {
  transport: 0,
  food: 0,
  energy: 0,
  shopping: 0,
};

const STATIC_FALLBACK: GeminiCoachResponse = {
  biggestMistake: "Log your activities to get personalised coaching.",
  suggestions: [
    "Walk or cycle for trips under 3 km — saves ~0.6 kg CO2 per trip.",
    "Replace one meat meal with a vegetarian option — saves ~1.5 kg CO2.",
    "Turn off standby devices overnight — saves ~0.3 kg CO2 per night.",
  ],
  yearlyForecast: "Start logging your habits to see your yearly carbon forecast.",
  co2SavedIfFixed: 0,
};

function getTodayLocalString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeParseCoachInsight(raw: string | undefined): GeminiCoachResponse | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GeminiCoachResponse;
    if (isValidCoachResponse(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function sanitizeGeminiText(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

function isValidCoachResponse(value: unknown): value is GeminiCoachResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as GeminiCoachResponse;
  if (typeof candidate.biggestMistake !== "string" || !candidate.biggestMistake.trim()) {
    return false;
  }
  if (!Array.isArray(candidate.suggestions) || candidate.suggestions.length !== 3) {
    return false;
  }
  const hasNumericContext = /\d+(\.\d+)?\s*(kg|%)/i;
  if (!candidate.suggestions.every((s) => typeof s === "string" && hasNumericContext.test(s))) {
    return false;
  }
  if (typeof candidate.yearlyForecast !== "string" || !candidate.yearlyForecast.trim()) {
    return false;
  }
  if (typeof candidate.co2SavedIfFixed !== "number" || !Number.isFinite(candidate.co2SavedIfFixed)) {
    return false;
  }
  return true;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("GEMINI_TIMEOUT"));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function normalizeBreakdown(breakdown?: Partial<CarbonBreakdown>): CarbonBreakdown {
  return {
    transport: Number.isFinite(breakdown?.transport) ? Number(breakdown?.transport) : 0,
    food: Number.isFinite(breakdown?.food) ? Number(breakdown?.food) : 0,
    energy: Number.isFinite(breakdown?.energy) ? Number(breakdown?.energy) : 0,
    shopping: Number.isFinite(breakdown?.shopping) ? Number(breakdown?.shopping) : 0,
  };
}

function getTopCategory(breakdown: CarbonBreakdown): keyof CarbonBreakdown {
  const pairs = Object.entries(breakdown) as Array<[keyof CarbonBreakdown, number]>;
  pairs.sort((a, b) => b[1] - a[1]);
  return pairs[0]?.[0] ?? "transport";
}

function sumDailyScores(scores: DailyScore[]): number {
  return Math.round(scores.reduce((sum, s) => sum + (s.totalCo2Kg ?? 0), 0) * 100) / 100;
}

function calcTrendVsLastWeek(thisWeekTotal: number, lastWeekTotal: number): number {
  if (lastWeekTotal <= 0) return 0;
  return Number(((thisWeekTotal - lastWeekTotal) / lastWeekTotal).toFixed(4));
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
}

async function buildPayload(
  userId: string,
  date: string,
  activities: ActivityEntry[],
  todayScore: DailyScore | null
): Promise<CoachInputPayload> {
  const [profile, recentScores] = await Promise.all([
    fetchUserProfile(userId),
    getRecentDailyScores(userId, 14),
  ]);

  const thisWeek = recentScores.slice(0, 7);
  const lastWeek = recentScores.slice(7, 14);
  const thisWeekTotal = sumDailyScores(thisWeek);
  const lastWeekTotal = sumDailyScores(lastWeek);
  const avgDaily = thisWeek.length > 0 ? Number((thisWeekTotal / thisWeek.length).toFixed(2)) : 0;
  const breakdown = normalizeBreakdown(todayScore?.breakdown ?? EMPTY_BREAKDOWN);
  const cityName = profile?.city?.trim() ?? "";
  const cityAvg = CITY_AVG_DAILY_CO2_KG[cityName.toLowerCase()] ?? 10.2;

  return {
    user: {
      name: profile?.name ?? "there",
      dietType: profile?.dietType ?? "omnivore",
      commuteType: profile?.commuteType ?? "walking",
      city: cityName || "your city",
    },
    today: {
      date,
      totalCo2Kg: Number(todayScore?.totalCo2Kg ?? 0),
      breakdown,
      activities,
    },
    week: {
      avgDailyCo2Kg: avgDaily,
      totalCo2Kg: thisWeekTotal,
      trendVsLastWeek: calcTrendVsLastWeek(thisWeekTotal, lastWeekTotal),
      topCategory: getTopCategory(breakdown),
    },
    cityAvgDailyCo2Kg: cityAvg,
  };
}

function isLikelyOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("network request failed") || message.includes("offline");
}

async function getLatestCachedCoach(userId: string): Promise<GeminiCoachResponse | null> {
  const recentScores = await getRecentDailyScores(userId, 30);
  for (const score of recentScores) {
    const parsed = safeParseCoachInsight(score.aiInsight);
    if (parsed) return parsed;
  }
  return null;
}

export function useGeminiCoach(userId: string | undefined) {
  const today = getTodayLocalString();
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [noActivities, setNoActivities] = useState(false);
  const [source, setSource] = useState<
    "gemini_live" | "cache_today" | "cache_recent" | "fallback" | "no_activities" | "missing_api_key" | "manual_required"
  >("fallback");
  const [lastDebugError, setLastDebugError] = useState<string | null>(null);
  const [allowApiCall, setAllowApiCall] = useState(false);

  const query = useQuery({
    queryKey: ["axiom-coach", userId, today],
    queryFn: async (): Promise<GeminiCoachResponse> => {
      console.log("🔄 Starting AI Coach fetch...");
      setIsOfflineFallback(false);
      setNoActivities(false);
      setLastDebugError(null);

      if (!userId) {
        console.warn("⚠️ No userId provided");
        return STATIC_FALLBACK;
      }
      let cachedCoach: GeminiCoachResponse | null = null;

      try {
        const todayCachedScore = await getDailyScore(userId, today);
        cachedCoach = safeParseCoachInsight(todayCachedScore?.aiInsight);

        if (cachedCoach && query.dataUpdatedAt && Date.now() - query.dataUpdatedAt < 1000 * 60 * 5) {
          console.log("📦 Using cached coaching from today");
          setSource("cache_today");
          return cachedCoach;
        }

        const latestCachedCoach = await getLatestCachedCoach(userId);

        const activities = await getTodayActivities(userId, today);
        if (activities.length === 0) {
          console.warn("⚠️ No activities logged today");
          setNoActivities(true);
          setSource("no_activities");
          return STATIC_FALLBACK;
        }

        if (!allowApiCall) {
          console.log("⏸ API call requires manual trigger.");
          setSource("manual_required");
          return STATIC_FALLBACK;
        }

        console.log(`📊 Found ${activities.length} activities, building payload...`);
        const payload = await buildPayload(userId, today, activities, todayCachedScore);
        const prompt = buildCoachPrompt(payload);

        if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
          console.warn("❌ EXPO_PUBLIC_GEMINI_API_KEY is missing");
          setSource("missing_api_key");
          return STATIC_FALLBACK;
        }

        console.log("🚀 Calling Gemini API...");
        const apiResponse = await withTimeout(callGemini(prompt), 30000);
        const cleaned = sanitizeGeminiText(apiResponse);
        console.log("✅ Gemini API Response received:", cleaned);
        let parsed: unknown;

        try {
          parsed = JSON.parse(cleaned);
        } catch (parseError) {
          console.warn("⚠️ First JSON parse failed, retrying...");
          const retryResponse = await withTimeout(callGemini(prompt), 30000);
          console.log("✅ Gemini Retry Response:", retryResponse);
          parsed = JSON.parse(sanitizeGeminiText(retryResponse));
        }

        console.log("✅ Parsed coaching response:", parsed);

        if (!isValidCoachResponse(parsed)) {
          console.warn("⚠️ Response failed validation, using fallback");
          setSource("fallback");
          return STATIC_FALLBACK;
        }

        await saveDailyScore(userId, today, { aiInsight: JSON.stringify(parsed) });
        console.log("✅ Saved coaching insight to Firestore");
        setSource("gemini_live");
        return parsed;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.warn("❌ API Error:", errorMsg);
        console.warn("❌ Full error stack:", error);
        setLastDebugError(errorMsg);
        const latestCachedCoach = await getLatestCachedCoach(userId);
        if (isLikelyOfflineError(error) && cachedCoach) {
          setIsOfflineFallback(true);
          setSource("cache_today");
          return cachedCoach;
        }
        if (isLikelyOfflineError(error) && latestCachedCoach) {
          setIsOfflineFallback(true);
          setSource("cache_recent");
          return latestCachedCoach;
        }
        if (latestCachedCoach) {
          setSource("cache_recent");
          return latestCachedCoach;
        }
        setSource("fallback");
        return STATIC_FALLBACK;
      }
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  const generateCoach = () => {
    setAllowApiCall(true);
    setTimeout(() => query.refetch(), 0);
  };

  return {
    ...query,
    noActivities,
    isOfflineFallback,
    source,
    lastDebugError,
    generateCoach,
  };
}
