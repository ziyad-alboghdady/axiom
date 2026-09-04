/**
 * useNotifications — Axiom
 *
 * FCM token + notification feed management with demo data seeding.
 */
import { useState, useEffect, useCallback } from "react";
import {
  registerForPushNotifications,
  configureNotifications,
} from "../services/notificationService";
import { useI18n } from "../i18n";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "insight" | "reminder" | "achievement" | "social";
  read: boolean;
  createdAt: number;
}

export function useNotifications(userId: string | undefined) {
  const { tx } = useI18n();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    configureNotifications();
    const setup = async () => {
      const token = await registerForPushNotifications();
      setPushToken(token);
      // TODO: Store token in Firestore users/{userId}.pushToken
    };
    setup();
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const fetchedNotifications: NotificationItem[] = [];

      const demoNotifications: NotificationItem[] = [
        {
          id: "demo-1",
          title: tx("Amazing Progress! 🌿", "Harika İlerleme! 🌿"),
          body: tx("You've reduced your weekly CO₂ by 2.3 kg compared to last week. Keep it up!", "Haftalık CO₂'nizi geçen haftaya göre 2.3 kg azalttınız. Böyle devam!"),
          type: "achievement",
          read: false,
          createdAt: Date.now() - 600000,
        },
        {
          id: "demo-2",
          title: tx("AI Coaching: Transport", "YZ Koçluğu: Ulaşım"),
          body: tx("Try carpooling on your commute 3 days/week — you could save ~5 kg CO₂ monthly.", "Haftada 3 gün işe giderken araç paylaşımını deneyin — ayda ~5 kg CO₂ tasarrufu sağlayabilirsiniz."),
          type: "insight",
          read: false,
          createdAt: Date.now() - 1800000,
        },
        {
          id: "demo-3",
          title: tx("7-Day Streak! 🔥", "7 Gün Serisi! 🔥"),
          body: tx("You've logged your carbon footprint for 7 consecutive days. Incredible commitment!", "Karbon ayak izinizi 7 gün üst üste kaydettiniz. Müthiş bir bağlılık!"),
          type: "achievement",
          read: true,
          createdAt: Date.now() - 3600000,
        },
        {
          id: "demo-4",
          title: tx("Daily Check-in Reminder", "Günlük Hatırlatma"),
          body: tx("Log your meals and activities to keep your streak alive. It takes just 2 minutes.", "Serinizi korumak için öğün ve aktivitelerinizi kaydedin. Sadece 2 dakika sürer."),
          type: "reminder",
          read: true,
          createdAt: Date.now() - 86400000,
        },
        {
          id: "demo-5",
          title: tx("Jordan joined Axiom! 👥", "Jordan Axiom'a katıldı! 👥"),
          body: tx("Your friend from work started tracking their carbon footprint. Connect and compare!", "İş arkadaşınız karbon ayak izini takip etmeye başladı. Bağlanın ve karşılaştırın!"),
          type: "social",
          read: true,
          createdAt: Date.now() - 172800000,
        },
      ];

    // If no notifications, seed demo data
      if (fetchedNotifications.length === 0) {
        setNotifications(demoNotifications);
      } else {
        setNotifications(fetchedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // On error, show demo data
      setNotifications(notifications);
    } finally {
      setIsLoading(false);
    }
  }, [userId, tx]);

  return { notifications, pushToken, isLoading, fetchNotifications };
}

