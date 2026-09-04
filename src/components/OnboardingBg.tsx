/**
 * OnboardingBg — Animated floating orb background for all onboarding screens.
 * Uses react-native-svg ellipses that drift continuously via Animated.loop.
 * Must be rendered with pointerEvents="none" (handled internally).
 */
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, Pattern, Rect } from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

interface OrbProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  speed: number;
  dx?: number;
  dy?: number;
  delay?: number;
}

function Orb({ cx, cy, rx, ry, fill, speed, dx = 20, dy = 15, delay = 0 }: OrbProps) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tx, { toValue: dx, duration: speed, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(tx, { toValue: -dx * 0.55, duration: speed * 1.3, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(tx, { toValue: 0, duration: speed * 0.7, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ty, { toValue: -dy, duration: speed * 1.15, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(ty, { toValue: dy * 0.65, duration: speed * 0.95, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(ty, { toValue: 0, duration: speed * 1.05, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: cx - rx,
        top: cy - ry,
        transform: [{ translateX: tx }, { translateY: ty }],
      }}
    >
      <Svg width={rx * 2} height={ry * 2}>
        <Ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={fill} />
      </Svg>
    </Animated.View>
  );
}

function DotGrid() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H}>
        <Defs>
          <Pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <Circle cx="1.5" cy="1.5" r="1.5" fill="rgba(245,240,232,0.028)" />
          </Pattern>
        </Defs>
        <Rect width={W} height={H} fill="url(#dots)" />
      </Svg>
    </View>
  );
}

export function OnboardingBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Subtle dot texture */}
      <DotGrid />

      {/* Large Forest Mid glow — top-right */}
      <Orb
        cx={W * 0.88} cy={H * 0.11}
        rx={240} ry={195}
        fill="rgba(29,122,84,0.22)"
        speed={14000} dx={28} dy={22}
      />

      {/* Forest Light glow — bottom-left */}
      <Orb
        cx={W * 0.1} cy={H * 0.74}
        rx={195} ry={160}
        fill="rgba(44,160,110,0.13)"
        speed={17500} dx={20} dy={26} delay={1200}
      />

      {/* Gold glow — centered behind logo zone */}
      <Orb
        cx={W * 0.5} cy={H * 0.3}
        rx={135} ry={108}
        fill="rgba(201,169,110,0.07)"
        speed={11000} dx={16} dy={14} delay={600}
      />

      {/* Abyss shadow — bottom-right (darkens bottom corner) */}
      <Orb
        cx={W * 0.9} cy={H * 0.9}
        rx={215} ry={175}
        fill="rgba(10,46,31,0.72)"
        speed={21000} dx={14} dy={12} delay={2200}
      />

      {/* Small Forest Light accent — top-left */}
      <Orb
        cx={W * 0.06} cy={H * 0.07}
        rx={95} ry={75}
        fill="rgba(44,160,110,0.1)"
        speed={9500} dx={12} dy={9} delay={400}
      />

      {/* Subtle Forest Mid — mid-right */}
      <Orb
        cx={W * 0.95} cy={H * 0.48}
        rx={110} ry={85}
        fill="rgba(29,122,84,0.1)"
        speed={13000} dx={10} dy={18} delay={900}
      />
    </View>
  );
}
