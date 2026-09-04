import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { C } from "../../src/constants/colors";
import {
  HomeIcon, ChartIcon, AIIcon, TrophyIcon, UserIcon,
} from "../../src/components/Icons";
import { useI18n } from "../../src/i18n";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function TabIcon({ Icon, focused }: { Icon: IconComponent; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={22} color={focused ? C.gold : C.textMuted} strokeWidth={2.2} />
    </View>
  );
}

export default function TabLayout() {
  const { tx } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            title: tx("Home", "Ana Sayfa"),
            tabBarIcon: ({ focused }) => <TabIcon Icon={HomeIcon} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: tx("Log", "Kayıt"),
            tabBarIcon: ({ focused }) => <TabIcon Icon={ChartIcon} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: tx("AI Coach", "YZ Koçu"),
            tabBarIcon: ({ focused }) => <TabIcon Icon={AIIcon} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: tx("Social", "Sosyal"),
            tabBarIcon: ({ focused }) => <TabIcon Icon={TrophyIcon} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: tx("Me", "Ben"),
            tabBarIcon: ({ focused }) => <TabIcon Icon={UserIcon} focused={focused} />,
          }}
        />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.overlay,
    borderTopWidth: 1,
    borderTopColor: "rgba(230,194,122,0.12)",
    paddingBottom: 10,
    paddingTop: 6,
    height: 70,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 1,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: "rgba(230,194,122,0.1)",
  },
});
