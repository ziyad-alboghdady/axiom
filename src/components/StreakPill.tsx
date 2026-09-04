import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C, alpha } from "../constants/colors";
import { useI18n } from "../i18n";

interface Props {
  days: number;
}

export function StreakPill({ days }: Props) {
  const { tx } = useI18n();
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>🔥 {days}{tx("d", "g")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: alpha.gold15,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: alpha.gold25,
  },
  label: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "700",
  },
});
