/**
 * StepDots — Connected step progress indicator for onboarding.
 * Completed steps show in C.success, active in C.accent, pending dimmed.
 */
import React from "react";
import { View, Text } from "react-native";
import { C } from "../constants/colors";

interface StepDotsProps {
  totalSteps: number;
  currentStep: number; // 0-indexed: step 1 = 0, step 2 = 1, etc.
}

export function StepDots({ totalSteps, currentStep }: StepDotsProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <React.Fragment key={i}>
            {/* Dot */}
            <View
              style={{
                width: isActive ? 28 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: isCompleted
                  ? C.success
                  : isActive
                  ? C.accent
                  : "rgba(245,240,232,0.12)",
                borderWidth: isActive ? 0 : 0,
              }}
            />
            {/* Connector line */}
            {i < totalSteps - 1 && (
              <View
                style={{
                  height: 1.5,
                  width: 28,
                  marginHorizontal: 5,
                  backgroundColor: isCompleted
                    ? C.success
                    : "rgba(245,240,232,0.1)",
                  borderRadius: 1,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
