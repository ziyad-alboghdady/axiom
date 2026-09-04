import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../constants/colors";
import type { ActivityCategory } from "../types/carbon";
import type { SimulatorConfig } from "../types/simulator";
import { useI18n } from "../i18n";

const SliderModule = (() => {
  try {
    return require("@react-native-community/slider");
  } catch {
    return null;
  }
})();

const SliderComponent = SliderModule?.default ?? null;

interface ConfigCardProps {
  category: ActivityCategory;
  config: SimulatorConfig;
  onUpdate: (partial: Partial<SimulatorConfig>) => void;
}

const OPTIONS = {
  transport: {
    from: ["car", "bus", "motorbike"],
    to: ["walking", "cycling", "bus", "train"],
  },
  food: {
    from: ["beef", "lamb", "pork", "chicken", "fish"],
    to: ["vegetarian", "vegan", "chicken", "lentils", "fish"],
  },
  energy: {
    from: ["heating_gas", "long_shower", "standby"],
    to: ["eco_mode", "short_shower", "devices_off"],
  },
} as const;

function formatLabel(value: string): string {
  const labelMap: Record<string, string> = {
    heating_gas: "Heating on",
    eco_mode: "Eco mode",
    long_shower: "Long shower",
    short_shower: "Short shower",
    standby: "Standby devices",
    devices_off: "Devices off",
  };
  if (labelMap[value]) return labelMap[value];
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLabelTr(value: string): string {
  const labelMap: Record<string, string> = {
    heating_gas: "Isıtma açık",
    eco_mode: "Eko mod",
    long_shower: "Uzun duş",
    short_shower: "Kısa duş",
    standby: "Bekleme cihazları",
    devices_off: "Cihazlar kapalı",
    car: "Araba",
    bus: "Otobüs",
    motorbike: "Motosiklet",
    walking: "Yürüyüş",
    cycling: "Bisiklet",
    train: "Tren",
    beef: "Sığır eti",
    lamb: "Kuzu",
    pork: "Domuz",
    chicken: "Tavuk",
    fish: "Balık",
    vegetarian: "Vejetaryen",
    vegan: "Vegan",
    lentils: "Mercimek",
  };
  if (labelMap[value]) return labelMap[value];
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

async function triggerStepHaptic() {
  try {
    const moduleName = "expo-haptics";
    const Haptics = await import(moduleName);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // haptics package is optional in local dev environments
  }
}

function OptionRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const { language } = useI18n();
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.optionWrap}>
        {values.map((value) => {
          const active = selected === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.optionPill, active ? styles.optionPillActive : styles.optionPillInactive]}
              onPress={() => onSelect(value)}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, active ? styles.optionTextActive : styles.optionTextInactive]}>
                {language === "tr" ? formatLabelTr(value) : formatLabel(value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SliderRow({
  label,
  value,
  unit,
  minimumValue,
  maximumValue,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const prevValue = useRef(value);

  const handleValueChange = (next: number) => {
    const normalized = Number(next.toFixed(step < 1 ? 1 : 0));
    if (normalized !== prevValue.current) {
      prevValue.current = normalized;
      onChange(normalized);
      void triggerStepHaptic();
    }
  };

  return (
    <View style={styles.group}>
      <View style={styles.sliderHead}>
        <Text style={styles.groupLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value.toFixed(step < 1 ? 1 : 0)} {unit}</Text>
      </View>
      {SliderComponent ? (
        <SliderComponent
          value={value}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={C.gold}
          maximumTrackTintColor={C.textDim}
          thumbTintColor={C.gold}
          onValueChange={handleValueChange}
        />
      ) : (
        <View style={styles.fallbackSlider}>
          <TouchableOpacity style={styles.fallbackBtn} onPress={() => handleValueChange(Math.max(minimumValue, value - step))}>
            <Text style={styles.fallbackBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.fallbackValue}>{value.toFixed(step < 1 ? 1 : 0)}</Text>
          <TouchableOpacity style={styles.fallbackBtn} onPress={() => handleValueChange(Math.min(maximumValue, value + step))}>
            <Text style={styles.fallbackBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function ConfigCard({ category, config, onUpdate }: ConfigCardProps) {
  const { tx } = useI18n();
  const current = category === "transport" || category === "food" || category === "energy" ? category : "transport";
  const categoryOptions = OPTIONS[current];
  const distanceOrPortions = config.portionsOrDistance ?? (current === "transport" ? 3 : 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{tx("What if you switch this habit?", "Bu alışkanlığı değiştirirsen ne olur?")}</Text>

      <OptionRow
        label={tx("From", "Şundan")}
        values={categoryOptions.from}
        selected={config.fromSubType}
        onSelect={(fromSubType) => onUpdate({ fromSubType })}
      />
      <OptionRow
        label={tx("To", "Şuna")}
        values={categoryOptions.to}
        selected={config.toSubType}
        onSelect={(toSubType) => onUpdate({ toSubType })}
      />

      {current === "transport" ? (
        <>
          <SliderRow
            label={tx("Distance per trip", "Yolculuk başına mesafe")}
            value={distanceOrPortions}
            unit="km"
            minimumValue={0.5}
            maximumValue={30}
            step={0.5}
            onChange={(portionsOrDistance) => onUpdate({ portionsOrDistance })}
          />
          <SliderRow
            label={tx("Times per week", "Haftada kaç kez")}
            value={config.valuePerWeek}
            unit="x"
            minimumValue={1}
            maximumValue={14}
            step={1}
            onChange={(valuePerWeek) => onUpdate({ valuePerWeek })}
          />
        </>
      ) : null}

      {current === "food" ? (
        <>
          <SliderRow
            label={tx("Meals per week", "Haftalık öğün")}
            value={config.valuePerWeek}
            unit="meals"
            minimumValue={1}
            maximumValue={21}
            step={1}
            onChange={(valuePerWeek) => onUpdate({ valuePerWeek })}
          />
          <SliderRow
            label={tx("Portions per meal", "Öğün başına porsiyon")}
            value={distanceOrPortions}
            unit="portions"
            minimumValue={1}
            maximumValue={3}
            step={1}
            onChange={(portionsOrDistance) => onUpdate({ portionsOrDistance })}
          />
        </>
      ) : null}

      {current === "energy" ? (
          <SliderRow
            label={tx("Times per week", "Haftada kaç kez")}
          value={config.valuePerWeek}
          unit="x"
          minimumValue={1}
          maximumValue={7}
          step={1}
          onChange={(valuePerWeek) => onUpdate({ valuePerWeek })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 18,
  },
  title: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  group: {
    marginBottom: 12,
  },
  groupLabel: {
    color: C.textDim,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  optionPillActive: {
    backgroundColor: C.bgSecondary,
    borderColor: C.bgSecondary,
  },
  optionPillInactive: {
    backgroundColor: "transparent",
    borderColor: C.textDim,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextActive: {
    color: C.text,
  },
  optionTextInactive: {
    color: C.textDim,
  },
  sliderHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderValue: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  fallbackSlider: {
    borderWidth: 1,
    borderColor: C.textDim,
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  fallbackBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
  },
  fallbackValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
