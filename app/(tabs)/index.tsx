import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Easing, StatusBar, Dimensions,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C } from "../../src/constants/colors";
import { EmissionBar } from "../../src/components/EmissionBar";
import { AIInsightBanner } from "../../src/components/AIInsightBanner";
import { XPRing } from "../../src/components/XPRing";
import { WeeklyChart } from "../../src/components/WeeklyChart";
import { useCarbonStore } from "../../src/store/carbonStore";
import { useProgressStore } from "../../src/store/progressStore";
import { useAuthStore } from "../../src/store/authStore";
import { useCarbonScore } from "../../src/hooks/useCarbonScore";
import { useProgress } from "../../src/hooks/useProgress";
import { useWeeklyData } from "../../src/hooks/useWeeklyData";
import { useAIInsight } from "../../src/hooks/useAIInsight";
import{ BellIcon, FlameIcon, CameraIcon, CrystalIcon, CalendarIcon,
  CarIcon, UtensilsIcon, PowerIcon, ShoppingBagIcon,
} from "../../src/components/Icons";
import { useI18n } from "../../src/i18n";

// ── Constants ─────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const BUBBLE_SIZE = Math.min(W * 0.62, 240);
const SVG_SIZE    = BUBBLE_SIZE + 90;
const ARC_R       = BUBBLE_SIZE / 2 - 10;
const ARC_STROKE  = 13;
const CIRCUM      = 2 * Math.PI * ARC_R;
const CX          = SVG_SIZE / 2;
const CY          = SVG_SIZE / 2;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function getScoreColor(pct: number) {
  if (pct < 0.4) return C.mint;
  if (pct < 0.7) return C.gold;
  return C.coral;
}

// ── Floating Particle Dot ──────────────────────────────────────────────────
interface DotProps {
  angle: number;
  orbitR: number;
  size?: number;
  delay?: number;
  color: string;
}

