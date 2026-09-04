import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { C } from "../../src/constants/colors";
import { StepDots } from "../../src/components/StepDots";
import { OnboardingBg } from "../../src/components/OnboardingBg";
import { useAuthStore } from "../../src/store/authStore";
import { updateUserProfile } from "../../src/services/userService";
import { useI18n } from "../../src/i18n";

interface PermRow {
  icon: string;
  title: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  color: string;
}

function PermissionCard({ icon, title, desc, value, onToggle, color }: PermRow) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = (v: boolean) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(v);
  };

  return (
    <Animated.View
      style={[
        styles.permCard,
        value && styles.permCardActive,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Icon bubble */}
      <View style={[styles.permIconBubble, value && { backgroundColor: color + "22" }]}>
        <Text style={styles.permIcon}>{icon}</Text>
      </View>

      {/* Text */}
      <View style={styles.permText}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{desc}</Text>
      </View>

      {/* Toggle */}
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{
          false: "rgba(26,61,43,0.9)",
          true: color + "55",
        }}
        thumbColor={value ? color : C.textDim}
        ios_backgroundColor="rgba(26,61,43,0.9)"
      />
    </Animated.View>
  );
}

export default function PermissionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { tx } = useI18n();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarEnabled, setCalendarEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Animations
  const aHeader = useRef(new Animated.Value(0)).current;
  const aCards = useRef(new Animated.Value(0)).current;
  const aBtn = useRef(new Animated.Value(0)).current;
  const sHeader = useRef(new Animated.Value(32)).current;
  const sCards = useRef(new Animated.Value(48)).current;
  const sBtn = useRef(new Animated.Value(28)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const springEase = Easing.out(Easing.back(1.3));

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(aHeader, { toValue: 1, duration: 650, useNativeDriver: true, easing: springEase }),
        Animated.timing(sHeader, { toValue: 0, duration: 650, useNativeDriver: true, easing: springEase }),
      ]),
      Animated.parallel([
        Animated.timing(aCards, { toValue: 1, duration: 680, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(sCards, { toValue: 0, duration: 680, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(aBtn, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(sBtn, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  const handleToggleLocation = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === "granted");
    } else {
      setLocationEnabled(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleFinish = async () => {
    if (!user) {
      setOnboardingComplete();
      router.replace("/(tabs)");
      return;
    }
    setIsSaving(true);
    try {
      let pushToken = undefined;
      if (notificationsEnabled) {
        try {
          if (Constants.appOwnership !== "expo") {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            pushToken = tokenData.data;
          }
        } catch (e) {
          console.warn("Push token error", e);
        }
      }
      await updateUserProfile(user.uid, {
        locationEnabled,
        notificationsEnabled,
        calendarConnected: calendarEnabled,
        ...(pushToken ? { pushToken } : {}),
      });
      updateProfile({
        locationEnabled,
        notificationsEnabled,
        calendarConnected: calendarEnabled,
        ...(pushToken ? { pushToken } : {}),
      });
      setOnboardingComplete();
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Permissions save error", e);
      setOnboardingComplete();
      router.replace("/(tabs)");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <OnboardingBg />

      <View style={styles.inner}>
        {/* ─── Header ─── */}
        <Animated.View style={[styles.header, { opacity: aHeader, transform: [{ translateY: sHeader }] }]}>
          {/* Big icon */}
          <Animated.View style={[styles.bigIconWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.bigIconGlow} />
            <View style={styles.bigIconRing}>
              <Text style={styles.bigIconEmoji}>🌿</Text>
            </View>
          </Animated.View>

          <Text style={styles.headerTitle}>{tx("Almost there", "Neredeyse bitti")}</Text>
          <Text style={styles.headerSubtitle}>
            {tx("Enable permissions for the full Axiom experience", "Axiom'u tam deneyimlemek için izinleri aç")}
          </Text>

          <View style={styles.stepRow}>
            <StepDots totalSteps={3} currentStep={2} />
            <Text style={styles.stepLabel}>{tx("Step 2 of 3", "Adım 2 / 3")}</Text>
          </View>
        </Animated.View>

        {/* ─── Permission Cards ─── */}
        <Animated.View style={[styles.cardsSection, { opacity: aCards, transform: [{ translateY: sCards }] }]}>
          <PermissionCard
            icon="📍"
            title={tx("Location", "Konum")}
            desc={tx("Auto-detect transport for emission tracking", "Emisyon takibi için ulaşımı otomatik algıla")}
            value={locationEnabled}
            onToggle={handleToggleLocation}
            color={C.success}
          />
          <PermissionCard
            icon="🔔"
            title={tx("Notifications", "Bildirimler")}
            desc={tx("Daily reminders and AI coaching nudges", "Günlük hatırlatmalar ve YZ koçluğu önerileri")}
            value={notificationsEnabled}
            onToggle={handleToggleNotifications}
            color={C.accent}
          />
          <PermissionCard
            icon="📅"
            title={tx("Google Calendar", "Google Takvim")}
            desc={tx("Analyze travel emissions from your events", "Etkinliklerindeki seyahat emisyonlarını analiz et")}
            value={calendarEnabled}
            onToggle={setCalendarEnabled}
            color={C.bgSecondary}
          />
        </Animated.View>

        {/* ─── CTA ─── */}
        <Animated.View style={[styles.btnSection, { opacity: aBtn, transform: [{ translateY: sBtn }] }]}>
          <View style={styles.skipHint}>
            <Text style={styles.skipHintText}>
              {tx("You can always change these in Settings", "Bunları her zaman Ayarlar'dan değiştirebilirsin")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleFinish}
            disabled={isSaving}
            activeOpacity={0.82}
            style={[styles.primaryBtn, isSaving && styles.btnDisabled]}
          >
            {isSaving ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={styles.primaryBtnText}>{tx("Starting journey...", "Yolculuk başlatılıyor...")}</Text>
              </Animated.View>
            ) : (
               <Text style={styles.primaryBtnText}>{tx("Start My Journey  🌿", "Yolculuğumu Başlat  🌿")}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 44,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  bigIconWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  bigIconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(44,160,110,0.1)",
  },
  bigIconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: C.success,
    backgroundColor: "rgba(44,160,110,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  bigIconEmoji: {
    fontSize: 38,
  },
  headerTitle: {
    color: C.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    color: C.textDim,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    opacity: 0.85,
    marginBottom: 22,
    maxWidth: 280,
  },
  stepRow: {
    alignItems: "center",
    gap: 8,
  },
  stepLabel: {
    color: C.textDim,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.6,
    marginTop: 8,
  },

  // ── Permission Cards ──
  cardsSection: {
    flex: 1,
    gap: 13,
  },
  permCard: {
    backgroundColor: "rgba(26,61,43,0.75)",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  permCardActive: {
    backgroundColor: "rgba(10,46,31,0.9)",
    borderColor: "rgba(201,169,110,0.25)",
  },
  permIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(245,240,232,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  permIcon: {
    fontSize: 24,
  },
  permText: {
    flex: 1,
    paddingRight: 10,
  },
  permTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  permDesc: {
    color: C.textDim,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.8,
  },

  // ── CTA ──
  btnSection: {
    paddingTop: 20,
  },
  skipHint: {
    alignItems: "center",
    marginBottom: 16,
  },
  skipHintText: {
    color: C.textDim,
    fontSize: 12,
    opacity: 0.55,
    letterSpacing: 0.1,
  },
  primaryBtn: {
    backgroundColor: C.bgSecondary,
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(44,160,110,0.3)",
  },
  primaryBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
});
