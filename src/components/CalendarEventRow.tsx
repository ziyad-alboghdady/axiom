/**
 * CalendarEventRow — premium dark card for a single calendar event
 * Shows: time, title, location, CO₂ estimate, travel mode, Gemini suggestion,
 * and an "Add to today's emissions" button.
 */
import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing,
} from "react-native";
import { useI18n } from "../i18n";
import { C, alpha } from "../constants/colors";
import { Co2Impact } from "./Co2Impact";

// ── Travel mode display ────────────────────────────────────────────────────────

const MODE_CONFIG: Record<string, { emoji: string; labelEn: string; labelTr: string; color: string }> = {
  car:     { emoji: "🚗", labelEn: "Car",     labelTr: "Araba",    color: C.coral     },
  bus:     { emoji: "🚌", labelEn: "Bus",     labelTr: "Otobüs",   color: C.gold      },
  train:   { emoji: "🚆", labelEn: "Train",   labelTr: "Tren",     color: C.mint      },
  cycling: { emoji: "🚲", labelEn: "Cycling", labelTr: "Bisiklet", color: C.mint      },
  walking: { emoji: "🚶", labelEn: "Walking", labelTr: "Yürüyüş",  color: C.mint      },
  online:  { emoji: "💻", labelEn: "Online",  labelTr: "Çevrimiçi", color: C.textMuted },
  unknown: { emoji: "❓", labelEn: "?",       labelTr: "?",         color: C.textMuted },
};

function co2Color(kg: number): string {
  if (kg === 0 || kg <= 0.05) return C.mint;
  if (kg < 1)                  return C.mint;
  if (kg < 3)                  return C.gold;
  return C.coral;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  title:       string;
  formattedTime: string;
  location?:   string;
  co2Kg?:      number;
  travelMode?: string;
  suggestion?: string | null;
  isAdded:     boolean;
  isAdding:    boolean;
  onAdd:       () => void;
  index:       number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CalendarEventRow({
  title, formattedTime, location, co2Kg, travelMode,
  suggestion, isAdded, isAdding, onAdd, index,
}: Props) {
  const { tx } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const mode   = MODE_CONFIG[travelMode ?? "unknown"] ?? MODE_CONFIG.unknown;
  const score  = co2Kg ?? 0;
  const color  = co2Color(score);
  const isLow  = score <= 0.05;

  return (
    <Animated.View
      style={[
        styles.card,
        isAdded && styles.cardAdded,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: color }]} />

      <View style={styles.body}>
        {/* Top row: time + CO2 badge */}
        <View style={styles.topRow}>
          <Text style={styles.time}>{formattedTime}</Text>
          {co2Kg !== undefined && (
            <View style={[styles.co2Badge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
              <Text style={[styles.co2Text, { color }]}>
                {isLow ? "≈0" : score.toFixed(2)} kg CO₂
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        {/* Location + mode row */}
        <View style={styles.metaRow}>
          {location ? (
            <Text style={styles.location} numberOfLines={1}>📍 {location}</Text>
          ) : (
            <Text style={styles.location}>{tx("No location", "Konum yok")}</Text>
          )}
          <View style={[styles.modePill, { borderColor: `${mode.color}40` }]}>
            <Text style={styles.modeEmoji}>{mode.emoji}</Text>
            <Text style={[styles.modeLabel, { color: mode.color }]}>{tx(mode.labelEn, mode.labelTr)}</Text>
          </View>
        </View>

        {/* CO₂ equivalents (tappable) */}
        {co2Kg !== undefined && co2Kg > 0.01 && (
          <Co2Impact kg={co2Kg} accentColor={color} />
        )}

        {/* Suggestion row (expandable) */}
        {suggestion && (
          <TouchableOpacity
            onPress={() => setExpanded((e) => !e)}
            style={styles.suggestionToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionLabel}>
              💡 {tx("Gemini tip", "Gemini ipucu")}  {expanded ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        )}
        {suggestion && expanded && (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        )}

        {/* Add to emissions button */}
        {!isLow && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              isAdded   && styles.addBtnAdded,
              isAdding  && styles.addBtnLoading,
            ]}
            onPress={onAdd}
            activeOpacity={0.8}
            disabled={isAdded || isAdding}
          >
              <Text style={[styles.addBtnText, isAdded && styles.addBtnTextAdded]}>
              {isAdded
                ? tx("✓  Added to today's emissions", "✓  Bugünkü emisyona eklendi")
                : isAdding
                ? tx("Adding…", "Ekleniyor…")
                : `+  ${tx("Add", "Ekle")} ${score.toFixed(2)} kg ${tx("to today", "bugüne")}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: C.cardDark,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: alpha.gold15,
    overflow: "hidden",
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAdded: {
    borderColor: "rgba(62,213,152,0.35)",
    backgroundColor: "rgba(22,43,33,1)",
  },
  accent: {
    width: 4,
    borderRadius: 2,
    margin: 8,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  co2Badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  co2Text: {
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  location: {
    color: C.textMuted,
    fontSize: 12,
    flex: 1,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "rgba(10,46,31,0.6)",
  },
  modeEmoji: { fontSize: 11 },
  modeLabel: { fontSize: 10, fontWeight: "700" },

  suggestionToggle: {
    marginTop: 2,
  },
  suggestionLabel: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  suggestionBox: {
    backgroundColor: "rgba(230,194,122,0.08)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: alpha.gold15,
  },
  suggestionText: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  addBtn: {
    marginTop: 8,
    backgroundColor: C.overlay,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: alpha.gold25,
  },
  addBtnAdded: {
    backgroundColor: "rgba(62,213,152,0.12)",
    borderColor: "rgba(62,213,152,0.35)",
  },
  addBtnLoading: { opacity: 0.5 },
  addBtnText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  addBtnTextAdded: {
    color: C.mint,
  },
});
