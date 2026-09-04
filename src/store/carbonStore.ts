/**
 * Carbon Store — Axiom
 *
 * Zustand store for today's carbon score and breakdown.
 */
import { create } from "zustand";
import type { CarbonBreakdown } from "../types/carbon";

interface CarbonState {
  todayScore: number;
  breakdown: CarbonBreakdown;
  weeklyTotal: number;
  lastUpdated: string | null;

  setScore: (score: number, breakdown: CarbonBreakdown) => void;
  addEmission: (category: keyof CarbonBreakdown, co2Kg: number) => void;
  setWeeklyTotal: (total: number) => void;
  resetDaily: () => void;
}

const emptyBreakdown: CarbonBreakdown = {
  transport: 0,
  food: 0,
  energy: 0,
  shopping: 0,
};

export const useCarbonStore = create<CarbonState>((set) => ({
  todayScore: 0,
  breakdown: { ...emptyBreakdown },
  weeklyTotal: 0,
  lastUpdated: null,

  setScore: (score, breakdown) =>
    set({
      todayScore: score,
      breakdown,
      lastUpdated: new Date().toISOString(),
    }),

  addEmission: (category, co2Kg) =>
    set((state) => {
      const newBreakdown = {
        ...state.breakdown,
        [category]: state.breakdown[category] + co2Kg,
      };
      const newTotal = Object.values(newBreakdown).reduce((a, b) => a + b, 0);
      return {
        breakdown: newBreakdown,
        todayScore: Math.round(newTotal * 100) / 100,
        lastUpdated: new Date().toISOString(),
      };
    }),

  setWeeklyTotal: (total) => set({ weeklyTotal: total }),

  resetDaily: () =>
    set({
      todayScore: 0,
      breakdown: { ...emptyBreakdown },
      lastUpdated: null,
    }),
}));
