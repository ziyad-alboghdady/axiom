/**
 * Carbon-related types for Axiom
 */
import { Timestamp } from "firebase/firestore";

/** Categories of carbon-emitting activities */
export type ActivityCategory = "transport" | "food" | "energy" | "shopping";

/** How the activity data was captured */
export type ActivitySource = "manual" | "photo" | "calendar" | "location";

/** Emission severity level */
export type EmissionLevel = "low" | "medium" | "high";

/**
 * A single logged activity entry.
 * Stored at: users/{userId}/activities/{activityId}
 */
export interface ActivityEntry {
  id: string;
  userId: string;
  /** Format: "YYYY-MM-DD" */
  date: string;
  category: ActivityCategory;
  /** e.g. "car", "bus", "beef", "heating", etc. */
  subType: string;
  /** km / meal count / kWh / items */
  value: number;
  /** Calculated from carbonEngine.ts (or AI estimate for photo scans) */
  co2Kg: number;
  source: ActivitySource;
  photoUrl?: string;
  aiAnalysis?: string;
  createdAt: Timestamp;
}

/**
 * Breakdown of CO₂ by category.
 */
export interface CarbonBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
}

/**
 * Daily aggregated score.
 * Stored at: users/{userId}/dailyScores/{YYYY-MM-DD}
 */
export interface DailyScore {
  date: string;
  totalCo2Kg: number;
  breakdown: CarbonBreakdown;
  xpEarned: number;
  aiInsight?: string;
  biggestMistake?: string;
  suggestions?: string[];
  updatedAt: number;
}

/**
 * Simulation result for what-if scenarios.
 */
export interface SimulationResult {
  co2SavedMonthly: number;
  co2SavedYearly: number;
}
