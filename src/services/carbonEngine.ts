/**
 * Carbon Engine — Axiom
 *
 * On-device CO₂ calculations. No API calls needed.
 * Uses emission factors from constants/emissionFactors.ts.
 */
import {
  EMISSION_FACTORS,
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  ENERGY_FACTORS,
  SHOPPING_FACTORS,
} from "../constants/emissionFactors";
import type { ActivityCategory, EmissionLevel, SimulationResult } from "../types/carbon";

/**
 * Calculate CO₂ emissions for a single activity.
 *
 * @param category - "transport" | "food" | "energy" | "shopping"
 * @param subType  - e.g. "car", "beef", "electricity"
 * @param value    - quantity (km, portions, kWh, items)
 * @returns kg CO₂ emitted
 */
export function calculateCo2(
  category: ActivityCategory,
  subType: string,
  value: number
): number {
  const factors = EMISSION_FACTORS[category];
  if (!factors) {
    console.warn(`Unknown category: ${category}`);
    return 0;
  }

  const factor = factors[subType];
  if (factor === undefined) {
    console.warn(`Unknown subType "${subType}" in category "${category}"`);
    return 0;
  }

  return Math.round(factor * value * 1000) / 1000; // 3 decimal places
}

/**
 * Simulate switching from one habit to another.
 *
 * @param category     - Activity category
 * @param fromSubType  - Current habit (e.g. "car")
 * @param toSubType    - Proposed habit (e.g. "bus")
 * @param valuePerWeek - How many units per week
 * @returns Monthly and yearly CO₂ savings in kg
 */
export function simulateChange(
  category: ActivityCategory,
  fromSubType: string,
  toSubType: string,
  valuePerWeek: number
): SimulationResult {
  const fromCo2 = calculateCo2(category, fromSubType, valuePerWeek);
  const toCo2 = calculateCo2(category, toSubType, valuePerWeek);
  const weeklyDiff = fromCo2 - toCo2;

  return {
    co2SavedMonthly: Math.round(weeklyDiff * 4.33 * 100) / 100,
    co2SavedYearly: Math.round(weeklyDiff * 52 * 100) / 100,
  };
}

/**
 * XP reward based on monthly CO₂ savings.
 * 10 pts per 0.1 kg saved, capped at 500 pts.
 */
export function calculateXpReward(co2SavedMonthly: number): number {
  if (!Number.isFinite(co2SavedMonthly) || co2SavedMonthly <= 0) return 0;
  return Math.min(500, Math.round(co2SavedMonthly * 100));
}

/**
 * Classify a CO₂ value into an emission severity level.
 *
 * Thresholds (per activity):
 *   low:    < 1 kg
 *   medium: 1–5 kg
 *   high:   > 5 kg
 */
export function getEmissionLevel(co2Kg: number): EmissionLevel {
  if (co2Kg < 1) return "low";
  if (co2Kg <= 5) return "medium";
  return "high";
}

/**
 * Get all available sub-types for a category.
 */
export function getSubTypes(category: ActivityCategory): string[] {
  const factors = EMISSION_FACTORS[category];
  return factors ? Object.keys(factors) : [];
}

/**
 * Get the emission factor for a specific category + subType.
 */
export function getEmissionFactor(
  category: ActivityCategory,
  subType: string
): number | undefined {
  return EMISSION_FACTORS[category]?.[subType];
}
