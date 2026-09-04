import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../constants/colors";
import type { ActivityCategory } from "../types/carbon";
import { useI18n } from "../i18n";

interface CategoryTabRowProps {
  active: ActivityCategory;
  tabs: readonly ActivityCategory[];
  onChange: (next: ActivityCategory) => void;
}

export function CategoryTabRow({ active, tabs, onChange }: CategoryTabRowProps) {
  const { tx } = useI18n();
  const labels: Record<ActivityCategory, string> = {
    transport: tx("Transport", "Ulaşım"),
    food: tx("Food", "Yemek"),
    energy: tx("Energy", "Enerji"),
    shopping: tx("Shopping", "Alışveriş"),
  };
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const selected = tab === active;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selected ? styles.tabActive : styles.tabInactive]}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, selected ? styles.tabTextActive : styles.tabTextInactive]}>
              {labels[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: C.bgSecondary,
    borderColor: C.bgSecondary,
  },
  tabInactive: {
    backgroundColor: "transparent",
    borderColor: C.textDim,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: C.text,
  },
  tabTextInactive: {
    color: C.textDim,
  },
});
