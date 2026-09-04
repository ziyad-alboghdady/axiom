import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { C } from "../constants/colors";
import { AvatarCircle } from "./AvatarCircle";
import { LevelBadge } from "./LevelBadge";
import { StreakPill } from "./StreakPill";
import type { RankedEntry } from "../types/leaderboard";
import { useI18n } from "../i18n";

interface Props {
  entry: RankedEntry;
}

export function LeaderRow({ entry }: Props) {
  const { tx } = useI18n();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min((entry.rank - 4) * 40, 600);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isEven = entry.rank % 2 === 0;
  const rowBg = entry.isCurrentUser
    ? C.bgSecondary
    : isEven
    ? C.card
    : C.bg;

  return (
    <Animated.View
      style={[
        styles.row,
        { backgroundColor: rowBg, transform: [{ translateX: slideAnim }], opacity: fadeAnim },
        entry.isCurrentUser && styles.currentUserRow,
      ]}
    >
      {/* Rank */}
      <Text style={[styles.rank, entry.isCurrentUser && styles.rankCurrent]}>
        {entry.rank}
      </Text>

      {/* Avatar */}
      <AvatarCircle
        initials={entry.avatarInitials}
        size={36}
        backgroundColor={entry.isCurrentUser ? C.gold : C.overlay}
        textColor={entry.isCurrentUser ? C.overlay : C.gold}
      />

      {/* Name + badges */}
      <View style={styles.nameBlock}>
        <Text style={[styles.name, entry.isCurrentUser && styles.nameCurrent]}>
          {entry.displayName}
          {entry.isCurrentUser && `  (${tx("you", "sen")})`}
        </Text>
        <View style={styles.badges}>
          <LevelBadge level={entry.level} name={entry.levelName} />
          {entry.streakDays >= 3 && <StreakPill days={entry.streakDays} />}
        </View>
      </View>

      {/* CO2 */}
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{entry.weeklyCo2Kg.toFixed(1)}</Text>
        <Text style={styles.scoreUnit}>kg</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 2,
    gap: 12,
    borderRadius: 14,
  },
  currentUserRow: {
    borderWidth: 1.5,
    borderColor: C.mint,
  },
  rank: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "800",
    width: 28,
    textAlign: "center",
  },
  rankCurrent: {
    color: C.gold,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: C.text,
    fontSize: 14,
    fontWeight: "500",
  },
  nameCurrent: {
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  scoreBlock: {
    alignItems: "flex-end",
  },
  score: {
    color: C.mint,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  scoreUnit: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
