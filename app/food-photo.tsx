/**
 * S-06 FoodPhotoScreen
 *
 * Take a photo of food and analyze CO₂ via Gemini Vision.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { C, alpha } from "../src/constants/colors";
import { useFoodAnalyzer } from "../src/hooks/useFoodAnalyzer";
import { useActivityLog } from "../src/hooks/useActivityLog";
import { AIInsightBanner } from "../src/components/AIInsightBanner";
import { useAuthStore } from "../src/store/authStore";
import { useI18n } from "../src/i18n";

const CAMERA_HEIGHT = 360;
const HEALTH_COLOR = {
  good: C.mint,
  moderate: C.gold,
  poor: C.coral,
} as const;

function toTitleCase(label: string) {
  return label
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function FoodPhotoScreen() {
  const router = useRouter();
  const { analysis, isLoading, error, analyzePhoto, reset } = useFoodAnalyzer();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const userId = user?.uid ?? firebaseUid ?? undefined;
  const { tx } = useI18n();
  const { addActivity } = useActivityLog(userId);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Animations
  const cardOp = useRef(new Animated.Value(0)).current;
  const cardTy = useRef(new Animated.Value(22)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOp, { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(cardTy, { toValue: 0, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  const handleCapture = async () => {
    if (!userId) {
      Alert.alert(tx("Sign in required", "Giriş gerekli"), tx("Please sign in to scan and log food.", "Yemeği tarayıp kaydetmek için lütfen giriş yapın."));
      return;
    }
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    if (!cameraRef.current || isLoading || isCapturing || photoUri) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error(tx("Could not read image data.", "Görüntü verisi okunamadı."));
      }

      setPhotoUri(photo.uri);
      const result = await analyzePhoto(photo.base64);
      if (result) {
        const aiAnalysis = JSON.stringify({
          foodItems: result.foodItems,
          totalCo2Kg: result.totalCo2Kg,
          healthRating: result.healthRating,
          suggestion: result.suggestion,
        });

        const saved = await addActivity("food", "photo_scan", 1, "photo", {
          aiAnalysis,
          co2KgOverride: result.totalCo2Kg,
        });

        if (!saved) {
          Alert.alert(tx("Save failed", "Kayıt başarısız"), tx("We couldn't save this scan to your activities.", "Bu taramayı etkinliklerinize kaydedemedik."));
        }
      }
    } catch (err) {
      Alert.alert(
        tx("Capture failed", "Yakalama başarısız"),
        err instanceof Error ? err.message : tx("Unable to capture or analyze the photo.", "Fotoğraf yakalanamadı veya analiz edilemedi.")
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    reset();
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, CAMERA_HEIGHT - 12],
  });

  const canUseCamera = permission?.granted;
  const busy = isLoading || isCapturing;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back button ── */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>{tx("← Back", "← Geri")}</Text>
        </TouchableOpacity>

        {/* ── Camera Card ── */}
        <Animated.View style={[styles.cameraCard, { opacity: cardOp, transform: [{ translateY: cardTy }] }]}>
          {canUseCamera ? (
            <View style={styles.cameraFrame}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              ) : (
                <CameraView ref={cameraRef} style={styles.camera} facing="back" />
              )}

              {/* Scan line */}
              {!photoUri && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
              )}

              {/* Frame corners */}
              <View style={styles.frameOverlay} pointerEvents="none">
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </View>
          ) : (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionEmoji}>📷</Text>
               <Text style={styles.permissionTitle}>{tx("Camera access needed", "Kamera erişimi gerekli")}</Text>
               <Text style={styles.permissionDesc}>
                 {tx("Enable camera permissions to scan and analyze your food.", "Yemeğinizi tarayıp analiz etmek için kamera izinlerini açın.")}
               </Text>
               <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn} activeOpacity={0.85}>
                 <Text style={styles.permissionBtnText}>{tx("Enable Camera", "Kamerayı Etkinleştir")}</Text>
               </TouchableOpacity>
            </View>
          )}

          {/* Actions */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleCapture}
              disabled={!canUseCamera || busy || !!photoUri}
              activeOpacity={0.85}
              style={[
                styles.captureBtn,
                (!canUseCamera || busy || !!photoUri) && styles.captureBtnDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color={C.text} />
              ) : (
                 <Text style={styles.captureBtnText}>{tx("Capture & Analyze", "Yakala ve Analiz Et")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {photoUri && !busy ? (
            <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn} activeOpacity={0.85}>
               <Text style={styles.retakeBtnText}>{tx("Retake Photo", "Fotoğrafı Yeniden Çek")}</Text>
            </TouchableOpacity>
          ) : null}
        </Animated.View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Analysis Result */}
        {analysis && (
          <>
            <AIInsightBanner
               insight={`${tx("Total food CO₂:", "Toplam yemek CO₂:")} ${analysis.totalCo2Kg.toFixed(2)} kg · ${tx("Health:", "Sağlık:")} ${analysis.healthRating}`}
            />

            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                 <Text style={styles.resultTitle}>{tx("Scan Summary", "Tarama Özeti")}</Text>
                <View style={[styles.healthPill, { borderColor: HEALTH_COLOR[analysis.healthRating] }]}>
                  <Text style={[styles.healthPillText, { color: HEALTH_COLOR[analysis.healthRating] }]}>
                    {analysis.healthRating.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.resultValue}>{analysis.totalCo2Kg.toFixed(2)}</Text>
               <Text style={styles.resultUnit}>{tx("kg CO₂ estimated", "kg CO₂ tahmini")}</Text>
            </View>

             <Text style={styles.sectionLabel}>{tx("Items Detected", "Tespit Edilen Öğeler")}</Text>
            {analysis.foodItems.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View>
                  <Text style={styles.itemName}>{toTitleCase(item.name)}</Text>
                  <Text style={styles.itemQty}>{item.quantity}</Text>
                </View>
                <Text style={styles.itemCo2}>{item.co2Kg.toFixed(2)} kg</Text>
              </View>
            ))}

            <View style={styles.tipCard}>
               <Text style={styles.tipTitle}>{tx("Lower-Carbon Tip", "Düşük Karbon İpucu")}</Text>
              <Text style={styles.tipText}>💡 {analysis.suggestion}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_BASE = {
  backgroundColor: C.cardDark,
  borderRadius: 22,
  borderWidth: 1.5,
  borderColor: alpha.gold15,
  shadowColor: "#0A2E1F",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 6,
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
  cameraCard: {
    ...CARD_BASE,
    padding: 14,
    marginBottom: 20,
  },
  cameraFrame: {
    height: CAMERA_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: alpha.gold25,
    backgroundColor: C.overlay,
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  scanLine: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 2,
    backgroundColor: C.neon,
    opacity: 0.6,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: C.goldBright,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  captureBtn: {
    backgroundColor: C.bgAlt,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: C.bgAlt,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  captureBtnText: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  captureBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  retakeBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  retakeBtnText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  permissionCard: {
    height: CAMERA_HEIGHT,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: alpha.gold25,
    backgroundColor: C.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  permissionEmoji: {
    fontSize: 38,
    marginBottom: 6,
  },
  permissionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },
  permissionDesc: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  permissionBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
  },
  permissionBtnText: {
    color: C.bg,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  errorCard: {
    ...CARD_BASE,
    borderColor: alpha.coral35,
    backgroundColor: "rgba(192,72,46,0.16)",
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    color: C.coral,
    fontSize: 13,
    fontWeight: "600",
  },
  resultCard: {
    ...CARD_BASE,
    padding: 18,
    marginTop: 14,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
  },
  healthPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  healthPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  resultValue: {
    color: C.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  resultUnit: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  itemRow: {
    ...CARD_BASE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  itemQty: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  itemCo2: {
    color: C.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  tipCard: {
    ...CARD_BASE,
    padding: 16,
    marginTop: 10,
    borderColor: alpha.mint10,
  },
  tipTitle: {
    color: C.mint,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  tipText: {
    color: C.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
