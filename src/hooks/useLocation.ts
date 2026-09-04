/**
 * useLocation — Axiom
 *
 * Adaptive background geo tracking for transport detection.
 */
import { useState, useEffect, useCallback } from "react";
import {
  getCurrentLocation,
  watchLocation,
  inferTransportMode,
  TransportMode,
} from "../services/locationService";
import * as Location from "expo-location";

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mode, setMode] = useState<TransportMode>("stationary");
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  const getLocation = useCallback(async () => {
    const loc = await getCurrentLocation();
    if (loc) setLocation(loc);
    return loc;
  }, []);

  const startTracking = useCallback(async () => {
    const sub = await watchLocation((loc, transportMode) => {
      setLocation(loc);
      setMode(transportMode);
    });
    if (sub) {
      setSubscription(sub);
      setIsTracking(true);
    }
  }, []);

  const stopTracking = useCallback(() => {
    subscription?.remove();
    setSubscription(null);
    setIsTracking(false);
  }, [subscription]);

  useEffect(() => {
    return () => { subscription?.remove(); };
  }, [subscription]);

  return { location, mode, isTracking, getLocation, startTracking, stopTracking };
}
