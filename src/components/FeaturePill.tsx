import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";

interface FeaturePillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** "dark" = pill sits on dark bg  |  "light" = pill sits on light card */
  variant?: "dark" | "light";
}

export function FeaturePill({
  label,
  selected = false,
  onPress,
  variant = "dark",
}: FeaturePillProps) {
  const isDark = variant === "dark";

  const bg = selected
    ? C.bg
    : isDark
    ? "rgba(26,61,43,0.7)"
    : C.surfaceMuted;

  const border = selected
    ? C.gold
    : isDark
    ? "rgba(168,196,180,0.2)"
    : C.border;

  const textColor = selected
    ? C.gold
    : isDark
    ? C.textMuted
    : C.textDarkMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1.5,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontWeight: selected ? "700" : "500" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
