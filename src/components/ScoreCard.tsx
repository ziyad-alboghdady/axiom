import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { C } from "../constants/colors";

interface ScoreCardProps {
  totalCo2Kg: number;
  label?: string;
}

export function ScoreCard({ totalCo2Kg, label = "Today's Carbon" }: ScoreCardProps) {
  const level    = totalCo2Kg < 3 ? "low" : totalCo2Kg < 8 ? "medium" : "high";
  const color    = level === "low" ? C.mint : level === "medium" ? C.gold : C.coral;
  const statusTxt= level === "low" ? "Low impact" : level === "medium" ? "Moderate" : "High impact";
  const statusIcon=level === "low" ? "🌿" : level === "medium" ? "⚡" : "⚠";
  const pct      = Math.min((totalCo2Kg / 15) * 100, 100);

  const barAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(barAnim, { toValue: pct, duration: 900, delay: 200, useNativeDriver: false }),
    ]).start();
  }, [totalCo2Kg]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNum, { color }]}>{totalCo2Kg.toFixed(1)}</Text>
        <View style={styles.unitCol}>
          <Text style={styles.unitKg}>kg</Text>
          <Text style={styles.unitCo2}>CO₂</Text>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: color }]} />
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.statusTxt, { color }]}>
          {statusTxt}
        </Text>
        <Text style={styles.statusIcon}>{statusIcon}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    color: C.textDarkMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
    gap: 6,
  },
  scoreNum: {
    fontSize: 58,
    fontWeight: "800",
    lineHeight: 58,
    letterSpacing: -2,
  },
  unitCol: {
    paddingBottom: 6,
    gap: 0,
  },
  unitKg: {
    color: C.textDarkMuted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 18,
  },
  unitCo2: {
    color: C.textDarkMuted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
  },
  track: {
    height: 7,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  fill: {
    height: 7,
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTxt: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  statusIcon: {
    fontSize: 14,
    marginLeft: 2,
  },
});
