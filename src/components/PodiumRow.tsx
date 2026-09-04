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
  top3: RankedEntry[];
}

const MEDALS = [
  { emoji: "👑", barHeight: 72, avatarRingColor: C.gold, barColor: "#C9A96E", ringWidth: 3 },
  { emoji: "🥈", barHeight: 52, avatarRingColor: C.textMuted, barColor: "#7A8E99", ringWidth: 2 },
  { emoji: "🥉", barHeight: 36, avatarRingColor: "#9B7A54", barColor: "#9B7A54", ringWidth: 1.5 },
];

// Visual order: 2nd left, 1st center, 3rd right
const DISPLAY_ORDER = [1, 0, 2];

export function PodiumRow({ top3 }: Props) {
  const { tx } = useI18n();
  const anims = useRef([
    new Animated.Value(40),
    new Animated.Value(40),
    new Animated.Value(40),
  ]).current;
  const fades = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Rank 3 first (display index 2), then rank 2 (display index 0), then rank 1 (display index 1)
    const staggerOrder = [2, 0, 1];
    staggerOrder.forEach((displayIdx, staggerStep) => {
      const entryIdx = DISPLAY_ORDER[displayIdx];
      if (!top3[entryIdx]) return;
      Animated.parallel([
        Animated.timing(anims[displayIdx], {
          toValue: 0,
          duration: 400,
          delay: staggerStep * 100,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(fades[displayIdx], {
          toValue: 1,
          duration: 400,
          delay: staggerStep * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [top3.length]);

  if (top3.length < 1) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>{tx("THIS WEEK'S CHAMPIONS", "BU HAFTANIN ŞAMPİYONLARI")}</Text>
      <View style={styles.podium}>
        {DISPLAY_ORDER.map((entryIdx, displayIdx) => {
          const entry = top3[entryIdx];
          if (!entry) return <View key={displayIdx} style={styles.podiumCol} />;
          const medal = MEDALS[entryIdx];
          const isCenter = displayIdx === 1;
          return (
            <Animated.View
              key={entry.userId}
              style={[
                styles.podiumCol,
                isCenter && styles.podiumColCenter,
                {
                  transform: [{ translateY: anims[displayIdx] }],
                  opacity: fades[displayIdx],
                },
              ]}
            >
              {/* Medal emoji */}
              <Text style={[styles.medalEmoji, isCenter && styles.medalEmojiCenter]}>
                {medal.emoji}
              </Text>

              {/* Avatar with ring */}
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: medal.avatarRingColor,
                    borderWidth: medal.ringWidth,
                    width: isCenter ? 60 : 48,
                    height: isCenter ? 60 : 48,
                    borderRadius: isCenter ? 30 : 24,
                  },
                  entry.isCurrentUser && styles.currentUserRing,
                ]}
              >
                <AvatarCircle
                  initials={entry.avatarInitials}
                  size={isCenter ? 54 : 42}
                  backgroundColor={entry.isCurrentUser ? C.gold : C.overlay}
                  textColor={entry.isCurrentUser ? C.overlay : C.gold}
                />
              </View>

              {/* Name */}
              <Text style={[styles.name, isCenter && styles.nameCenter]} numberOfLines={1}>
                {entry.displayName.split(" ")[0]}
                {entry.isCurrentUser ? " 👤" : ""}
              </Text>

              {/* CO2 */}
              <Text style={styles.score}>{entry.weeklyCo2Kg.toFixed(1)} kg</Text>

              {/* Podium block */}
              <View
                style={[
                  styles.podiumBlock,
                  { height: medal.barHeight, backgroundColor: medal.barColor },
                  isCenter && styles.podiumBlockCenter,
                ]}
              >
                <Text style={styles.rankLabel}>#{entryIdx + 1}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 16,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 8,
  },
  podiumCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  podiumColCenter: {
    marginBottom: 0,
  },
  medalEmoji: {
    fontSize: 22,
  },
  medalEmojiCenter: {
    fontSize: 28,
  },
  avatarRing: {
    alignItems: "center",
    justifyContent: "center",
  },
  currentUserRing: {
    borderColor: C.mint,
    shadowColor: C.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  nameCenter: {
    fontSize: 13,
  },
  score: {
    color: C.mint,
    fontSize: 11,
    fontWeight: "700",
  },
  podiumBlock: {
    width: "90%",
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    opacity: 0.85,
  },
  podiumBlockCenter: {
    opacity: 1,
  },
  rankLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
  },
});
