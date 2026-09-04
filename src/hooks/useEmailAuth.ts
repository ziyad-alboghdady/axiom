import { useState, useCallback } from "react";
import { firebaseSignInWithEmail, firebaseSignUpWithEmail } from "../services/authService";
import { getUserProfile } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import type { User } from "firebase/auth";

export function useEmailAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setUser = useAuthStore((s) => s.setUser);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const authAction = useCallback(async (
    action: "signIn" | "signUp",
    email: string,
    password: string
  ): Promise<{ firebaseUser: User; isNewUser: boolean } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let firebaseUser: User;
      
      if (action === "signUp") {
        firebaseUser = await firebaseSignUpWithEmail(email, password);
      } else {
        firebaseUser = await firebaseSignInWithEmail(email, password);
      }

      setFirebaseUser(
        firebaseUser.uid,
        firebaseUser.email ?? email,
        firebaseUser.displayName,
        firebaseUser.photoURL
      );

      const existingProfile = await getUserProfile(firebaseUser.uid);

      if (existingProfile) {
        setUser(existingProfile);
        setOnboardingComplete();
      }

      return {
        firebaseUser,
        isNewUser: !existingProfile,
      };
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err.message ?? "Authentication failed");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setFirebaseUser, setUser, setOnboardingComplete]);

  return { authAction, isLoading, error };
}
