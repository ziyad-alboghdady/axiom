import { useState, useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { firebaseSignInWithGoogleIdToken } from "../services/authService";
import { getUserProfile } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import type { User } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setUser = useAuthStore((s) => s.setUser);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const signIn = useCallback(async (): Promise<{
    firebaseUser: User;
    isNewUser: boolean;
  } | null> => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: "axiom" });

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: [
          "openid", 
          "profile", 
          "email", 
          "https://www.googleapis.com/auth/calendar.readonly"
        ],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
      });

      const result = await request.promptAsync(discovery);

      if (result.type !== "success") {
        setIsLoading(false);
        return null;
      }

      const idToken = result.params?.id_token;
      if (!idToken) {
        throw new Error("No ID token received");
      }

      const firebaseUser = await firebaseSignInWithGoogleIdToken(idToken);

      setFirebaseUser(
        firebaseUser.uid,
        firebaseUser.email ?? "",
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
      setError(err.message ?? "Sign-in failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setFirebaseUser, setUser, setOnboardingComplete]);

  return { signIn, isLoading, error };
}
