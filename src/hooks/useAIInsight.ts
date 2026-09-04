/**
 * useAIInsight — Axiom
 *
 * Fetches AI coaching insights from Gemini based on today's activities.
 * Falls back to demo insights if API fails.
 */
import { useState, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { callGeminiWithConfig, parseGeminiJson } from "../services/gemini";
import { db } from "../services/firebase";
import type { CoachResponse } from "../types/gemini";
import type { DailyScore } from "../types/carbon";

const DEMO_INSIGHTS: Record<string, CoachResponse> = {
  low: {
    insight: "Fantastic day! Your emissions are 40% below average. You're leading by example.",
    biggestMistake: "Car trip to the store (0.8 kg CO₂)",
    suggestions: [
      "Consider a morning walk tomorrow — great for health and emissions.",
      "Meal prep on Sundays to reduce food-related shopping trips.",
    ],
    encouragement: "You're making a real difference. Keep pushing forward! 🌱",
    estimatedDailyCo2Kg: 5.2,
  },
  moderate: {
    insight: "Good effort today! You're on track with your carbon goals. Small optimizations can help.",
    biggestMistake: "Lunch delivery order (1.5 kg CO₂)",
    suggestions: [
      "Try one meatless meal this week — saves ~0.8 kg CO₂.",
      "Carpool with a colleague on your commute to cut transport emissions in half.",
    ],
    encouragement: "You're doing better than most. Keep building these sustainable habits! 💚",
    estimatedDailyCo2Kg: 8.5,
  },
  high: {
    insight: "Your emissions are higher than usual today. Let's identify quick wins for tomorrow.",
    biggestMistake: "Long car trip (4.2 kg CO₂)",
    suggestions: [
      "Use public transit or carpool next time — saves 60% emissions.",
      "Switch to plant-based meals for 3 days — saves ~2.4 kg CO₂ weekly.",
    ],
    encouragement: "Every action counts. Small changes compound into big impact. You got this! 🚀",
    estimatedDailyCo2Kg: 12.3,
  },
};

function getDemoInsight(dailyScore: DailyScore): CoachResponse {
  if (dailyScore.totalCo2Kg < 7) return DEMO_INSIGHTS.low;
  if (dailyScore.totalCo2Kg < 10) return DEMO_INSIGHTS.moderate;
  return DEMO_INSIGHTS.high;
}

export function useAIInsight(userId: string | undefined) {
  const [insight, setInsight] = useState<CoachResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async (dailyScore: DailyScore) => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `You are an AI carbon life coach. Analyze this person's daily carbon footprint and provide coaching.

Daily CO₂: ${dailyScore.totalCo2Kg} kg
Breakdown:
- Transport: ${dailyScore.breakdown.transport} kg
- Food: ${dailyScore.breakdown.food} kg
- Energy: ${dailyScore.breakdown.energy} kg
- Shopping: ${dailyScore.breakdown.shopping} kg

Respond in JSON format:
{
  "insight": "brief summary of their day",
  "biggestMistake": "their highest emission activity",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragement": "positive motivational message",
  "estimatedDailyCo2Kg": ${dailyScore.totalCo2Kg}
}
Return only valid JSON. No markdown, no extra text.`;

      const raw = await callGeminiWithConfig(prompt, {
        responseMimeType: "application/json",
      });
      const parsed = parseGeminiJson<CoachResponse>(raw);
      setInsight(parsed);

      if (userId) {
        const scoreRef = doc(db, "users", userId, "dailyScores", dailyScore.date);
        const nextDailyScore: DailyScore = {
          date: dailyScore.date,
          totalCo2Kg: dailyScore.totalCo2Kg,
          breakdown: dailyScore.breakdown,
          xpEarned: dailyScore.xpEarned,
          updatedAt: Date.now(),
          ...(parsed.insight ? { aiInsight: parsed.insight } : {}),
          ...(parsed.biggestMistake ? { biggestMistake: parsed.biggestMistake } : {}),
          ...(parsed.suggestions?.length ? { suggestions: parsed.suggestions } : {}),
        };
        await setDoc(scoreRef, nextDailyScore, { merge: true });
      }
    } catch (err) {
      console.warn("AI insight error:", err);
      // Fall back to demo insight on error
      const demoInsight = getDemoInsight(dailyScore);
      setInsight(demoInsight);
      setError(null); // Clear error since we have fallback
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { insight, isLoading, error, fetchInsight };
}
