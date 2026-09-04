import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { C, alpha } from "../constants/colors";
import type { RankedEntry } from "../types/leaderboard";
import { useI18n } from "../i18n";

interface Props {
  myPercentile: number;
  totalUsers: number;
  weekLabel: string;
  myEntry: RankedEntry | null;
}

export function LeaderboardHero({ myPercentile, totalUsers, weekLabel, myEntry }: Props) {
  const { tx } = useI18n();
  const [displayPct, setDisplayPct] = useState(0);
  const countAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  useEffect(() => {
    countAnim.setValue(0);
    const listenerId = countAnim.addListener(({ value }) =>
      setDisplayPct(Math.round(value))
    );
    Animated.timing(countAnim, {
      toValue: myPercentile,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => countAnim.removeListener(listenerId);
  }, [myPercentile]);

  const hasEntry = myEntry !== null;

  return (
    <Animated.View
      style={[
        styles.hero,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>{tx("LEADERBOARD", "LİDERLİK TABLOSU")}</Text>
          <Text style={styles.weekText}>{weekLabel}</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{tx("LIVE", "CANLI")}</Text>
        </View>
      </View>

      {/* Percentile block */}
      <View style={styles.percentileBlock}>
        {hasEntry ? (
          <>
            <Text style={styles.beatLabel}>{tx("You beat", "Geçtiğin oran")}</Text>
            <Text style={styles.percentileNum}>{displayPct}%</Text>
            <Text style={styles.beatSuffix}>{tx(`of all ${totalUsers} users this week`, `bu hafta ${totalUsers} kullanıcının içinde`)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.beatLabel}>🌍</Text>
            <Text style={styles.noEntryNum}>{totalUsers}</Text>
              <Text style={styles.beatSuffix}>{totalUsers === 1 ? tx("user competing", "yarışan kullanıcı") : tx("users competing", "yarışan kullanıcı")}</Text>
              <Text style={styles.joinCta}>{tx("Log activities to join the rankings!", "Sıralamaya katılmak için etkinlik kaydet!")}</Text>
          </>
        )}
      </View>

      {/* Stat pills */}
      {hasEntry && myEntry && (
        <View style={styles.statRow}>
          <StatPill label={`${tx("Rank", "Sıra")} #${myEntry.rank}`} />
          <StatPill label={`${myEntry.weeklyCo2Kg.toFixed(1)} kg CO₂`} accent />
          {myEntry.streakDays > 0 && (
            <StatPill label={`🔥 ${myEntry.streakDays}-${tx("day streak", "gün seri")}`} />
          )}
        </View>
      )}
    </Animated.View>
  );
}

function StatPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.statPill, accent && styles.statPillAccent]}>
      <Text style={[styles.statPillText, accent && styles.statPillTextAccent]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: C.overlay,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: alpha.gold25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  label: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  weekText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(62,213,152,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(62,213,152,0.25)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.mint,
  },
  liveText: {
    color: C.mint,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  percentileBlock: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  beatLabel: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  percentileNum: {
    color: C.text,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 62,
  },
  noEntryNum: {
    color: C.text,
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 54,
  },
  beatSuffix: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  joinCta: {
    color: C.mint,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statPill: {
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(168,196,180,0.15)",
  },
  statPillAccent: {
    backgroundColor: "rgba(62,213,152,0.12)",
    borderColor: "rgba(62,213,152,0.25)",
  },
  statPillText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  statPillTextAccent: {
    color: C.mint,
  },
});
