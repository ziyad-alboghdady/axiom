import React, { useEffect, useRef } from "react";
import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity, Animated, Easing, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C, alpha } from "../../src/constants/colors";
import { SuggestionCard } from "../../src/components/SuggestionCard";
import { useGeminiCoach } from "../../src/hooks/useGeminiCoach";
import { useAuthStore } from "../../src/store/authStore";
import { useI18n } from "../../src/i18n";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PulseSkeleton({ height = 90, mt = 0 }: { height?: number; mt?: number }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 0.4,  duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonBlock, { height, marginTop: mt, opacity: pulse }]} />
  );
}

function CoachSkeleton() {
  const { tx } = useI18n();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.scroll}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{tx("AI Coach", "YZ Koçu")}</Text>
            <Text style={styles.subtitle}>{tx("Powered by Gemini ✦", "Gemini ile desteklenir ✦")}</Text>
          </View>
          <View style={styles.geminiBadge}><Text style={styles.geminiBadgeText}>🤖</Text></View>
        </View>
        <PulseSkeleton height={110} />
        <PulseSkeleton height={76}  mt={12} />
        <PulseSkeleton height={76}  mt={8}  />
        <PulseSkeleton height={76}  mt={8}  />
        <PulseSkeleton height={96}  mt={12} />
      </View>
    </SafeAreaView>
  );
}

