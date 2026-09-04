/**
 * Gemini-related types for Axiom.
 */
import type { ActivityEntry, CarbonBreakdown } from "./carbon";
import type { CommuteType, DietType } from "./user";

export interface CoachInputPayload {
  user: {
    name: string;
    dietType: DietType;
    commuteType: CommuteType;
    city: string;
  };
  today: {
    date: string;
    totalCo2Kg: number;
    breakdown: CarbonBreakdown;
    activities: ActivityEntry[];
  };
  week: {
    avgDailyCo2Kg: number;
    totalCo2Kg: number;
    trendVsLastWeek: number;
    topCategory: string;
  };
  cityAvgDailyCo2Kg: number;
}

export interface GeminiCoachResponse {
  biggestMistake: string;
  suggestions: string[];
  yearlyForecast: string;
  co2SavedIfFixed: number;
}

export interface GeminiForecastResponse {
  yearlyTotalKg: number;
  comparedToAvg: string;
  topChange: string;
  reductionIfFixed: number;
  narrative: string;
}

/** Legacy AI Coach response used by older screen/hook paths. */
export interface CoachResponse {
  insight: string;
  biggestMistake?: string;
  suggestions: string[];
  encouragement: string;
  estimatedDailyCo2Kg: number;
}

/** Food photo analysis via Gemini Vision. */
export interface FoodAnalysisResponse {
  foodItems: FoodItem[];
  totalCo2Kg: number;
  healthRating: "good" | "moderate" | "poor";
  suggestion: string;
}

export type FoodAnalysis = FoodAnalysisResponse;

export interface FoodItem {
  name: string;
  quantity: string;
  co2Kg: number;
}

/** Calendar event CO₂ analysis. */
export interface CalendarEventAnalysis {
  eventId: string;
  title: string;
  travelMode?: string;
  estimatedDistanceKm?: number;
  co2Kg: number;
  suggestion?: string;
}

/** Raw Gemini API response shape. */
export interface GeminiRawResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}
