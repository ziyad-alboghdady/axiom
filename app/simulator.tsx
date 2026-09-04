import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { C } from "../src/constants/colors";
import { useSimulator } from "../src/hooks/useSimulator";
import { useAuthStore } from "../src/store/authStore";
import { CategoryTabRow } from "../src/components/CategoryTabRow";
import { ConfigCard } from "../src/components/ConfigCard";
import { SimulatorResultCard } from "../src/components/SimulatorResultCard";
import { useI18n } from "../src/i18n";

export default function SimulatorScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const userId = user?.uid ?? firebaseUid ?? undefined;
  const {
    category,
    config,
    result,
    isNegativeScenario,
    isZeroState,
    updateConfig,
    switchCategory,
  } = useSimulator();
  const { tx } = useI18n();

  async function handleCommit() {
    if (!userId) {
      Alert.alert(tx("Sign in required", "Giriş gerekli"), tx("Please sign in first to save commitments.", "Taahhütleri kaydetmek için önce giriş yapın."));
      return;
    }

    // TODO: Dev C — implement saveCommitment(userId, config, result) in src/services/firebase.ts
    // TODO: Dev A — wire useProgress().awardXp() on commit
    // TODO: Dev B — after commit, trigger re-fetch of AI Coach coaching via useGeminiCoach()
    Alert.alert(tx("Committed!", "Kaydedildi!"), `${tx("You'll earn", "Bu ay")} ${result.xpPerMonth} ${tx("pts this month.", "puan kazanacaksın.")}`);
    router.back();
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>{tx("← Back", "← Geri")}</Text>
        </TouchableOpacity>

        <CategoryTabRow
          active={category}
          tabs={["transport", "food", "energy"] as const}
          onChange={switchCategory}
        />

        <Text style={styles.sectionLabel}>{tx("CONFIGURE YOUR CHANGE", "DEĞİŞİKLİĞİNİ AYARLA")}</Text>
        <ConfigCard category={category} config={config} onUpdate={updateConfig} />

        <Text style={styles.sectionLabel}>{tx("IMPACT", "ETKİ")}</Text>
        <SimulatorResultCard result={result} isZeroState={isZeroState} />

        {isNegativeScenario ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
               {tx("This switch increases emissions for your current setup. Results are clamped to zero.", "Bu değişiklik mevcut kurulumunda emisyonu artırıyor. Sonuçlar sıfıra sabitlenir.")}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCommit} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{tx("Commit to this change", "Bu değişikliği uygula")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => switchCategory("transport")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>{tx("Try another scenario", "Başka senaryo dene")}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.textDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionLabel: {
    color: C.bgSecondary,
    fontSize: 12,
    letterSpacing: 0.9,
    fontWeight: "800",
    marginBottom: 10,
  },
  warningCard: {
    backgroundColor: C.cardDark,
    borderColor: C.coral,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    color: C.coral,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: C.bgSecondary,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.textDim,
    alignItems: "center",
    paddingVertical: 13,
  },
  secondaryBtnText: {
    color: C.textDim,
    fontSize: 14,
    fontWeight: "700",
  },
});
