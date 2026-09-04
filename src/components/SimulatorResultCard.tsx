import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";
import type { SimulatorResult } from "../types/simulator";
import { useI18n } from "../i18n";

interface SimulatorResultCardProps {
  result: SimulatorResult;
  isZeroState?: boolean;
}

interface ResultRowProps {
  label: string;
  value: string;
  valueColor: string;
  muted?: boolean;
}

function ResultRow({ label, value, valueColor, muted = false }: ResultRowProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, muted && styles.labelMuted]}>{label}</Text>
      <Text style={[styles.value, { color: muted ? C.textMuted : valueColor }]}>{value}</Text>
    </View>
  );
}

export function SimulatorResultCard({ result, isZeroState = false }: SimulatorResultCardProps) {
  const { tx } = useI18n();
  return (
    <View
      style={[
        styles.card,
        isZeroState ? styles.cardZero : styles.cardActive,
      ]}
    >
      <ResultRow
        label={tx("CO2 saved / month", "CO2 tasarrufu / ay")}
        value={`${result.co2SavedMonthly.toFixed(1)} kg`}
        valueColor={C.success}
        muted={isZeroState}
      />
      <ResultRow
        label={tx("CO2 saved / year", "CO2 tasarrufu / yıl")}
        value={`${result.co2SavedYearly.toFixed(1)} kg`}
        valueColor={C.success}
        muted={isZeroState}
      />
      <ResultRow
        label={tx("XP earned / month", "Kazanılan XP / ay")}
        value={`+${result.xpPerMonth} ${tx("pts", "puan")}`}
        valueColor={C.accent}
        muted={isZeroState}
      />
      <ResultRow
        label={tx("Footprint reduced", "Ayak izi azaltımı")}
        value={`-${result.reductionPct}%`}
        valueColor={C.success}
        muted={isZeroState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  cardActive: {
    borderColor: C.success,
  },
  cardZero: {
    borderColor: C.textDim,
    borderStyle: "dashed",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  label: {
    color: C.textDim,
    fontSize: 13,
    fontWeight: "500",
  },
  labelMuted: {
    opacity: 0.8,
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
  },
});
