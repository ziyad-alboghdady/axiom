import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { C } from "../../src/constants/colors";
import { FeaturePill } from "../../src/components/FeaturePill";
import { StepDots } from "../../src/components/StepDots";
import { OnboardingBg } from "../../src/components/OnboardingBg";
import { useAuthStore } from "../../src/store/authStore";
import { createUserProfile } from "../../src/services/userService";
import type { DietType, CommuteType } from "../../src/types/user";
import { useI18n } from "../../src/i18n";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const firebaseEmail = useAuthStore((s) => s.firebaseEmail);
  const firebaseDisplayName = useAuthStore((s) => s.firebaseDisplayName);
  const firebasePhotoUrl = useAuthStore((s) => s.firebasePhotoUrl);
  const setUser = useAuthStore((s) => s.setUser);
  const { tx } = useI18n();

  const [name, setName] = useState(firebaseDisplayName ?? "");
  const [city, setCity] = useState("");
  const [diet, setDiet] = useState<DietType>("omnivore");
  const [commute, setCommute] = useState<CommuteType>("bus");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<"name" | "city" | null>(null);

  const isValid = name.trim().length >= 2 && city.trim().length >= 2;
  const DIET_OPTIONS: { key: DietType; label: string; icon: string }[] = [
    { key: "omnivore", label: tx("Omnivore", "Omnivor"), icon: "🥩" },
    { key: "vegetarian", label: tx("Vegetarian", "Vejetaryen"), icon: "🥗" },
    { key: "vegan", label: tx("Vegan", "Vegan"), icon: "🌱" },
  ];

  const COMMUTE_OPTIONS: { key: CommuteType; label: string; icon: string }[] = [
    { key: "walking", label: tx("Walking", "Yürüyüş"), icon: "🚶" },
    { key: "bike", label: tx("Bike", "Bisiklet"), icon: "🚲" },
    { key: "bus", label: tx("Bus", "Otobüs"), icon: "🚌" },
    { key: "train", label: tx("Train", "Tren"), icon: "🚆" },
    { key: "car", label: tx("Car", "Araba"), icon: "🚗" },
  ];

  // Animations
  const aHeader = useRef(new Animated.Value(0)).current;
  const aForm = useRef(new Animated.Value(0)).current;
  const sHeader = useRef(new Animated.Value(30)).current;
  const sForm = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const springEase = Easing.out(Easing.back(1.3));

  useEffect(() => {
    Animated.stagger(140, [
      Animated.parallel([
        Animated.timing(aHeader, { toValue: 1, duration: 650, useNativeDriver: true, easing: springEase }),
        Animated.timing(sHeader, { toValue: 0, duration: 650, useNativeDriver: true, easing: springEase }),
      ]),
      Animated.parallel([
        Animated.timing(aForm, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(sForm, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  const handleNext = async () => {
    if (!firebaseUid || !isValid) return;
    setIsSaving(true);
    setError(null);
    try {
      const profileData: any = {
        email: firebaseEmail ?? "",
        name: name.trim(),
        city: city.trim(),
        dietType: diet,
        commuteType: commute,
        calendarConnected: false,
        locationEnabled: false,
        notificationsEnabled: false,
      };
      if (firebasePhotoUrl) profileData.photoUrl = firebasePhotoUrl;
      const profile = await createUserProfile(firebaseUid, profileData);
      setUser(profile);
      router.push("/onboarding/permissions");
    } catch (err: any) {
      setError(err.message ?? tx("Failed to save profile", "Profil kaydedilemedi"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <OnboardingBg />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Header ─── */}
          <Animated.View style={[styles.header, { opacity: aHeader, transform: [{ translateY: sHeader }] }]}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
                {firebasePhotoUrl ? (
                  <Image source={{ uri: firebasePhotoUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </View>
                )}
              </Animated.View>
            </View>

            <Text style={styles.headerTitle}>{tx("About You", "Hakkında")}</Text>
            <Text style={styles.headerSubtitle}>{tx("Help us personalize your AI coaching", "YZ koçluğunu kişiselleştirmemize yardımcı ol")}</Text>

            <View style={styles.stepRow}>
              <StepDots totalSteps={3} currentStep={1} />
              <Text style={styles.stepLabel}>{tx("Step 1 of 3", "Adım 1 / 3")}</Text>
            </View>
          </Animated.View>

          {/* ─── Form Card ─── */}
          <Animated.View style={[styles.formCard, { opacity: aForm, transform: [{ translateY: sForm }] }]}>

            {/* Name + City */}
             <Text style={styles.sectionLabel}>{tx("YOUR INFO", "BİLGİLERİN")}</Text>
            <View style={styles.inputGroup}>
              <View style={[styles.inputRow, focusedInput === "name" && styles.inputRowFocused]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                   placeholder={tx("Your name", "Adın")}
                  placeholderTextColor="rgba(217,206,181,0.45)"
                  autoCapitalize="words"
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input}
                  selectionColor={C.accent}
                />
              </View>

              <View style={[styles.inputRow, focusedInput === "city" && styles.inputRowFocused]}>
                <Text style={styles.inputIcon}>🏙</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                   placeholder={tx("Your city  (e.g. Dubai, London)", "Şehrin  (örn. İstanbul, Ankara)")}
                  placeholderTextColor="rgba(217,206,181,0.45)"
                  autoCapitalize="words"
                  onFocus={() => setFocusedInput("city")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input}
                  selectionColor={C.accent}
                />
              </View>
            </View>

            {/* Diet */}
             <Text style={styles.sectionLabel}>{tx("DIET", "BESLENME")}</Text>
            <View style={styles.pillsRow}>
              {DIET_OPTIONS.map((d) => (
                <FeaturePill
                  key={d.key}
                  label={`${d.icon} ${d.label}`}
                  selected={diet === d.key}
                  onPress={() => setDiet(d.key)}
                />
              ))}
            </View>

            {/* Commute */}
             <Text style={styles.sectionLabel}>{tx("DAILY COMMUTE", "GÜNLÜK ULAŞIM")}</Text>
            <View style={styles.pillsRow}>
              {COMMUTE_OPTIONS.map((c) => (
                <FeaturePill
                  key={c.key}
                  label={`${c.icon} ${c.label}`}
                  selected={commute === c.key}
                  onPress={() => setCommute(c.key)}
                />
              ))}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠  {error}</Text>
              </View>
            ) : null}

            {/* Continue */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!isValid || isSaving}
              activeOpacity={0.82}
              style={[styles.primaryBtn, (!isValid || isSaving) && styles.btnDisabled]}
            >
              {isSaving ? (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                   <Text style={styles.primaryBtnText}>{tx("Saving Profile...", "Profil Kaydediliyor...")}</Text>
                </Animated.View>
              ) : (
                 <Text style={styles.primaryBtnText}>{tx("Continue  →", "Devam Et  →")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    paddingTop: 72,
    paddingBottom: 32,
    paddingHorizontal: 28,
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  avatarGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(201,169,110,0.07)",
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: C.accent,
    overflow: "hidden",
    backgroundColor: C.overlay,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.card,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    color: C.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 6,
    textAlign: "center",
  },
  headerSubtitle: {
    color: C.textDim,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.85,
  },
  stepRow: {
    alignItems: "center",
    gap: 10,
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

  // ── Form Card ──
  formCard: {
    backgroundColor: C.overlay,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  sectionLabel: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  inputGroup: {
    gap: 11,
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,61,43,0.85)",
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 17,
  },
  inputRowFocused: {
    borderColor: C.accent,
    backgroundColor: "rgba(10,46,31,0.92)",
  },
  inputIcon: {
    fontSize: 15,
    marginRight: 11,
    opacity: 0.55,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 17,
    letterSpacing: 0.2,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 28,
  },
  errorBox: {
    backgroundColor: "rgba(192,72,46,0.13)",
    borderWidth: 1,
    borderColor: "rgba(192,72,46,0.4)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "500",
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: C.bg,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  btnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
});
