import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { C } from "../constants/colors";

interface XPRingProps {
  currentXp: number;
  xpForNextLevel: number;
  level: number;
  size?: number;
  /** "dark" = ring on dark bg card  |  "light" = ring on light surface card */
  variant?: "dark" | "light";
}

export function XPRing({
  currentXp,
  xpForNextLevel,
  level,
  size = 110,
  variant = "light",
}: XPRingProps) {
  const strokeWidth  = 9;
  const radius       = (size - strokeWidth) / 2;
  const circumference= 2 * Math.PI * radius;
  const progress     = xpForNextLevel > 0 ? Math.min(currentXp / (currentXp + xpForNextLevel), 1) : 1;

  // Animated stroke offset
  const animOffset = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    Animated.timing(animOffset, {
      toValue: circumference * (1 - progress),
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [currentXp, xpForNextLevel]);

  const isLight   = variant === "light";
  const trackColor= isLight ? C.border      : C.overlay;
  const labelColor= isLight ? C.textDark    : C.text;
  const mutedColor= isLight ? C.textDarkMuted : C.textMuted;

  // Animated.createAnimatedComponent for the SVG Circle
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track ring */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={trackColor} strokeWidth={strokeWidth} fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={C.gold} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center text */}
      <Text style={[styles.levelTxt, { color: C.gold, fontSize: size * 0.22 }]}>
        Lv{level}
      </Text>
      <Text style={[styles.xpTxt, { color: mutedColor, fontSize: size * 0.11 }]}>
        {currentXp} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelTxt: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  xpTxt: {
    fontWeight: "600",
    marginTop: 2,
  },
});
