import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";

interface AvatarCircleProps {
  initials: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function AvatarCircle({
  initials,
  size = 40,
  backgroundColor = C.bg,
  textColor = C.gold,
}: AvatarCircleProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={{
          color: textColor,
          fontSize: size * 0.38,
          fontWeight: "800",
          letterSpacing: -0.5,
        }}
      >
        {initials.toUpperCase().slice(0, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
