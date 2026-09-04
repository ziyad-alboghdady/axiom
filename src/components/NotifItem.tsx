/**
 * NotifItem — Notification feed card
 */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { C } from "../constants/colors";

interface NotifItemProps {
  title: string;
  body: string;
  type: "insight" | "reminder" | "achievement" | "social";
  read: boolean;
  timeAgo: string;
  onPress?: () => void;
}

const TYPE_ICONS = { insight: "🤖", reminder: "⏰", achievement: "🏆", social: "👥" };

export function NotifItem({ title, body, type, read, timeAgo, onPress }: NotifItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: read ? C.card : C.overlay,
        borderRadius: 10, padding: 14, marginBottom: 8,
        borderLeftWidth: read ? 0 : 3, borderLeftColor: C.accent,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>{TYPE_ICONS[type]}</Text>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: "600", flex: 1 }}>{title}</Text>
        <Text style={{ color: C.textDim, fontSize: 11 }}>{timeAgo}</Text>
      </View>
      <Text style={{ color: C.textDim, fontSize: 13, lineHeight: 18 }}>{body}</Text>
    </TouchableOpacity>
  );
}
