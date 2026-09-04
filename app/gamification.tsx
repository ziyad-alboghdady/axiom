/**
 * S-09 GamificationScreen
 *
 * Achievements, badges, and progress overview.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { C, alpha } from "../src/constants/colors";
import { XPRing } from "../src/components/XPRing";
import { BadgeGrid } from "../src/components/BadgeGrid";
import { useProgressStore } from "../src/store/progressStore";
import { xpToNextLevel } from "../src/constants/levels";
import { useI18n } from "../src/i18n";

const ALL_BADGES = [
  { id: "first_log", nameEn: "First Log", nameTr: "İlk Kayıt", icon: "📝" },
  { id: "week_streak", nameEn: "Week Streak", nameTr: "Haftalık Seri", icon: "🔥" },
  { id: "month_streak", nameEn: "Month Streak", nameTr: "Aylık Seri", icon: "💎" },
  { id: "low_carbon_day", nameEn: "Low Carbon Day", nameTr: "Düşük Karbon Günü", icon: "🌿" },
  { id: "photo_scanner", nameEn: "Photo Scanner", nameTr: "Fotoğraf Tarayıcı", icon: "📸" },
  { id: "calendar_hero", nameEn: "Calendar Hero", nameTr: "Takvim Kahramanı", icon: "📅" },
  { id: "social_butterfly", nameEn: "Social", nameTr: "Sosyal", icon: "👥" },
  { id: "green_hero", nameEn: "Green Hero", nameTr: "Yeşil Kahraman", icon: "🏆" },
];

export default function GamificationScreen() {
  const router = useRouter();
  const { totalXp, level, levelName, streakDays, badges } = useProgressStore();
  const { tx } = useI18n();

  const badgesWithState = ALL_BADGES.map((b) => ({
    ...b,
    name: tx(b.nameEn, b.nameTr),
    earned: badges.includes(b.id),
  }));

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>{tx("← Back", "← Geri")}</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerWrap}>
          <View style={styles.ringGlow} />
          <XPRing currentXp={totalXp} xpForNextLevel={xpToNextLevel(totalXp)} level={level} size={150} />
          <Text style={styles.levelNameText}>{levelName}</Text>
          <Text style={styles.xpToNextText}>
            {xpToNextLevel(totalXp)} {tx("XP to next level", "bir sonraki seviyeye XP")}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: alpha.gold15 }]}>
            <Text style={[styles.statValue, { color: C.gold }]}>{totalXp}</Text>
            <Text style={styles.statLabel}>{tx("Total XP", "Toplam XP")}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: alpha.mint10 }]}>
            <Text style={[styles.statValue, { color: C.mint }]}>{streakDays}</Text>
            <Text style={styles.statLabel}>{tx("Day Streak", "Gün Serisi")}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: alpha.coral12 }]}>
            <Text style={[styles.statValue, { color: C.coral }]}>
              {badges.length}/{ALL_BADGES.length}
            </Text>
            <Text style={styles.statLabel}>{tx("Badges", "Rozetler")}</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>{tx("Achievements & Badges", "Başarılar ve Rozetler")}</Text>
          <BadgeGrid badges={badgesWithState} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.textDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(26,61,43,0.4)",
  },
  backText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
  headerWrap: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 10,
  },
  ringGlow: {
    position: "absolute",
    top: 15,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(230,194,122,0.1)",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  levelNameText: {
    color: C.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 20,
    letterSpacing: 0.5,
  },
  xpToNextText: {
    color: C.gold,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 36,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.cardDark,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: C.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgesSection: {
    flex: 1,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: "uppercase",
  },
});
