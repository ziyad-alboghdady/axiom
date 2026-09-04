import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";

const LEVEL_CONFIG = {
  1: { bg: C.overlay,      text: C.textMuted,    emoji: "🌱" },
  2: { bg: C.card,         text: C.mint,         emoji: "🌿" },
  3: { bg: C.bgSecondary,  text: C.text,         emoji: "🌳" },
  4: { bg: C.bgAlt,        text: C.text,         emoji: "⚡" },
  5: { bg: C.gold,         text: C.overlay,      emoji: "🏆" },
} as const;

interface Props {
  level: number;
  name: string;
}

export function LevelBadge({ level, name }: Props) {
  const cfg = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={styles.emoji}>{cfg.emoji}</Text>
      <Text style={[styles.name, { color: cfg.text }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 10,
  },
  name: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
