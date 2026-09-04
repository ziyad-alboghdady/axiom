import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "../types/user";

const STORAGE_KEY = "axiom_auth";

interface AuthState {
  user: UserProfile | null;
  firebaseUid: string | null;
  firebaseEmail: string | null;
  firebaseDisplayName: string | null;
  firebasePhotoUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  setFirebaseUser: (uid: string, email: string, displayName: string | null, photoUrl: string | null) => void;
  setUser: (user: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: () => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUid: null,
  firebaseEmail: null,
  firebaseDisplayName: null,
  firebasePhotoUrl: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,

  setFirebaseUser: (uid, email, displayName, photoUrl) => {
    set({
      firebaseUid: uid,
      firebaseEmail: email,
      firebaseDisplayName: displayName,
      firebasePhotoUrl: photoUrl,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
    persistState(get());
  },

  updateProfile: (updates) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...updates } : null;
      if (updated) persistState({ ...state, user: updated });
      return { user: updated };
    }),

  setOnboardingComplete: () => {
    set({ hasCompletedOnboarding: true });
    persistState(get());
  },

  signOut: () => {
    set({
      user: null,
      firebaseUid: null,
      firebaseEmail: null,
      firebaseDisplayName: null,
      firebasePhotoUrl: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    });
    AsyncStorage.removeItem(STORAGE_KEY);
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ isLoading: false });
        return;
      }
      const saved = JSON.parse(raw);
      set({
        user: saved.user ?? null,
        firebaseUid: saved.firebaseUid ?? null,
        isAuthenticated: !!saved.user,
        hasCompletedOnboarding: saved.hasCompletedOnboarding ?? false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));

function persistState(state: AuthState) {
  const data = {
    user: state.user,
    firebaseUid: state.firebaseUid,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
