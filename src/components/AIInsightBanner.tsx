import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../constants/colors";
import { useI18n } from "../i18n";

interface AIInsightBannerProps {
  insight: string;
  grade?: string;
}

export function AIInsightBanner({ insight, grade }: AIInsightBannerProps) {
  const { tx } = useI18n();
  return (
    <View style={styles.card}>
      {/* Gold left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badge}>
              <Text style={styles.badgeText}>{tx("🤖 AI Insight", "🤖 YZ İçgörüsü")}</Text>
          </View>
          {grade && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{grade}</Text>
            </View>
          )}
        </View>
        <Text style={styles.insightTxt}>{insight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    backgroundColor: C.gold,
    borderRadius: 2,
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  gradeBadge: {
    backgroundColor: C.bgAlt,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  gradeText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
  },
  insightTxt: {
    color: C.textDark,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
});
