import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useI18n } from "../i18n";
import { C } from "../constants/colors";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useI18n();

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.btn} activeOpacity={0.8}>
        <Text style={styles.txt}>{language === "tr" ? "TR" : "EN"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: 12 },
  btn: {
    backgroundColor: C.overlay,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(230,194,122,0.08)",
  },
  txt: {
    color: C.text,
    fontWeight: "700",
    fontSize: 12,
  },
});
