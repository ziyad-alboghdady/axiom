import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, StyleSheet, Animated,
  Easing, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C } from "../../src/constants/colors";
import { FeaturePill } from "../../src/components/FeaturePill";
import { useAuthStore } from "../../src/store/authStore";
import { useActivityLog } from "../../src/hooks/useActivityLog";
import { getSubTypes } from "../../src/services/carbonEngine";
import { CarIcon, UtensilsIcon, PowerIcon, ShoppingBagIcon, CameraIcon } from "../../src/components/Icons";
import type { ActivityCategory } from "../../src/types/carbon";
import { useI18n } from "../../src/i18n";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export default function HabitLoggerScreen() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const userId = user?.uid ?? firebaseUid ?? undefined;
  const { addActivity } = useActivityLog(userId);
  const { tx } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("transport");
  const [selectedSubType,  setSelectedSubType]  = useState<string>("");
  const [value,            setValue]            = useState("");
  const [inputFocused,     setInputFocused]      = useState(false);
  const [isSaving,         setIsSaving]          = useState(false);

  const subTypes    = getSubTypes(selectedCategory);
  const CATEGORIES: {
    key: ActivityCategory;
    Icon: IconComponent;
    label: string;
    color: string;
  }[] = [
    { key: "transport", Icon: CarIcon,          label: tx("Transport", "Ulaşım"), color: C.bgAlt },
    { key: "food",      Icon: UtensilsIcon,     label: tx("Food", "Yemek"),      color: C.gold  },
    { key: "energy",    Icon: PowerIcon,        label: tx("Energy", "Enerji"),    color: C.mint  },
    { key: "shopping",  Icon: ShoppingBagIcon,  label: tx("Shopping", "Alışveriş"),  color: C.coral },
  ];
  const UNIT_MAP: Record<ActivityCategory, string> = {
    transport: "km",
    food:      tx("portions", "porsiyon"),
    energy:    "kWh",
    shopping:  tx("items", "adet"),
  };
  const activeColor = CATEGORIES.find((c) => c.key === selectedCategory)?.color ?? C.bgAlt;
  const formatSubType = (st: string) => {
    const SUBTYPE_TRANSLATIONS: Record<string, { en: string; tr: string }> = {
      walking: { en: "Walking", tr: "Yürüyüş" },
      cycling: { en: "Cycling", tr: "Bisiklet" },
      bus: { en: "Bus", tr: "Otobüs" },
      train: { en: "Train", tr: "Tren" },
      car: { en: "Car", tr: "Araba" },
      motorbike: { en: "Motorbike", tr: "Motosiklet" },
      car_shared: { en: "Car Shared", tr: "Araç Paylaşımı" },
      short_flight: { en: "Short Flight", tr: "Kısa Uçuş" },
      long_flight: { en: "Long Flight", tr: "Uzun Uçuş" },
      beef: { en: "Beef", tr: "Sığır Eti" },
      lamb: { en: "Lamb", tr: "Kuzu Eti" },
      pork: { en: "Pork", tr: "Domuz Eti" },
      chicken: { en: "Chicken", tr: "Tavuk" },
      fish: { en: "Fish", tr: "Balık" },
      vegetarian: { en: "Vegetarian", tr: "Vejetaryen" },
      vegan: { en: "Vegan", tr: "Vegan" },
      lentils: { en: "Lentils", tr: "Mercimek" },
      electricity: { en: "Electricity", tr: "Elektrik" },
      heating_gas: { en: "Heating Gas", tr: "Doğalgaz" },
      heating_oil: { en: "Heating Oil", tr: "Kalorifer Yakıtı" },
      short_shower: { en: "Short Shower", tr: "Kısa Duş" },
      long_shower: { en: "Long Shower", tr: "Uzun Duş" },
      eco_mode: { en: "Eco Mode", tr: "Eko Modu" },
      standby: { en: "Standby", tr: "Bekleme Modu" },
      devices_off: { en: "Devices Off", tr: "Cihazlar Kapalı" },
      clothing: { en: "Clothing", tr: "Giyim" },
      electronics: { en: "Electronics", tr: "Elektronik" },
      furniture: { en: "Furniture", tr: "Mobilya" },
      general: { en: "General", tr: "Genel" },
      fast_fashion: { en: "Fast Fashion", tr: "Hızlı Moda" },
      secondhand: { en: "Secondhand", tr: "İkinci El" },
    };

    const t = SUBTYPE_TRANSLATIONS[st];
    if (t) return tx(t.en, t.tr);

    return st
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Fade in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim= useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);

  const handleLog = async () => {
    if (!userId) {
      Alert.alert(tx("Sign in required", "Giriş gerekli"), tx("Please sign in to log your activities.", "Etkinliklerinizi kaydetmek için lütfen giriş yapın."));
      return;
    }
    if (!selectedSubType || !value.trim()) {
      Alert.alert(tx("Missing info", "Eksik bilgi"), tx("Select a type and enter a value.", "Bir tür seçin ve değer girin."));
      return;
    }
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      Alert.alert(tx("Invalid amount", "Geçersiz miktar"), tx("Enter a valid number greater than 0.", "0'dan büyük geçerli bir sayı girin."));
      return;
    }
    setIsSaving(true);
    const result = await addActivity(selectedCategory, selectedSubType, parsedValue);
    setIsSaving(false);
    if (result) {
      Alert.alert(tx("Logged! ✅", "Kaydedildi! ✅"), `+${result.co2Kg.toFixed(2)} kg CO₂ ${tx("added", "eklendi")}`);
      setValue("");
      setSelectedSubType("");
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>{tx("Log Activity", "Etkinlik Kaydet")}</Text>
          <Text style={styles.subtitle}>{tx("What did you do today?", "Bugün ne yaptın?")}</Text>
        </Animated.View>

        {/* ── Category grid ── */}
        <Text style={styles.sectionLabel}>{tx("Category", "Kategori")}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => { setSelectedCategory(cat.key); setSelectedSubType(""); }}
                activeOpacity={0.8}
                style={[
                  styles.catCard,
                  active && { borderColor: cat.color, borderWidth: 2, backgroundColor: C.bg },
                ]}
              >
                <cat.Icon size={28} color={active ? cat.color : C.textMuted} strokeWidth={2} />
                <Text style={[styles.catLabel, active && { color: cat.color, fontWeight: "700" }]}>
                  {cat.label}
                </Text>
                {active && <View style={[styles.catDot, { backgroundColor: cat.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Type pills ── */}
        <Text style={styles.sectionLabel}>{tx("Type", "Tür")}</Text>
        <View style={styles.card}>
          <View style={styles.pillsWrap}>
            {subTypes.map((st) => (
              <FeaturePill
                key={st}
                label={formatSubType(st)}
                selected={selectedSubType === st}
                onPress={() => setSelectedSubType(st)}
                variant="light"
              />
            ))}
          </View>
        </View>

        {/* ── Amount input ── */}
        <Text style={styles.sectionLabel}>
          {tx("Amount", "Miktar")}{" "}
          <Text style={styles.unitHint}>({UNIT_MAP[selectedCategory]})</Text>
        </Text>
        <View style={[styles.inputCard, inputFocused && { borderColor: activeColor }]}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={`${tx("Enter", "Gir")} ${UNIT_MAP[selectedCategory]}`}
            placeholderTextColor={C.textDarkMuted}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            selectionColor={activeColor}
          />
          {value ? (
            <Text style={[styles.inputUnit, { color: activeColor }]}>
              {UNIT_MAP[selectedCategory]}
            </Text>
          ) : null}
        </View>

        {/* ── Log button ── */}
        <TouchableOpacity
          onPress={handleLog}
          disabled={!selectedSubType || !value || isSaving}
          activeOpacity={0.85}
          style={[
            styles.logBtn,
            { backgroundColor: activeColor },
            (!selectedSubType || !value || isSaving) && styles.logBtnDisabled,
          ]}
        >
          <Text style={styles.logBtnText}>
              {isSaving ? tx("Logging...", "Kaydediliyor...") : tx("Log Activity  +", "Etkinlik Kaydet  +")}
          </Text>
        </TouchableOpacity>

        {/* ── Scan food shortcut ── */}
        <TouchableOpacity
          onPress={() => router.push("/food-photo")}
          style={styles.scanCard}
          activeOpacity={0.8}
        >
          <View style={styles.scanIconWrap}>
            <CameraIcon size={24} color={C.text} strokeWidth={2} />
          </View>
          <View style={styles.scanText}>
             <Text style={styles.scanTitle}>{tx("Scan Food Photo", "Yemek Fotoğrafı Tara")}</Text>
             <Text style={styles.scanDesc}>{tx("AI-powered carbon analysis in seconds", "Saniyeler içinde yapay zeka karbon analizi")}</Text>
          </View>
          <Text style={styles.scanArrow}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_BASE = {
  backgroundColor: C.cardDark,
  borderRadius: 20,
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
    paddingBottom: 40,
    paddingTop: 8,
  },

  // Header
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
    marginTop: 4,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 28,
  },

  sectionLabel: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 4,
  },
  unitHint: {
    color: C.textMuted,
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
    fontSize: 12,
  },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  catCard: {
    ...CARD_BASE,
    flex: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  catLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  catDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },

  // Pills card
  card: {
    ...CARD_BASE,
    padding: 16,
    marginBottom: 24,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // Input
  inputCard: {
    ...CARD_BASE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    backgroundColor: C.surface,
    borderColor: C.border,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 14,
    letterSpacing: -0.3,
    color: C.textDark,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: C.textMuted,
  },

  // Log button
  logBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  logBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  logBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Scan shortcut
  scanCard: {
    ...CARD_BASE,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderColor: "rgba(230,194,122,0.35)",
  },
  scanIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  scanDesc: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "400",
  },
  scanArrow: {
    color: C.gold,
    fontSize: 28,
    fontWeight: "300",
  },
});