function FloatingDot({ angle, orbitR, size = 6, delay = 0, color }: DotProps) {
  const yAnim  = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(yAnim,  { toValue: -11, duration: 2100, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(opAnim, { toValue: 0.72, duration: 2100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(yAnim,  { toValue: 7,   duration: 2100, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(opAnim, { toValue: 0.25, duration: 2100, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const rad = (angle * Math.PI) / 180;
  const left = CX + Math.cos(rad) * orbitR - size / 2;
  const top  = CY + Math.sin(rad) * orbitR - size / 2;

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left,
        top,
        opacity: opAnim,
        transform: [{ translateY: yAnim }],
      }}
    />
  );
}

// ── CO₂ Bubble Hero ────────────────────────────────────────────────────────
interface BubbleProps {
  todayScore: number;
  maxScore?: number;
  tx: (english: string, turkish: string) => string;
}

function CO2Bubble({ todayScore, maxScore = 15, tx }: BubbleProps) {
  const pct   = Math.min(Math.max(todayScore / maxScore, 0), 1);
  const color = getScoreColor(pct);

  // Entry
  const scaleEntry = useRef(new Animated.Value(0.32)).current;
  const entryOp    = useRef(new Animated.Value(0)).current;
  // Concentric pulse rings
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring1Op    = useRef(new Animated.Value(0.22)).current;
  const ring2Op    = useRef(new Animated.Value(0.10)).current;
  // Progress arc
  const arcOffset  = useRef(new Animated.Value(CIRCUM)).current;
  // Count-up
  const countAnim  = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState("0.0");
  // Glow fade
  const glowOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry spring
    Animated.parallel([
      Animated.spring(scaleEntry, { toValue: 1, tension: 44, friction: 7, useNativeDriver: true }),
      Animated.timing(entryOp,   { toValue: 1, duration: 360, useNativeDriver: true }),
    ]).start();

    // Arc fill
    Animated.timing(arcOffset, {
      toValue:  CIRCUM * (1 - pct),
      duration: 1350,
      delay:    450,
      easing:   Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Count-up
    const listenerId = countAnim.addListener(({ value }) => {
      setDisplay(value.toFixed(1));
    });
    Animated.timing(countAnim, {
      toValue:  todayScore,
      duration: 1450,
      delay:    380,
      easing:   Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Glow
    Animated.timing(glowOp, { toValue: 1, duration: 950, delay: 680, useNativeDriver: true }).start();

    // Pulse helper
    const pulse = (
      scale: Animated.Value, op: Animated.Value, maxOp: number, d: number
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(d),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.16, duration: 1900, useNativeDriver: true, easing: Easing.out(Easing.sin) }),
            Animated.timing(op,    { toValue: 0,    duration: 1900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1,    duration: 0, useNativeDriver: true }),
            Animated.timing(op,    { toValue: maxOp, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

    pulse(ring1Scale, ring1Op, 0.22, 250);
    pulse(ring2Scale, ring2Op, 0.10, 1350);

    return () => countAnim.removeListener(listenerId);
  }, [todayScore]);

  const statusLabel =
    pct < 0.4 ? tx("Great Day 🌿", "Harika Gün 🌿") :
    pct < 0.7 ? tx("Moderate ⚡", "Orta ⚡") :
    tx("High Impact 🔴", "Yüksek Etki 🔴");

  const DOT_ORBIT = BUBBLE_SIZE / 2 + 30;
  const DOTS: { angle: number; size: number; delay: number }[] = [
    { angle: -72, size: 7, delay: 0   },
    { angle:  12, size: 5, delay: 520 },
    { angle:  98, size: 8, delay: 940 },
    { angle: 178, size: 5, delay: 280 },
    { angle: 258, size: 6, delay: 710 },
  ];

  const glowInterp = glowOp.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] });

  return (
    <Animated.View style={{
      width:  SVG_SIZE,
      height: SVG_SIZE,
      alignItems: "center",
      justifyContent: "center",
      opacity: entryOp,
      transform: [{ scale: scaleEntry }],
    }}>

      {/* Outermost pulse ring */}
      <Animated.View style={{
        position:    "absolute",
        width:       BUBBLE_SIZE + 60,
        height:      BUBBLE_SIZE + 60,
        borderRadius:(BUBBLE_SIZE + 60) / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity:     ring2Op,
        transform:  [{ scale: ring2Scale }],
      }} />

      {/* Inner pulse ring */}
      <Animated.View style={{
        position:    "absolute",
        width:       BUBBLE_SIZE + 26,
        height:      BUBBLE_SIZE + 26,
        borderRadius:(BUBBLE_SIZE + 26) / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity:     ring1Op,
        transform:  [{ scale: ring1Scale }],
      }} />

      {/* Soft ambient glow */}
      <Animated.View style={{
        position:    "absolute",
        width:       BUBBLE_SIZE + 12,
        height:      BUBBLE_SIZE + 12,
        borderRadius:(BUBBLE_SIZE + 12) / 2,
        backgroundColor: color,
        opacity:     glowInterp,
      }} />

      {/* SVG — track + progress arc + radial fill */}
      <Svg width={SVG_SIZE} height={SVG_SIZE} style={{ position: "absolute" }}>
        <Defs>
          <RadialGradient id="rg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={color} stopOpacity="0.22" />
            <Stop offset="70%"  stopColor={color} stopOpacity="0.07" />
            <Stop offset="100%" stopColor={color} stopOpacity="0"    />
          </RadialGradient>
        </Defs>

        {/* Radial inner glow fill */}
        <Circle
          cx={CX} cy={CY}
          r={ARC_R - ARC_STROKE / 2 - 3}
          fill="url(#rg)"
        />

        {/* Track */}
        <Circle
          cx={CX} cy={CY} r={ARC_R}
          stroke="rgba(214,203,181,0.18)"
          strokeWidth={ARC_STROKE}
          strokeLinecap="round"
          fill="none"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={CX} cy={CY} r={ARC_R}
          stroke={color}
          strokeWidth={ARC_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUM} ${CIRCUM}`}
          strokeDashoffset={arcOffset}
          rotation={-90}
          origin={`${CX}, ${CY}`}
        />
      </Svg>

      {/* Glass inner bubble */}
      <View style={{
        position:     "absolute",
        width:        BUBBLE_SIZE,
        height:       BUBBLE_SIZE,
        borderRadius: BUBBLE_SIZE / 2,
        backgroundColor: "rgba(10,46,31,0.62)",
        borderWidth:  1.5,
        borderColor:  `${color}45`,
        alignItems:   "center",
        justifyContent: "center",
      }}>
        {/* Score number */}
        <Text style={{
          color,
          fontSize:     Math.min(BUBBLE_SIZE * 0.28, 68),
          fontWeight:   "800",
          letterSpacing:-2.5,
          lineHeight:   Math.min(BUBBLE_SIZE * 0.28, 68),
        }}>
          {display}
        </Text>

        {/* Unit */}
        <Text style={{
          color:       C.textMuted,
          fontSize:    12,
          fontWeight:  "600",
          letterSpacing: 0.8,
          marginTop:   5,
          textTransform: "uppercase",
        }}>
          {tx("kg CO₂ today", "kg CO₂ bugün")}
        </Text>

        {/* Status pill */}
        <View style={{
          marginTop:       13,
          paddingHorizontal: 14,
          paddingVertical:  5,
          borderRadius:    20,
          backgroundColor: `${color}1A`,
          borderWidth:     1,
          borderColor:     `${color}50`,
        }}>
          <Text style={{
            color,
            fontSize:    11,
            fontWeight:  "700",
            letterSpacing: 0.3,
          }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Floating particle dots */}
      {DOTS.map((d, i) => (
        <FloatingDot
          key={i}
          angle={d.angle}
          orbitR={DOT_ORBIT}
          size={d.size}
          delay={d.delay}
          color={color}
        />
      ))}
    </Animated.View>
  );
}

// ── Quick actions config ───────────────────────────────────────────────────────
// ── Dashboard Screen ───────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { todayScore, breakdown, weeklyTotal } = useCarbonStore();
  const { totalXp, level, levelName, streakDays } = useProgressStore();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const { tx, language } = useI18n();
  const userId = user?.uid ?? firebaseUid ?? undefined;

  useCarbonScore(userId);
  useProgress(userId);
  const { weeklyData } = useWeeklyData(userId);

  const { insight, fetchInsight, isLoading: insightLoading } = useAIInsight(userId);

  const handleGenerateInsight = () => {
    if (todayScore > 0) {
      fetchInsight({
        date: new Date().toLocaleDateString("en-CA"),
        totalCo2Kg: todayScore,
        breakdown,
        xpEarned: totalXp,
        updatedAt: Date.now(),
      });
    }
  };

  // Header animation
  const headerOp = useRef(new Animated.Value(0)).current;
  const headerTy = useRef(new Animated.Value(-12)).current;

  // Widgets below bubble — 4 staggered sections
  const s = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const t = useRef(Array.from({ length: 4 }, () => new Animated.Value(22))).current;

  useEffect(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerOp, { toValue: 1, duration: 420, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(headerTy, { toValue: 0, duration: 420, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();

    // Lower sections stagger in after bubble has settled (~650 ms offset)
    Animated.stagger(
      110,
      s.map((anim, i) =>
        Animated.parallel([
          Animated.timing(anim,    { toValue: 1, duration: 480, delay: 650, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(t[i],    { toValue: 0, duration: 480, delay: 650, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        ])
      )
    ).start();
  }, []);

  const QUICK_ACTIONS = [
    {
      Icon: CameraIcon,
      label: tx("Scan Food", "Yemek Tara"),
      route: "/food-photo" as const,
      iconBg: "rgba(62,213,152,0.16)",
      iconColor: C.mint,
      desc: tx("AI photo log", "YZ fotoğraf kaydı"),
    },
    {
      Icon: CrystalIcon,
      label: tx("What-If", "Senaryo"),
      route: "/simulator" as const,
      iconBg: "rgba(230,194,122,0.16)",
      iconColor: C.gold,
      desc: tx("Simulate a change", "Bir değişikliği simüle et"),
    },
    {
      Icon: CalendarIcon,
      label: tx("Calendar", "Takvim"),
      route: "/calendar" as const,
      iconBg: "rgba(35,155,107,0.20)",
      iconColor: C.bgAlt,
      desc: tx("Travel CO₂", "Seyahat CO₂"),
    },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12
      ? tx("Good morning", "Günaydın")
      : h < 17
      ? tx("Good afternoon", "Tünaydın")
      : tx("Good evening", "İyi akşamlar");
  })();

  const todayDate = new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerTy }] }]}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.headerTitle}>
              {user?.name ? `${user.name.split(" ")[0]} ${tx("Impact", "Etkisi")}` : tx("Your Impact", "Etkin")}
            </Text>
            <Text style={styles.headerDate}>{todayDate}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={styles.bellBtn}
            activeOpacity={0.75}
          >
            <BellIcon size={20} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── CO₂ Bubble Hero ── */}
        <View style={styles.bubbleWrap}>
          <CO2Bubble todayScore={todayScore} tx={tx} />
        </View>

        {/* ── Streak + XP row ── */}
        <Animated.View style={[styles.row2, { opacity: s[0], transform: [{ translateY: t[0] }] }]}>
          {/* Streak card */}
          <View style={[styles.miniCard, { flex: 1 }]}>
            <View style={{ marginBottom: 6 }}>
              <FlameIcon size={28} color={C.coral} strokeWidth={2} />
            </View>
            <Text style={styles.miniCardValue}>{streakDays}</Text>
            <Text style={styles.miniCardLabel}>{tx("Day Streak", "Gün Serisi")}</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.miniCardSub}>{levelName}</Text>
            <Text style={styles.miniCardSub2}>{weeklyTotal.toFixed(1)} {tx("kg / week", "kg / hafta")}</Text>
          </View>

          {/* XP Ring card */}
          <View style={[styles.miniCard, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
            <XPRing
              currentXp={totalXp}
              xpForNextLevel={100}
              level={level}
              size={108}
              variant="light"
            />
          </View>
        </Animated.View>

        {/* ── Today's Breakdown ── */}
        <Animated.View style={[styles.card, { opacity: s[1], transform: [{ translateY: t[1] }] }]}>
          <Text style={styles.cardTitle}>{tx("Today's Breakdown", "Bugünün Dağılımı")}</Text>
          <EmissionBar Icon={CarIcon}          label={tx("Transport", "Ulaşım")} value={breakdown.transport} maxValue={10} color={C.bgAlt} />
          <EmissionBar Icon={UtensilsIcon}     label={tx("Food", "Yemek")}      value={breakdown.food}      maxValue={10} color={C.gold}  />
          <EmissionBar Icon={PowerIcon}        label={tx("Energy", "Enerji")}    value={breakdown.energy}    maxValue={10} color={C.mint}  />
          <EmissionBar Icon={ShoppingBagIcon}  label={tx("Shopping", "Alışveriş")}  value={breakdown.shopping}  maxValue={10} color={C.coral} />
        </Animated.View>

        {/* ── Weekly Trend ── */}
        <Animated.View style={[{ opacity: s[1], transform: [{ translateY: t[1] }], marginBottom: 14 }]}>
          <WeeklyChart data={weeklyData} maxValue={15} />
        </Animated.View>

        {/* ── AI Insight ── */}
        <Animated.View style={{ opacity: s[2], transform: [{ translateY: t[2] }] }}>
          <Text style={styles.sectionLabel}>{tx("AI Insight", "YZ İçgörüsü")}</Text>
          <AIInsightBanner
            insight={insight?.insight || tx("Log your first activities to unlock personalized AI coaching insights!", "Kişiselleştirilmiş YZ koçluğunu açmak için ilk etkinliklerini kaydet!")}
          />
          {todayScore > 0 && !insight?.insight && (
            <TouchableOpacity 
              style={[styles.refreshBtn, { marginTop: 12 }, insightLoading && styles.refreshBtnLoading]}
              onPress={handleGenerateInsight}
              disabled={insightLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.refreshBtnText}>
                {insightLoading ? tx("Generating...", "Oluşturuluyor...") : tx("✨ Generate Insight", "✨ İçgörü Oluştur")}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View style={{ opacity: s[3], transform: [{ translateY: t[3] }] }}>
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>{tx("Quick Actions", "Hızlı İşlemler")}</Text>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route)}
                style={styles.actionCard}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: a.iconBg }]}>
                  <a.Icon size={22} color={a.iconColor} strokeWidth={2.2} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionDesc}>{a.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CARD = {
  backgroundColor: C.cardDark,
  borderRadius:    22,
  borderWidth:     1.5,
  borderColor:     "rgba(230,194,122,0.12)",
  shadowColor:     "#0A2E1F",
  shadowOffset:    { width: 0, height: 4 },
  shadowOpacity:   0.2,
  shadowRadius:    12,
  elevation:       4,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom:     44,
    paddingTop:        8,
  },

  // Header
  header: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    marginBottom:    6,
    marginTop:       4,
  },
  greeting: {
    color:      C.textMuted,
    fontSize:   13,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerTitle: {
    color:         C.text,
    fontSize:      26,
    fontWeight:    "800",
    letterSpacing: -0.5,
    marginBottom:  2,
  },
  headerDate: {
    color:      C.textMuted,
    fontSize:   12,
    fontWeight: "500",
  },
  bellBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: "rgba(245,240,232,0.07)",
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1,
    borderColor:     "rgba(245,240,232,0.10)",
  },

  // Bubble hero
  bubbleWrap: {
    alignItems:   "center",
    marginTop:    4,
    marginBottom: 6,
  },

  // Streak + XP row
  row2: {
    flexDirection: "row",
    gap:           14,
    marginBottom:  14,
  },
  miniCard: {
    ...CARD,
    padding: 18,
  },
  miniCardValue: {
    color:         C.text,
    fontSize:      36,
    fontWeight:    "800",
    letterSpacing: -1,
    lineHeight:    36,
  },
  miniCardLabel: {
    color:        C.textMuted,
    fontSize:     12,
    fontWeight:   "600",
    marginTop:    4,
    marginBottom: 10,
  },
  dividerLine: {
    height:          1,
    backgroundColor: C.border,
    marginBottom:    8,
  },
  miniCardSub: {
    color:        C.text,
    fontSize:     12,
    fontWeight:   "700",
    marginBottom: 2,
  },
  miniCardSub2: {
    color:      C.textMuted,
    fontSize:   11,
    fontWeight: "500",
  },

  // Generic light card
  card: {
    ...CARD,
    padding:      20,
    marginBottom: 0,
  },
  cardTitle: {
    color:         C.text,
    fontSize:      15,
    fontWeight:    "700",
    marginBottom:  14,
    letterSpacing: 0.1,
  },

  // Section label
  sectionLabel: {
    color:         C.text,
    fontSize:      16,
    fontWeight:    "700",
    marginBottom:  12,
    letterSpacing: 0.1,
  },

  // Quick actions
  actionsRow: {
    flexDirection: "row",
    gap:           12,
    marginBottom:  8,
  },
  actionCard: {
    ...CARD,
    flex:    1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color:      C.text,
    fontSize:   12,
    fontWeight: "700",
    textAlign:  "center",
  },
  actionDesc: {
    color:      C.textMuted,
    fontSize:   10,
    fontWeight: "500",
    textAlign:  "center",
  },
});
