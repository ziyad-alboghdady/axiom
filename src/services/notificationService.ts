/**
 * Notification Service — Axiom
 *
 * Push notification registration and scheduling via expo-notifications.
 * Gracefully handles limitations in Expo Go (Android SDK 53+).
 */
import * as Notifications from "expo-notifications";

/**
 * Configure notification handler (call once at app startup).
 */
export function configureNotifications(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn("Could not configure notifications:", error);
  }
}

/**
 * Request notification permissions and get the push token.
 * Returns null if not available (e.g., Expo Go on Android).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.warn("Push notifications not available in this environment:", error);
    return null;
  }
}

/**
 * Schedule a local notification.
 * Returns null if not available.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number = 1
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
      },
    });
  } catch (error) {
    console.warn("Could not schedule notification:", error);
    return null;
  }
}

/**
 * Schedule a daily reminder notification.
 * Returns null if not available.
 */
export async function scheduleDailyReminder(
  title: string,
  body: string,
  hour: number = 20,
  minute: number = 0
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.warn("Could not schedule daily reminder:", error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Could not cancel notifications:", error);
  }
}
