/**
 * Root Layout — Axiom
 *
 * Expo Router root navigator with auth guard.
 * Redirects to onboarding if user is not authenticated.
 */
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { C } from "../src/constants/colors";
import { useAuthStore } from "../src/store/authStore";
import { I18nProvider, useI18n } from "../src/i18n";
import LanguageSwitcher from "../src/components/LanguageSwitcher";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootLayoutInner />
    </I18nProvider>
  );
}

function RootLayoutInner() {
  const router = useRouter();
  const segments = useSegments();
  const { tx } = useI18n();
  
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate().then(() => setIsHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!isAuthenticated || !hasCompletedOnboarding) {
      if (!inOnboardingGroup) {
        router.replace('/onboarding');
      }
    } else if (isAuthenticated && hasCompletedOnboarding) {
      if (inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isHydrated, isLoading, isAuthenticated, hasCompletedOnboarding, segments, router]);

  // Optionally render a splash screen while hydrating
  if (!isHydrated || isLoading) {
    return null;
  }

  return (
      <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <Stack
        screenOptions={() => ({
          headerStyle: { backgroundColor: C.overlay },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: C.bg },
          headerShadowVisible: false,
          headerRight: () => <LanguageSwitcher />,
        })}
      >
        {/* Onboarding flow */}
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />

        {/* Main tab navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        {/* Push screens */}
        <Stack.Screen
          name="food-photo"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="calendar"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="simulator"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="gamification"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="notifications"
          options={{ title: tx("Notifications", "Bildirimler") }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
