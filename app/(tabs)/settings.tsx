import React, { useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Switch,
  ScrollView, Animated, Easing, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C } from "../../src/constants/colors";
import { AvatarCircle } from "../../src/components/AvatarCircle";
import { useAuthStore } from "../../src/store/authStore";
import { signOut } from "../../src/services/authService";
import { useProgressStore } from "../../src/store/progressStore";
import { useCarbonStore } from "../../src/store/carbonStore";
import {
  UserIcon, MailIcon, MapPinIcon, UtensilsIcon, BellIcon,
  LogOutIcon, CalendarIcon, TrophyIcon, AIIcon, LeafIcon,
} from "../../src/components/Icons";
import { useI18n } from "../../src/i18n";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function SettingRow({
  Icon, label, value, onPress, danger = false, iconColor,
}: {
  Icon: IconComponent;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  iconColor?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[styles.settingRow, danger && styles.settingRowDanger]}
    >
      <View style={[styles.settingIconWrap, danger && styles.settingIconDanger]}>
        <Icon size={18} color={iconColor || C.text} strokeWidth={2} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: C.coral }]}>{label}</Text>
      {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      {onPress && !danger ? <Text style={styles.settingChevron}>›</Text> : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router          = useRouter();
  const user            = useAuthStore((s) => s.user);
  const signOutStore    = useAuthStore((s) => s.signOut);
  const { level, levelName, totalXp, streakDays } = useProgressStore();
  const { weeklyTotal } = useCarbonStore();
  const { language, setLanguage, tx } = useI18n();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
    signOutStore();
    router.replace("/onboarding");
  };

  const handleResetOnboarding = () => {
    signOutStore();
    router.replace("/onboarding");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : "?";

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>{tx("Profile", "Profil")}</Text>
        </Animated.View>

        {/* ── Profile hero card ── */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <AvatarCircle
            initials={initials}
            size={68}
            backgroundColor={C.bg}
            textColor={C.gold}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? tx("User", "Kullanıcı")}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
            <View style={styles.profileBadgeRow}>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>{levelName}</Text>
              </View>
              <View style={[styles.profileBadge, { backgroundColor: "rgba(62,213,152,0.15)" }]}>
                <Text style={[styles.profileBadgeText, { color: C.mint }]}>🔥 {streakDays} {tx("days", "gün")}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Stats row ── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <TrophyIcon size={24} color={C.gold} strokeWidth={2} />
            <Text style={styles.statValue}>{totalXp}</Text>
            <Text style={styles.statLabel}>{tx("Total XP", "Toplam XP")}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMid]}>
            <AIIcon size={24} color={C.gold} strokeWidth={2} />
            <Text style={styles.statValue}>Lv{level}</Text>
            <Text style={styles.statLabel}>{tx("Level", "Seviye")}</Text>
          </View>
          <View style={styles.statCard}>
            <LeafIcon size={24} color={C.mint} strokeWidth={2} />
            <Text style={styles.statValue}>{weeklyTotal.toFixed(0)}</Text>
            <Text style={styles.statLabel}>{tx("kg CO₂/wk", "kg CO₂/hafta")}</Text>
          </View>
        </Animated.View>

        {/* ── Profile section ── */}
        <Text style={styles.sectionHeader}>{tx("Account", "Hesap")}</Text>
        <View style={styles.settingsGroup}>
          <SettingRow Icon={UserIcon} label={tx("Name", "İsim")}  value={user?.name ?? "—"} />
          <View style={styles.rowDivider} />
          <SettingRow Icon={MailIcon} label={tx("Email", "E-posta")} value={user?.email ?? "—"} />
          <View style={styles.rowDivider} />
          <SettingRow Icon={MapPinIcon} label={tx("City", "Şehir")}  value={user?.city ?? "—"} />
          <View style={styles.rowDivider} />
          <SettingRow Icon={UtensilsIcon} label={tx("Diet", "Beslenme")}
            value={user?.dietType ? user.dietType.charAt(0).toUpperCase() + user.dietType.slice(1) : "—"}
          />
        </View>

        {/* ── App section ── */}
        <Text style={styles.sectionHeader}>{tx("App", "Uygulama")}</Text>
        <View style={styles.settingsGroup}>
          <SettingRow Icon={BellIcon} label={tx("Notifications", "Bildirimler")}
            value={user?.notificationsEnabled ? tx("On", "Açık") : tx("Off", "Kapalı")}
          />
          <View style={styles.rowDivider} />
          <SettingRow Icon={MapPinIcon} label={tx("Location", "Konum")}
            value={user?.locationEnabled ? tx("On", "Açık") : tx("Off", "Kapalı")}
          />
          <View style={styles.rowDivider} />
          <SettingRow Icon={CalendarIcon} label={tx("Calendar", "Takvim")}
            value={user?.calendarConnected ? tx("Connected", "Bağlı") : tx("Not connected", "Bağlı değil")}
          />
          <View style={styles.rowDivider} />
          <View style={styles.langRow}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.langIcon}>🌐</Text>
            </View>
            <Text style={styles.settingLabel}>{tx("Language", "Dil")}</Text>
            <Text style={styles.settingValue}>{language === "tr" ? "TR" : "EN"}</Text>
            <Switch
              value={language === "tr"}
              onValueChange={(value) => setLanguage(value ? "tr" : "en")}
              trackColor={{ false: "rgba(168,196,180,0.35)", true: "rgba(62,213,152,0.45)" }}
              thumbColor={C.text}
            />
          </View>
        </View>

        {/* ── Danger zone ── */}
        <Text style={styles.sectionHeader}>{tx("Account", "Hesap")}</Text>
        <View style={styles.settingsGroup}>
          <SettingRow Icon={LogOutIcon} label={tx("Sign Out", "Çıkış Yap")} onPress={handleSignOut} danger iconColor={C.coral} />
        </View>

        {/* Debug */}
        <TouchableOpacity onPress={handleResetOnboarding} style={styles.debugBtn}>
          <Text style={styles.debugTxt}>{tx("Debug: Reset Onboarding", "Hata Ayıklama: Onboarding'i Sıfırla")}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_BASE = {
  backgroundColor: C.cardDark,
  borderRadius: 22,
  borderWidth: 1.5,
  borderColor: "rgba(230,194,122,0.12)",
  shadowColor: "#0A2E1F",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 12,
  elevation: 4,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 8,
  },

  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
    marginTop: 4,
  },

  // Profile card
  profileCard: {
    ...CARD_BASE,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
    marginBottom: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: C.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  profileEmail: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 10,
  },
  profileBadgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  profileBadge: {
    backgroundColor: "rgba(230,194,122,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  profileBadgeText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "700",
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    ...CARD_BASE,
    flex: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statCardMid: {
    borderColor: "rgba(230,194,122,0.35)",
  },
  statValue: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Section header
  sectionHeader: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 4,
  },

  // Settings group card
  settingsGroup: {
    ...CARD_BASE,
    overflow: "hidden",
    marginBottom: 22,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 13,
  },
  settingRowDanger: {
    backgroundColor: "rgba(255,90,60,0.04)",
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  settingIconDanger: {
    backgroundColor: "rgba(255,90,60,0.12)",
  },
  settingLabel: {
    color: C.text,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  settingValue: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  settingChevron: {
    color: C.textMuted,
    fontSize: 22,
    fontWeight: "300",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "rgba(230,194,122,0.1)",
    marginLeft: 62,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 13,
  },
  langIcon: {
    fontSize: 16,
  },

  // Debug
  debugBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  debugTxt: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
  },
});
