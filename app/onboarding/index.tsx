import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Easing,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { C, alpha } from "../../src/constants/colors";
import { useGoogleAuth } from "../../src/hooks/useGoogleAuth";
import { useEmailAuth } from "../../src/hooks/useEmailAuth";
import { OnboardingBg } from "../../src/components/OnboardingBg";
import { useI18n } from "../../src/i18n";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: H, width: W } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn: googleSignIn, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();
  const { authAction: emailAuthAction, isLoading: isEmailLoading, error: emailError } = useEmailAuth();
  const { tx } = useI18n();
  const insets = useSafeAreaInsets();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);

  // Staggered entrance animations
  const a0 = useRef(new Animated.Value(0)).current; // logo
  const a1 = useRef(new Animated.Value(0)).current; // title block
  const a2 = useRef(new Animated.Value(0)).current; // feature cards
  const a3 = useRef(new Animated.Value(0)).current; // form card
  const s0 = useRef(new Animated.Value(44)).current;
  const s1 = useRef(new Animated.Value(32)).current;
  const s2 = useRef(new Animated.Value(28)).current;
  const s3 = useRef(new Animated.Value(72)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const springEase = Easing.out(Easing.back(1.4));
  const cubicEase = Easing.out(Easing.cubic);

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(170, [
      Animated.parallel([
        Animated.timing(a0, { toValue: 1, duration: 700, useNativeDriver: true, easing: springEase }),
        Animated.timing(s0, { toValue: 0, duration: 700, useNativeDriver: true, easing: springEase }),
      ]),
      Animated.parallel([
        Animated.timing(a1, { toValue: 1, duration: 650, useNativeDriver: true, easing: springEase }),
        Animated.timing(s1, { toValue: 0, duration: 650, useNativeDriver: true, easing: springEase }),
      ]),
      Animated.parallel([
        Animated.timing(a2, { toValue: 1, duration: 600, useNativeDriver: true, easing: springEase }),
        Animated.timing(s2, { toValue: 0, duration: 600, useNativeDriver: true, easing: springEase }),
      ]),
      Animated.parallel([
        Animated.timing(a3, { toValue: 1, duration: 700, useNativeDriver: true, easing: cubicEase }),
        Animated.timing(s3, { toValue: 0, duration: 700, useNativeDriver: true, easing: cubicEase }),
      ]),
    ]).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 2600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (!result) return;
    router.replace(result.isNewUser ? "/onboarding/profile-setup" : "/(tabs)");
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    const result = await emailAuthAction(isSignUp ? "signUp" : "signIn", email, password);
    if (!result) return;
    router.replace(result.isNewUser ? "/onboarding/profile-setup" : "/(tabs)");
  };

  const isLoading = isGoogleLoading || isEmailLoading;
  const error = googleError || emailError;
  const FEATURES = [
    { icon: "📊", label: tx("AI\nTracking", "YZ\nTakip") },
    { icon: "🤖", label: tx("Personal\nAI Coach", "Kişisel\nYZ Koçu") },
    { icon: "🏆", label: tx("Compete\n& Earn XP", "Yarış\n& XP Kazan") },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated background orbs + dot grid */}
      <OnboardingBg />

      <View style={{ position: "absolute", top: Math.max(insets.top, 20) + 10, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ─── Hero Section ─── */}
          <View style={styles.heroSection}>

            {/* Logo with glow rings */}
            <Animated.View style={[styles.logoWrapper, { opacity: a0, transform: [{ translateY: s0 }] }]}>
              <View style={styles.glowOuter} />
              <View style={styles.glowMid} />
              <Animated.View style={[styles.logoRing, { transform: [{ scale: pulseAnim }] }]}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </Animated.View>
            </Animated.View>

            {/* Title block */}
            <Animated.View style={[{ alignItems: "center" }, { opacity: a1, transform: [{ translateY: s1 }] }]}>
              <Text style={styles.title}>AXIOM</Text>
              <Text style={styles.subtitle}>{tx("AI Carbon Life Coach", "YZ Karbon Yaşam Koçu")}</Text>
              <Text style={styles.description}>
                {tx("Track your footprint, get AI coaching,\nand build a greener future.", "Ayak izinizi takip edin, YZ koçluğu alın,\nve daha yeşil bir gelecek kurun.")}
              </Text>
            </Animated.View>

            {/* Feature cards */}
            <Animated.View style={[styles.featuresRow, { opacity: a2, transform: [{ translateY: s2 }] }]}>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* ─── Auth Form Card ─── */}
          <Animated.View style={[styles.formCard, { opacity: a3, transform: [{ translateY: s3 }] }]}>

            {/* Tab switcher */}
            <View style={styles.authTabs}>
              <TouchableOpacity
                onPress={() => setIsSignUp(false)}
                style={[styles.authTab, !isSignUp && styles.authTabActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.authTabText, !isSignUp && styles.authTabTextActive]}>
                  {tx("Sign In", "Giriş Yap")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsSignUp(true)}
                style={[styles.authTab, isSignUp && styles.authTabActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.authTabText, isSignUp && styles.authTabTextActive]}>
                  {tx("Create Account", "Hesap Oluştur")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠  {error}</Text>
              </View>
            ) : null}

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputRow, focusedInput === "email" && styles.inputRowFocused]}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  placeholder={tx("Email address", "E-posta adresi")}
                  placeholderTextColor="rgba(217,206,181,0.45)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input}
                  selectionColor={C.accent}
                />
              </View>

              <View style={[styles.inputRow, focusedInput === "password" && styles.inputRowFocused]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  placeholder={tx("Password", "Şifre")}
                  placeholderTextColor="rgba(217,206,181,0.45)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input}
                  selectionColor={C.accent}
                />
              </View>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              onPress={handleEmailAuth}
              disabled={isLoading || !email || !password}
              activeOpacity={0.82}
              style={[styles.primaryBtn, (isLoading || !email || !password) && styles.btnDisabled]}
            >
              <Text style={styles.primaryBtnText}>
                {isEmailLoading
                  ? tx("Processing...", "İşleniyor...")
                  : isSignUp
                  ? tx("Create Account  →", "Hesap Oluştur  →")
                  : tx("Sign In  →", "Giriş Yap  →")}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{tx("OR", "VEYA")}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.82}
              style={[styles.googleBtn, isLoading && styles.btnDisabled]}
            >
              <View style={styles.gIcon}>
                <Text style={styles.gLetter}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>
                 {isGoogleLoading ? tx("Connecting...", "Bağlanıyor...") : tx("Continue with Google", "Google ile devam et")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              {tx("By continuing you agree to our ", "Devam ederek şunları kabul edersiniz: ")}
              <Text style={styles.termsLink}>{tx("Terms", "Şartlar")}</Text>
              {" "}&amp;{" "}
              <Text style={styles.termsLink}>{tx("Privacy Policy", "Gizlilik Politikası")}</Text>
            </Text>
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

  // ── Hero ──
  heroSection: {
    flex: 1,
    minHeight: H * 0.46,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 72,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  logoWrapper: {
    width: 164,
    height: 164,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  glowOuter: {
    position: "absolute",
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: "rgba(201,169,110,0.055)",
  },
  glowMid: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(201,169,110,0.085)",
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: C.accent,
    overflow: "hidden",
    backgroundColor: C.overlay,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    color: C.accent,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 9,
    marginBottom: 6,
  },
  subtitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  description: {
    color: C.textDim,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    opacity: 0.85,
  },
  featuresRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  featureCard: {
    flex: 1,
    backgroundColor: "rgba(26,61,43,0.65)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.14)",
  },
  featureIcon: {
    fontSize: 26,
    marginBottom: 10,
  },
  featureLabel: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 15,
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: C.overlay,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 52,
    // Lift edge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 24,
  },
  authTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(26,61,43,0.55)",
    borderRadius: 18,
    padding: 5,
    marginBottom: 28,
  },
  authTab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 14,
  },
  authTabActive: {
    backgroundColor: C.bgSecondary,
  },
  authTabText: {
    color: C.textDim,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  authTabTextActive: {
    color: C.text,
  },
  errorBox: {
    backgroundColor: "rgba(192,72,46,0.13)",
    borderWidth: 1,
    borderColor: "rgba(192,72,46,0.4)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "500",
  },
  inputGroup: {
    gap: 12,
    marginBottom: 22,
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

  // Buttons
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(217,206,181,0.11)",
  },
  dividerText: {
    color: C.textDim,
    paddingHorizontal: 14,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    opacity: 0.6,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26,61,43,0.8)",
    borderWidth: 1.5,
    borderColor: "rgba(217,206,181,0.18)",
    borderRadius: 17,
    paddingVertical: 16,
    gap: 13,
    marginBottom: 22,
  },
  gIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(245,240,232,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  gLetter: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  googleBtnText: {
    color: C.text,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.15,
  },
  terms: {
    color: C.textDim,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.65,
  },
  termsLink: {
    color: C.accent,
    fontWeight: "600",
    opacity: 1,
  },
});
