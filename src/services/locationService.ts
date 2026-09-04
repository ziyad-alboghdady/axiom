/**
 * Location Service — Axiom
 *
 * Wrapper around expo-location for adaptive background tracking.
 * Detects transport mode based on speed to auto-log travel emissions.
 */
import * as Location from "expo-location";

export type TransportMode = "stationary" | "walking" | "cycling" | "driving";

/**
 * Request foreground location permissions.
 */
export async function requestForegroundPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Request background location permissions.
 */
export async function requestBackgroundPermission(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === "granted";
}

/**
 * Get the current location.
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  const hasPermission = await requestForegroundPermission();
  if (!hasPermission) return null;

  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}

/**
 * Infer transport mode from speed (m/s).
 */
export function inferTransportMode(speedMs: number): TransportMode {
  if (speedMs < 0.5) return "stationary";
  if (speedMs < 2.5) return "walking";    // ~9 km/h
  if (speedMs < 8.0) return "cycling";    // ~29 km/h
  return "driving";                        // > 29 km/h
}

/**
 * Start watching location updates.
 * Returns a subscription that can be removed.
 */
export async function watchLocation(
  onUpdate: (location: Location.LocationObject, mode: TransportMode) => void
): Promise<Location.LocationSubscription | null> {
  const hasPermission = await requestForegroundPermission();
  if (!hasPermission) return null;

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,     // every 10 seconds
      distanceInterval: 50,    // or every 50 meters
    },
    (location) => {
      const speed = location.coords.speed ?? 0;
      const mode = inferTransportMode(speed);
      onUpdate(location, mode);
    }
  );
}

// TODO: Implement background location task for tracking when app is closed
// This requires expo-task-manager and must be configured in app.json
