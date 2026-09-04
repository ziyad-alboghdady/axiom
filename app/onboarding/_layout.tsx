/**
 * Onboarding Layout
 */
import { Stack } from "expo-router";
import { C } from "../../src/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.bg },
      }}
    />
  );
}
