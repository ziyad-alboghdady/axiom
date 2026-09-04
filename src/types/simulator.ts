import type { ActivityCategory } from "./carbon";

export interface SimulatorConfig {
  fromSubType: string;
  toSubType: string;
  valuePerWeek: number;
  portionsOrDistance?: number;
}

export interface SimulatorResult {
  co2SavedMonthly: number;
  co2SavedYearly: number;
  xpPerMonth: number;
  reductionPct: number;
}

export const DEFAULT_CONFIGS: Record<ActivityCategory, SimulatorConfig> = {
  transport: { fromSubType: "car", toSubType: "walking", valuePerWeek: 3, portionsOrDistance: 3 },
  food: { fromSubType: "beef", toSubType: "lentils", valuePerWeek: 3, portionsOrDistance: 1 },
  energy: { fromSubType: "heating_gas", toSubType: "eco_mode", valuePerWeek: 7 },
  shopping: { fromSubType: "fast_fashion", toSubType: "secondhand", valuePerWeek: 1 },
};
