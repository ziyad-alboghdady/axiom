/**
 * Co2Impact — tappable CO₂ equivalents widget.
 * Shows one relatable equivalent by default; tap to cycle through all.
 * Tap the expanded grid to collapse back.
 */
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { getCo2Equivalents } from "../utils/co2Equivalents";
import { C, alpha } from "../constants/colors";
import { useI18n } from "../i18n";

interface Props {
  kg: number;
  accentColor?: string;
}

export function Co2Impact({ kg, accentColor = C.gold }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { language, tx } = useI18n();
  const eqs = getCo2Equivalents(kg, language);

  if (eqs.length === 0) return null;

  if (!expanded) {
    const first = eqs[0];
    return (
      <TouchableOpacity
        onPress={() => setExpanded(true)}
        activeOpacity={0.75}
        style={[styles.chip, { borderColor: `${accentColor}35`, backgroundColor: `${accentColor}10` }]}
      >
        <Text style={styles.chipEmoji}>{first.emoji}</Text>
        <Text style={[styles.chipLabel, { color: accentColor }]}>{first.label}</Text>
        {eqs.length > 1 && (
          <Text style={[styles.more, { color: accentColor }]}>+{eqs.length - 1} {tx("more", "daha")} ›</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => setExpanded(false)} activeOpacity={0.9} style={styles.expanded}>
      <View style={styles.expandedHeader}>
        <Text style={styles.expandedTitle}>{tx("CO₂ EQUIVALENTS", "CO₂ KARŞILIKLARI")}</Text>
        <Text style={styles.collapseHint}>{tx("tap to close ›", "kapatmak için dokun ›")}</Text>
      </View>
      {eqs.map((eq, i) => (
        <View
          key={i}
          style={[
            styles.eqRow,
            i === 0 && { borderTopWidth: 0 },
          ]}
        >
          <Text style={styles.eqEmoji}>{eq.emoji}</Text>
          <Text style={styles.eqLabel}>{eq.label}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Collapsed chip
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start" as const,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 11, fontWeight: "700", flex: 1 },
  more: { fontSize: 10, fontWeight: "600", opacity: 0.75 },

  // Expanded grid
  expanded: {
    backgroundColor: C.overlay,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.gold25,
    overflow: "hidden" as const,
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(230,194,122,0.08)",
    borderBottomWidth: 1,
    borderBottomColor: alpha.gold15,
  },
  expandedTitle: {
    color: C.gold,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  collapseHint: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  eqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "rgba(168,196,180,0.08)",
  },
  eqEmoji: { fontSize: 16, width: 24, textAlign: "center" as const },
  eqLabel: { color: C.text, fontSize: 12, fontWeight: "500", flex: 1 },
});
