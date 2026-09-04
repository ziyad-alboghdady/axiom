import { useMemo, useState } from "react";
import { calculateXpReward, simulateChange } from "../services/carbonEngine";
import type { ActivityCategory } from "../types/carbon";
import {
  DEFAULT_CONFIGS,
  type SimulatorConfig,
  type SimulatorResult,
} from "../types/simulator";

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

export function useSimulator() {
  const [category, setCategory] = useState<ActivityCategory>("transport");
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIGS.transport);

  const unitsPerWeek = useMemo(() => {
    if (category === "transport") {
      return (config.portionsOrDistance ?? 1) * config.valuePerWeek;
    }
    if (category === "food") {
      return config.valuePerWeek * (config.portionsOrDistance ?? 1);
    }
    return config.valuePerWeek;
  }, [category, config.portionsOrDistance, config.valuePerWeek]);

  const raw = useMemo(
    () =>
      simulateChange(
        category,
        config.fromSubType,
        config.toSubType,
        unitsPerWeek
      ),
    [category, config.fromSubType, config.toSubType, unitsPerWeek]
  );

  const result: SimulatorResult = useMemo(() => {
    const monthly = Math.max(0, raw.co2SavedMonthly);
    const yearly = Math.max(0, raw.co2SavedYearly);
    const xpPerMonth = calculateXpReward(monthly);

    // TODO: Dev C — implement getUserBaseline(userId) to calculate real reductionPct
    const currentMonthlyBaseline = monthly;
    const reductionPct =
      currentMonthlyBaseline > 0
        ? Math.round((monthly / currentMonthlyBaseline) * 100)
        : 0;

    return {
      co2SavedMonthly: roundOne(monthly),
      co2SavedYearly: roundOne(yearly),
      xpPerMonth,
      reductionPct,
    };
  }, [raw.co2SavedMonthly, raw.co2SavedYearly]);

  const isNegativeScenario = raw.co2SavedMonthly < 0;
  const isZeroState = result.co2SavedMonthly === 0 && result.co2SavedYearly === 0;

  function updateConfig(partial: Partial<SimulatorConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  function switchCategory(next: ActivityCategory) {
    setCategory(next);
    setConfig(DEFAULT_CONFIGS[next]);
  }

  return {
    category,
    config,
    result,
    isNegativeScenario,
    isZeroState,
    updateConfig,
    switchCategory,
  };
}
