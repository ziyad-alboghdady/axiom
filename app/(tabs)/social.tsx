import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C, alpha } from "../../src/constants/colors";
import { useLeaderboard } from "../../src/hooks/useLeaderboard";
import { useAuthStore } from "../../src/store/authStore";
import { LeaderboardHero } from "../../src/components/LeaderboardHero";
import { PodiumRow } from "../../src/components/PodiumRow";
import { LeaderRow } from "../../src/components/LeaderRow";
import { MyRankCard } from "../../src/components/MyRankCard";
import { CheckCircleIcon } from "../../src/components/Icons";
import type { RankedEntry } from "../../src/types/leaderboard";
import { useI18n } from "../../src/i18n";

// ── Week label ────────────────────────────────────────────────────────────────

function getWeekLabel(locale: string): string {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

type SkeletonItem = { id: string; _skeleton: true };
const SKELETON_DATA: SkeletonItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  _skeleton: true as const,
}));

function SkeletonRow() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonRow, { opacity: pulse }]}>
      <View style={styles.skeletonRank} />
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={styles.skeletonScore} />
    </Animated.View>
  );
}

// ── List types ─────────────────────────────────────────────────────────────────

type ListItem = RankedEntry | SkeletonItem;

function isSkeleton(item: ListItem): item is SkeletonItem {
  return "_skeleton" in item;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const router = useRouter();
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const uid = firebaseUid ?? "";

  const firebaseDisplayName = useAuthStore((s) => s.firebaseDisplayName);
  const user = useAuthStore((s) => s.user);
  const { tx, language } = useI18n();
  const weekLabel = getWeekLabel(language === "tr" ? "tr-TR" : "en-US");

  const [scope, setScope] = useState<"friends" | "city" | "country">("country");

  const { entries, myEntry, myPercentile, totalUsers, isLoading } =
    useLeaderboard(uid, {
      displayName: firebaseDisplayName ?? user?.name ?? tx("You", "Sen"),
      city: user?.city ?? "Istanbul", // Use raw database strings for filtering
      country: "Turkey", // Use raw database strings for filtering
    }, scope);

  const top3 = entries.slice(0, 3);
  const rest: ListItem[] = isLoading
    ? SKELETON_DATA
    : (entries.slice(3) as ListItem[]);

  const keyExtractor = useCallback(
    (item: ListItem) => (isSkeleton(item) ? item.id : item.userId),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (isSkeleton(item)) return <SkeletonRow />;
      return <LeaderRow entry={item} />;
    },
    []
  );

  const ListHeader = (
    <View>
      {/* Hero banner */}
        <LeaderboardHero
          myPercentile={myPercentile}
          totalUsers={totalUsers}
          weekLabel={weekLabel}
          myEntry={myEntry}
        />

      {/* Podium — top 3 */}
      {!isLoading && top3.length > 0 && (
        <View style={styles.podiumWrap}>
          <PodiumRow top3={top3} />
        </View>
      )}

      {/* Scope Tabs */}
      <View style={styles.scopeTabs}>
        {(["country", "city", "friends"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.scopeTab, scope === s && styles.scopeTabActive]}
            onPress={() => setScope(s)}
            activeOpacity={0.8}
          >
            <Text style={[styles.scopeTabText, scope === s && styles.scopeTabTextActive]}>
              {s === "country" ? tx("Country", "Ülke") : s === "city" ? tx("City", "Şehir") : tx("Friends", "Arkadaşlar")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section label */}
      <View style={styles.rankHeaderRow}>
          <Text style={styles.rankHeaderLabel}>{tx("FULL RANKINGS", "TAM SIRALAMA")}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{isLoading ? "—" : totalUsers}</Text>
        </View>
      </View>
    </View>
  );

  const ListFooter = (
    <View style={styles.footer}>
      {/* Achievements shortcut */}
      <TouchableOpacity
        onPress={() => router.push("/gamification")}
        style={styles.achieveCard}
        activeOpacity={0.8}
      >
        <View style={styles.achieveIcon}>
          <CheckCircleIcon size={26} color={C.gold} strokeWidth={2.2} />
        </View>
        <View style={styles.achieveText}>
          <Text style={styles.achieveTitle}>{tx("Achievements & Badges", "Başarılar ve Rozetler")}</Text>
          <Text style={styles.achieveDesc}>{tx("View your earned rewards and progress", "Kazandığın ödül ve ilerlemeyi gör")}</Text>
        </View>
        <Text style={styles.achieveArrow}>›</Text>
      </TouchableOpacity>

      {/* Empty state */}
      {!isLoading && entries.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>{tx("No entries yet", "Henüz giriş yok")}</Text>
          <Text style={styles.emptyDesc}>
            {tx("Be the first to log activities and claim rank #1!", "İlk etkinliği kaydet ve #1 sırayı al!")}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <FlatList
        data={rest}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />

      {/* Sticky bottom card */}
      {myEntry && <MyRankCard entry={myEntry} percentile={myPercentile} />}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const CARD_BASE = {
  backgroundColor: C.cardDark,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: alpha.gold15,
  shadowColor: "#0A2E1F",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },

  // Podium
  podiumWrap: {
    marginBottom: 16,
  },

  // Scope Tabs
  scopeTabs: {
    flexDirection: "row",
    backgroundColor: C.overlay,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: alpha.gold15,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  scopeTabActive: {
    backgroundColor: C.bgSecondary,
  },
  scopeTabText: {
    color: C.textDim,
    fontSize: 13,
    fontWeight: "600",
  },
  scopeTabTextActive: {
    color: C.text,
  },

  // Rank section header
  rankHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  rankHeaderLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  countPill: {
    backgroundColor: C.overlay,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: alpha.gold15,
  },
  countPillText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "700",
  },

  // Skeleton
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 2,
    gap: 12,
    borderRadius: 14,
    backgroundColor: C.card,
  },
  skeletonRank: {
    width: 28,
    height: 14,
    borderRadius: 6,
    backgroundColor: C.overlay,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.overlay,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  skeletonName: {
    height: 12,
    borderRadius: 6,
    backgroundColor: C.overlay,
    width: "60%",
  },
  skeletonBadge: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.overlay,
    width: "35%",
  },
  skeletonScore: {
    width: 36,
    height: 14,
    borderRadius: 6,
    backgroundColor: C.overlay,
  },

  // Footer
  footer: {
    marginTop: 8,
    gap: 12,
  },

  // Achievements card
  achieveCard: {
    ...CARD_BASE,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderColor: alpha.gold25,
  },
  achieveIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveText: {
    flex: 1,
  },
  achieveTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  achieveDesc: {
    color: C.textMuted,
    fontSize: 12,
  },
  achieveArrow: {
    color: C.gold,
    fontSize: 28,
    fontWeight: "300",
  },

  // Empty
  emptyCard: {
    ...CARD_BASE,
    padding: 36,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDesc: {
    color: C.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
