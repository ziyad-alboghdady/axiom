import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { C } from "../constants/colors";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface EmissionBarProps {
  label: string;
  Icon?: IconComponent;
  value: number;
  maxValue: number;
  color?: string;
}

export function EmissionBar({ label, Icon, value, maxValue, color = C.bgAlt }: EmissionBarProps) {
  const pct     = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 800,
      delay: 150,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.labelWrap}>
          {Icon && <Icon size={18} color={color} strokeWidth={2} />}
          <Text style={styles.labelTxt}>{label}</Text>
        </View>
        <Text style={[styles.valueTxt, { color }]}>{value.toFixed(1)} kg</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelTxt: {
    color: C.text,
    fontSize: 14,
    fontWeight: "500",
  },
  valueTxt: {
    fontSize: 13,
    fontWeight: "700",
  },
  track: {
    height: 8,
    backgroundColor: "rgba(230,194,122,0.15)",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
