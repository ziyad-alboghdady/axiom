/**
 * S-12 NotificationsScreen
 *
 * Notification feed with AI insights, reminders, and achievements.
 */
import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { C } from "../src/constants/colors";
import { NotifItem } from "../src/components/NotifItem";
import { useNotifications } from "../src/hooks/useNotifications";
import { useAuthStore } from "../src/store/authStore";
import { useI18n } from "../src/i18n";

function getTimeAgo(timestamp: number, tx: (english: string, turkish: string) => string): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return tx("Just now", "Az önce");
  if (minutes < 60) return `${minutes}${tx("m ago", "dk önce")}`;
  if (hours < 24) return `${hours}${tx("h ago", "sa önce")}`;
  return `${days}${tx("d ago", "g önce")}`;
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const { tx } = useI18n();
  const { notifications, isLoading, fetchNotifications } = useNotifications(user?.uid);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {notifications.length === 0 && !isLoading ? (
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: "600" }}>{tx("All caught up!", "Her şey güncel!")}</Text>
          <Text style={{ color: C.textDim, fontSize: 14, textAlign: "center", marginTop: 4 }}>
            {tx("You'll receive AI coaching insights, streak reminders, and achievement notifications here.", "YZ koçluğu içgörüleri, seri hatırlatmaları ve başarı bildirimlerini burada alacaksın.")}
          </Text>
        </View>
      ) : (
        notifications.map((notif) => (
          <NotifItem
            key={notif.id}
            title={notif.title}
            body={notif.body}
            type={notif.type}
            read={notif.read}
            timeAgo={getTimeAgo(notif.createdAt, tx)}
          />
        ))
      )}
    </ScrollView>
  );
}
