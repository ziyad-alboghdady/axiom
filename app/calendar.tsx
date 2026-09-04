/**
 * CalendarScreen — Axiom (Simulation Mode)
 *
 * Displays a realistic simulation of today's Google Calendar events
 * with pre-computed CO₂ travel estimates and Gemini-style suggestions.
 * No API calls — all data is hardcoded for the demo.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C, alpha } from "../src/constants/colors";
import { Co2Impact } from "../src/components/Co2Impact";
import { getDailyScore, saveDailyScore } from "../src/services/firebase";
import { useAuthStore } from "../src/store/authStore";
import { useI18n } from "../src/i18n";

// ── Simulated data ────────────────────────────────────────────────────────────

function todayAt(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function fmt(iso: string, locale: string, allDayLabel: string): string {
  if (!iso.includes("T")) return allDayLabel;
  const d = new Date(iso);
  return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: locale !== "tr-TR" });
}

interface SimEvent {
  id: string;
  titleEn: string;
  titleTr: string;
  locationEn?: string;
  locationTr?: string;
  start: string;
  end: string;
  co2Kg: number;
  travelMode: string;
  suggestionEn?: string;
  suggestionTr?: string;
}

const EVENTS: SimEvent[] = [
  {
    id: "sim-1",
    titleEn: "Morning Team Standup", titleTr: "Sabah Ekip Toplantısı",
    start: todayAt(9, 0),
    end: todayAt(9, 30),
    co2Kg: 0.03,
    travelMode: "online",
  },
  {
    id: "sim-2",
    titleEn: "Coffee with Jordan", titleTr: "Jordan ile Kahve",
    locationEn: "The Daily Grind Café, 12 Market St", locationTr: "The Daily Grind Kafe, 12 Market Cad",
    start: todayAt(10, 30),
    end: todayAt(11, 15),
    co2Kg: 0,
    travelMode: "walking",
  },
  {
    id: "sim-3",
    titleEn: "Client Presentation", titleTr: "Müşteri Sunumu",
    locationEn: "Vertex Tower, 55 Business District", locationTr: "Vertex Kulesi, 55 İş Merkezi",
    start: todayAt(13, 0),
    end: todayAt(14, 30),
    co2Kg: 2.52,
    travelMode: "car",
    suggestionEn: "Share a cab with a colleague to halve emissions — saves ~1.3 kg CO₂",
    suggestionTr: "Bir meslektaşınızla taksi paylaşarak emisyonları yarıya indirin — ~1.3 kg CO₂ tasarruf",
  },
  {
    id: "sim-4",
    titleEn: "Doctor Appointment", titleTr: "Doktor Randevusu",
    locationEn: "City Medical Centre, 100 Oak Avenue", locationTr: "Şehir Tıp Merkezi, 100 Oak Caddesi",
    start: todayAt(15, 30),
    end: todayAt(16, 15),
    co2Kg: 1.89,
    travelMode: "car",
    suggestionEn: "The 42 bus stops 200m away — switching saves ~1.6 kg CO₂",
    suggestionTr: "42 numaralı otobüs 200m yakında duruyor — geçiş yapmak ~1.6 kg CO₂ tasarruf sağlar",
  },
  {
    id: "sim-5",
    titleEn: "Gym Session", titleTr: "Spor Salonu",
    locationEn: "FitZone, 8 West Road", locationTr: "FitZone, 8 Batı Yolu",
    start: todayAt(17, 30),
    end: todayAt(18, 30),
    co2Kg: 0,
    travelMode: "cycling",
  },
  {
    id: "sim-6",
    titleEn: "Dinner with Family", titleTr: "Aile ile Akşam Yemeği",
    locationEn: "La Bella, 33 Garden Street", locationTr: "La Bella, 33 Bahçe Sokak",
    start: todayAt(19, 30),
    end: todayAt(21, 0),
    co2Kg: 3.36,
    travelMode: "car",
    suggestionEn: "Consider taking a rideshare together — saves ~2.1 kg CO₂ and parking",
    suggestionTr: "Birlikte araç paylaşımı yapmayı düşünün — ~2.1 kg CO₂ ve park ücretinden tasarruf edin",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<string, { emoji: string; labelEn: string; labelTr: string; color: string }> = {
  car:     { emoji: "🚗", labelEn: "Car",     labelTr: "Araba",     color: C.coral     },
  bus:     { emoji: "🚌", labelEn: "Bus",     labelTr: "Otobüs",    color: C.gold      },
  train:   { emoji: "🚆", labelEn: "Train",   labelTr: "Tren",      color: C.mint      },
  cycling: { emoji: "🚲", labelEn: "Cycling", labelTr: "Bisiklet",  color: C.mint      },
  walking: { emoji: "🚶", labelEn: "Walking", labelTr: "Yürüme",    color: C.mint      },
  online:  { emoji: "💻", labelEn: "Online",  labelTr: "Çevrimiçi", color: C.textMuted },
};

function co2Color(kg: number): string {
  if (kg <= 0.05) return C.mint;
  if (kg < 1)     return C.mint;
  if (kg < 3)     return C.gold;
  return C.coral;
}

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const pulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8,  duration: 850, delay, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 0.35, duration: 850,        useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      <View style={styles.skeletonAccent} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "60%", marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: "40%", marginTop: 6, height: 10 }]} />
      </View>
    </Animated.View>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: SimEvent;
  index: number;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

function EventCard({ event, index, isAdded, isAdding, onAdd }: EventCardProps) {
  const [tipOpen, setTipOpen] = useState(false);
  const { tx, language } = useI18n();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, delay: index * 65, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, delay: index * 65, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const mode  = MODE_CONFIG[event.travelMode] ?? MODE_CONFIG.online;
  const color = co2Color(event.co2Kg);
  const isLow = event.co2Kg <= 0.05;

  return (
    <Animated.View style={[styles.card, isAdded && styles.cardAdded, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.body}>
        {/* Time + CO₂ badge */}
        <View style={styles.topRow}>
          <Text style={styles.time}>{fmt(event.start, language === "tr" ? "tr-TR" : "en-US", tx("All day", "Tüm gün"))} – {fmt(event.end, language === "tr" ? "tr-TR" : "en-US", tx("All day", "Tüm gün"))}</Text>
          <View style={[styles.co2Badge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
            <Text style={[styles.co2Text, { color }]}>
              {isLow ? "≈0" : event.co2Kg.toFixed(2)} kg CO₂
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>{tx(event.titleEn, event.titleTr)}</Text>

        {/* Location + mode */}
        <View style={styles.metaRow}>
          {event.locationEn && event.locationTr ? (
            <Text style={styles.location} numberOfLines={1}>📍 {tx(event.locationEn, event.locationTr)}</Text>
          ) : (
            <Text style={styles.location}>{tx("No location", "Konum yok")}</Text>
          )}
          <View style={[styles.modePill, { borderColor: `${mode.color}40` }]}>
            <Text style={styles.modeEmoji}>{mode.emoji}</Text>
            <Text style={[styles.modeLabel, { color: mode.color }]}>{tx(mode.labelEn, mode.labelTr)}</Text>
          </View>
        </View>

        {/* CO₂ equivalents */}
        {!isLow && (
          <Co2Impact kg={event.co2Kg} accentColor={color} />
        )}

        {/* Gemini tip */}
        {event.suggestionEn && event.suggestionTr && (
          <TouchableOpacity onPress={() => setTipOpen((o) => !o)} style={styles.tipToggle} activeOpacity={0.7}>
            <Text style={styles.tipLabel}>💡 {tx("Tip", "İpucu")}  {tipOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
        )}
        {event.suggestionEn && event.suggestionTr && tipOpen && (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{tx(event.suggestionEn, event.suggestionTr)}</Text>
          </View>
        )}

        {/* Add to log button */}
        {!isLow && (
          <TouchableOpacity
            style={[styles.addBtn, isAdded && styles.addBtnAdded, isAdding && styles.addBtnLoading]}
            onPress={onAdd}
            disabled={isAdded || isAdding}
            activeOpacity={0.8}
          >
            <Text style={[styles.addBtnText, isAdded && styles.addBtnTextAdded]}>
              {isAdded ? tx("✓  Added to today's emissions", "✓  Bugünkü emisyona eklendi") : isAdding ? tx("Adding…", "Ekleniyor…") : `+  ${tx("Add", "Ekle")} ${event.co2Kg.toFixed(2)} kg ${tx("to today", "bugüne")}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const router = useRouter();
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const { tx } = useI18n();

  const [isLoading, setIsLoading]   = useState(true);
  const [addedIds,  setAddedIds]    = useState<Set<string>>(new Set());
  const [isAdding,  setIsAdding]    = useState<string | null>(null);

  // Simulate a Gemini analysis loading delay
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const totalCo2 = EVENTS.reduce((sum, e) => sum + e.co2Kg, 0);
  const addedCount = addedIds.size;

  const addToLog = useCallback(async (event: SimEvent) => {
    if (!firebaseUid || addedIds.has(event.id)) return;
    setIsAdding(event.id);
    try {
      const today   = todayDateString();
      const current = await getDailyScore(firebaseUid, today);
      await saveDailyScore(firebaseUid, today, {
        totalCo2Kg: (current?.totalCo2Kg ?? 0) + event.co2Kg,
        breakdown: {
          transport: (current?.breakdown?.transport ?? 0) + event.co2Kg,
          food:      current?.breakdown?.food    ?? 0,
          energy:    current?.breakdown?.energy  ?? 0,
          shopping:  current?.breakdown?.shopping ?? 0,
        },
      });
      setAddedIds((prev) => new Set([...prev, event.id]));
    } catch (err) {
      console.error("[CalendarScreen] addToLog:", err);
    } finally {
      setIsAdding(null);
    }
  }, [firebaseUid, addedIds]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Back button ── */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>{tx("← Back", "← Geri")}</Text>
        </TouchableOpacity>

        {/* ── Loading ── */}
        {isLoading && (
          <View style={{ gap: 10 }}>
            <View style={styles.analysisTag}>
               <Text style={styles.analysisTagText}>{tx("✦  Analysing today's calendar…", "✦  Bugünkü takvim analiz ediliyor…")}</Text>
            </View>
            {[0, 70, 140, 210].map((d) => <SkeletonCard key={d} delay={d} />)}
          </View>
        )}

        {/* ── Content ── */}
        {!isLoading && (
          <>
            {/* Summary bar */}
            <View style={styles.summaryBar}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{EVENTS.length}</Text>
                 <Text style={styles.summaryLabel}>{tx("events today", "bugünkü etkinlik")}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: totalCo2 > 5 ? C.coral : C.gold }]}>
                  {totalCo2.toFixed(1)} kg
                </Text>
                 <Text style={styles.summaryLabel}>{tx("travel CO₂", "seyahat CO₂")}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: addedCount > 0 ? C.mint : C.textMuted }]}>
                  {addedCount}
                </Text>
                 <Text style={styles.summaryLabel}>{tx("added to log", "kayıta eklendi")}</Text>
              </View>
            </View>

            {/* Section header */}
            <View style={styles.listHeader}>
               <Text style={styles.listLabel}>{tx("TODAY'S EVENTS", "BUGÜNÜN ETKİNLİKLERİ")}</Text>
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>{EVENTS.length}</Text>
              </View>
            </View>

            {/* Event cards */}
            {EVENTS.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                isAdded={addedIds.has(event.id)}
                isAdding={isAdding === event.id}
                onAdd={() => addToLog(event)}
              />
            ))}

            {/* Footer note */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                 {tx("Simulation mode — tap CO₂ badges to see relatable equivalents", "Simülasyon modu — karşılıkları görmek için CO₂ rozetlerine dokunun")}
              </Text>
            </View>
          </>
        )}
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

  // Back button
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.textMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },

  // Analysis loading tag
  analysisTag: {
    backgroundColor: "rgba(230,194,122,0.08)",
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: alpha.gold25, marginBottom: 12,
  },
  analysisTagText: { color: C.gold, fontSize: 12, fontWeight: "600", textAlign: "center" },

  // Summary bar
  summaryBar: {
    ...CARD,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderColor: alpha.gold25,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  summaryLabel: { color: C.textMuted, fontSize: 11, fontWeight: "500", marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: "rgba(168,196,180,0.15)" },

  // Section header
  listHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  listLabel: { color: C.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  countChip: {
    backgroundColor: C.overlay, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, borderWidth: 1, borderColor: alpha.gold15,
  },
  countChipText: { color: C.gold, fontSize: 10, fontWeight: "700" },

  // Event card
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
  accent: { width: 4, borderRadius: 2, margin: 8, alignSelf: "stretch" },
  body: { flex: 1, paddingVertical: 14, paddingRight: 14, gap: 7 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { color: C.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  co2Badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  co2Text: { fontSize: 11, fontWeight: "800" },
  cardTitle: { color: C.text, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  location: { color: C.textMuted, fontSize: 12, flex: 1 },
  modePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, backgroundColor: "rgba(10,46,31,0.6)",
  },
  modeEmoji: { fontSize: 11 },
  modeLabel: { fontSize: 10, fontWeight: "700" },
  tipToggle: { marginTop: 2 },
  tipLabel: { color: C.gold, fontSize: 11, fontWeight: "600" },
  tipBox: {
    backgroundColor: "rgba(230,194,122,0.08)",
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: alpha.gold15,
  },
  tipText: { color: C.textMuted, fontSize: 12, lineHeight: 18 },
  addBtn: {
    marginTop: 4, backgroundColor: C.overlay, borderRadius: 10,
    paddingVertical: 9, alignItems: "center",
    borderWidth: 1, borderColor: alpha.gold25,
  },
  addBtnAdded: { backgroundColor: "rgba(62,213,152,0.12)", borderColor: "rgba(62,213,152,0.35)" },
  addBtnLoading: { opacity: 0.5 },
  addBtnText: { color: C.gold, fontSize: 12, fontWeight: "700" },
  addBtnTextAdded: { color: C.mint },

  // Skeleton
  skeletonCard: {
    flexDirection: "row", backgroundColor: C.cardDark, borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: alpha.gold15, overflow: "hidden", height: 110,
  },
  skeletonAccent: { width: 4, backgroundColor: C.card, margin: 8, borderRadius: 2 },
  skeletonBody: { flex: 1, paddingVertical: 18, paddingRight: 14 },
  skeletonLine: { height: 14, borderRadius: 6, backgroundColor: C.overlay, width: "80%" },

  // Footer
  footer: { marginTop: 20, alignItems: "center" },
  footerText: { color: C.textMuted, fontSize: 11, textAlign: "center", lineHeight: 16, opacity: 0.6 },
});