function EmptyState() {
  const { tx } = useI18n();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{tx("AI Coach", "YZ Koçu")}</Text>
            <Text style={styles.subtitle}>{tx("Powered by Gemini ✦", "Gemini ile desteklenir ✦")}</Text>
          </View>
          <View style={styles.geminiBadge}><Text style={styles.geminiBadgeText}>🤖</Text></View>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>{tx("No data yet", "Henüz veri yok")}</Text>
          <Text style={styles.emptyDesc}>
            {tx("Log at least one activity today on the Log tab, then come back for personalised AI coaching.", "Bugün Kayıt sekmesinde en az bir etkinlik girin, sonra kişiselleştirilmiş YZ koçluğu için geri dönün.")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { tx } = useI18n();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{tx("AI Coach", "YZ Koçu")}</Text>
            <Text style={styles.subtitle}>{tx("Powered by Gemini ✦", "Gemini ile desteklenir ✦")}</Text>
          </View>
          <View style={styles.geminiBadge}><Text style={styles.geminiBadgeText}>🤖</Text></View>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>⚡</Text>
          <Text style={styles.emptyTitle}>{tx("Couldn't reach Gemini", "Gemini'ye ulaşılamadı")}</Text>
          <Text style={styles.emptyDesc}>{tx("Check your connection and try again.", "Bağlantınızı kontrol edip tekrar deneyin.")}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>{tx("Try again", "Tekrar dene")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ManualState({ onGenerate, isFetching }: { onGenerate: () => void; isFetching: boolean }) {
  const { tx } = useI18n();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{tx("AI Coach", "YZ Koçu")}</Text>
            <Text style={styles.subtitle}>{tx("Powered by Gemini ✦", "Gemini ile desteklenir ✦")}</Text>
          </View>
          <View style={styles.geminiBadge}><Text style={styles.geminiBadgeText}>🤖</Text></View>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>{tx("Daily Coaching Ready", "Günlük Koçluk Hazır")}</Text>
          <Text style={styles.emptyDesc}>
            {tx("Tap below to analyze your recent activities and generate your personalized daily coaching plan.", "Son etkinliklerinizi analiz etmek ve kişisel koçluk planınızı oluşturmak için aşağıya dokunun.")}
          </Text>
          <TouchableOpacity 
            style={[styles.retryBtn, isFetching && styles.refreshBtnLoading]} 
            onPress={onGenerate} 
            activeOpacity={0.8}
            disabled={isFetching}
          >
            <Text style={styles.retryBtnText}>
              {isFetching ? tx("Generating...", "Oluşturuluyor...") : tx("Generate Coaching", "Koçluğu Oluştur")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AICoachScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const userId = user?.uid ?? firebaseUid ?? undefined;
  const { tx } = useI18n();

  const {
    data, isLoading, error, noActivities, source, generateCoach,
    isOfflineFallback, refetch, isFetching,
  } = useGeminiCoach(userId);

  // Entry animations — staggered sections
  const s = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;
  const t = useRef(Array.from({ length: 5 }, () => new Animated.Value(20))).current;

  useEffect(() => {
    if (!data) return;
    Animated.stagger(80, s.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim,  { toValue: 1, duration: 440, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(t[i],  { toValue: 0, duration: 440, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ])
    )).start();
  }, [data]);

  if (!userId || noActivities) return <EmptyState />;
  if (isLoading || (isFetching && source === "manual_required")) return <CoachSkeleton />;
  if (source === "manual_required") return <ManualState onGenerate={generateCoach} isFetching={isFetching} />;
  if (error || !data) return <ErrorState onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Animated.View style={[styles.titleRow, { opacity: s[0], transform: [{ translateY: t[0] }] }]}>
          <View>
            <Text style={styles.title}>{tx("AI Coach", "YZ Koçu")}</Text>
            <Text style={styles.subtitle}>{tx("Powered by Gemini ✦", "Gemini ile desteklenir ✦")}</Text>
          </View>
          <View style={styles.geminiBadge}>
            <Text style={styles.geminiBadgeText}>🤖</Text>
          </View>
        </Animated.View>

        {/* ── Offline banner ── */}
        {isOfflineFallback && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>{tx("📶  Offline — showing cached coaching", "📶  Çevrimdışı — önbellekteki koçluk gösteriliyor")}</Text>
          </View>
        )}

        {/* ── Biggest mistake ── */}
        <Animated.View style={{ opacity: s[1], transform: [{ translateY: t[1] }] }}>
          <View style={styles.mistakeCard}>
            <View style={styles.mistakeHeader}>
              <View style={styles.mistakePill}>
                <Text style={styles.mistakePillText}>{tx("⚠  BIGGEST IMPACT", "⚠  EN BÜYÜK ETKİ")}</Text>
              </View>
              <Text style={styles.savedChip}>
                −{data.co2SavedIfFixed.toFixed(1)} {tx("kg/mo if fixed", "kg/ay (düzeltilirse)")}
              </Text>
            </View>
            <Text style={styles.mistakeText}>{data.biggestMistake}</Text>
          </View>
        </Animated.View>

        {/* ── Suggestions ── */}
        <Animated.View style={{ opacity: s[2], transform: [{ translateY: t[2] }] }}>
          <View style={styles.sectionRow}>
             <Text style={styles.sectionLabel}>{tx("YOUR ACTION PLAN", "AKSİYON PLANIN")}</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>3</Text></View>
          </View>
          {data.suggestions.map((suggestion, i) => (
            <View key={`${suggestion}-${i}`} style={styles.suggestionWrap}>
              <SuggestionCard suggestion={suggestion} index={i} />
            </View>
          ))}
        </Animated.View>

        {/* ── Yearly forecast ── */}
        <Animated.View style={{ opacity: s[3], transform: [{ translateY: t[3] }] }}>
          <View style={styles.forecastCard}>
            <View style={styles.forecastHeader}>
              <Text style={styles.forecastLabel}>{tx("📈  YEARLY FORECAST", "📈  YILLIK TAHMİN")}</Text>
            </View>
            <Text style={styles.forecastText}>{data.yearlyForecast}</Text>
          </View>
        </Animated.View>

        {/* ── CTAs ── */}
        <Animated.View style={[styles.ctaRow, { opacity: s[4], transform: [{ translateY: t[4] }] }]}>
          <TouchableOpacity
            style={styles.simulatorBtn}
            onPress={() => router.push("/simulator")}
            activeOpacity={0.85}
          >
            <Text style={styles.simulatorBtnText}>{tx("🔬  Test a what-if scenario", "🔬  Bir senaryoyu test et")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.refreshBtn, isFetching && styles.refreshBtnLoading]}
            onPress={() => refetch()}
            activeOpacity={0.8}
            disabled={isFetching}
          >
            <Text style={styles.refreshBtnText}>
              {isFetching ? tx("Refreshing…", "Yenileniyor…") : tx("⟳  Refresh analysis", "⟳  Analizi yenile")}
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const CARD = {
  backgroundColor: C.cardDark,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: alpha.gold15,
  shadowColor: "#0A2E1F",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.22,
  shadowRadius: 12,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 4,
  },
  title: {
    color: C.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 3,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  geminiBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.overlay,
    borderWidth: 1.5,
    borderColor: alpha.gold25,
    alignItems: "center",
    justifyContent: "center",
  },
  geminiBadgeText: { fontSize: 22 },

  // Skeleton
  skeletonBlock: {
    backgroundColor: C.cardDark,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.gold15,
  },

  // Offline
  offlineBanner: {
    backgroundColor: C.overlay,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: alpha.gold15,
  },
  offlineText: { color: C.textMuted, fontSize: 12, fontWeight: "600" },

  // Mistake card
  mistakeCard: {
    ...CARD,
    padding: 18,
    marginBottom: 18,
    borderColor: "rgba(255,90,60,0.30)",
    backgroundColor: "rgba(22,43,33,1)",
  },
  mistakeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mistakePill: {
    backgroundColor: "rgba(255,90,60,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,90,60,0.30)",
  },
  mistakePillText: {
    color: C.coral,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  savedChip: {
    color: C.mint,
    fontSize: 11,
    fontWeight: "700",
  },
  mistakeText: {
    color: C.text,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
  },

  // Suggestions
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  countBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: C.overlay,
    fontSize: 10,
    fontWeight: "800",
  },
  suggestionWrap: { marginBottom: 6 },

  // Forecast
  forecastCard: {
    ...CARD,
    padding: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  forecastHeader: { marginBottom: 10 },
  forecastLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  forecastText: {
    color: C.text,
    fontSize: 14,
    lineHeight: 22,
  },

  // CTAs
  ctaRow: { gap: 10 },
  simulatorBtn: {
    ...CARD,
    paddingVertical: 14,
    alignItems: "center",
    borderColor: alpha.gold25,
  },
  simulatorBtnText: {
    color: C.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  refreshBtn: {
    backgroundColor: C.bgSecondary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(62,213,152,0.2)",
  },
  refreshBtnLoading: { opacity: 0.6 },
  refreshBtnText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },

  // Empty / Error
  emptyCard: {
    ...CARD,
    padding: 36,
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
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
  retryBtn: {
    marginTop: 18,
    backgroundColor: C.bgSecondary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryBtnText: { color: C.text, fontWeight: "700", fontSize: 14 },
});
