import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { C, alpha } from "../constants/colors";
import { AvatarCircle } from "./AvatarCircle";
import type { RankedEntry } from "../types/leaderboard";
import { useI18n } from "../i18n";

interface Props {
  entry: RankedEntry;
  percentile: number;
}

export function MyRankCard({ entry, percentile }: Props) {
  const { tx } = useI18n();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
      ]}
    >
      <View style={styles.leftSection}>
        {/* Avatar */}
        <View style={styles.avatarRing}>
          <AvatarCircle
            initials={entry.avatarInitials}
            size={38}
            backgroundColor={C.gold}
            textColor={C.overlay}
          />
        </View>

        {/* You label */}
        <View>
          <Text style={styles.youLabel}>{tx("YOU", "SEN")}</Text>
          <Text style={styles.cityLabel} numberOfLines={1}>
            {entry.city || entry.levelName}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <StatChip value={`#${entry.rank}`} sub={tx("rank", "sıra")} />
        <View style={styles.divider} />
        <StatChip value={`${entry.weeklyCo2Kg.toFixed(1)}`} sub="kg CO₂" accent />
        <View style={styles.divider} />
        <View style={[styles.topPill]}>
          <Text style={styles.topPillText}>{tx("Top", "İlk")} {100 - percentile}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function StatChip({ value, sub, accent }: { value: string; sub: string; accent?: boolean }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.overlay,
    borderTopWidth: 1,
    borderTopColor: alpha.gold25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: C.gold,
    borderRadius: 22,
    padding: 1,
  },
  youLabel: {
    color: C.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  cityLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "500",
    maxWidth: 80,
  },
  statsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(168,196,180,0.2)",
  },
  statChip: {
    alignItems: "center",
  },
  statValue: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statValueAccent: {
    color: C.mint,
  },
  statSub: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  topPill: {
    backgroundColor: C.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  topPillText: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
  },
});
