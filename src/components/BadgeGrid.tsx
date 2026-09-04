/**
 * BadgeGrid — Achievement badge display
 */
import React from "react";
import { View, Text } from "react-native";
import { C } from "../constants/colors";

interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

interface BadgeGridProps {
  badges: BadgeItem[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={{
            width: 80, alignItems: "center", padding: 10,
            backgroundColor: C.card, borderRadius: 12,
            opacity: badge.earned ? 1 : 0.4,
            borderWidth: badge.earned ? 1 : 0,
            borderColor: C.accent,
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 4 }}>{badge.icon}</Text>
          <Text style={{ color: C.text, fontSize: 10, textAlign: "center" }}>{badge.name}</Text>
        </View>
      ))}
    </View>
  );
}
