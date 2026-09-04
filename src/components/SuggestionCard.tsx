import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";

interface SuggestionCardProps {
  suggestion: string;
  index?: number;
}

export function SuggestionCard({ suggestion, index = 0 }: SuggestionCardProps) {
  return (
    <View style={styles.card}>
      {/* Numbered badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeNum}>{index + 1}</Text>
      </View>

      <Text style={styles.text}>{suggestion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  badgeNum: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  text: {
    color: C.textDark,
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
    fontWeight: "400",
  },
});
