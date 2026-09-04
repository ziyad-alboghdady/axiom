/**
 * Firebase Service — Axiom
 *
 * Initializes Firebase Auth, Firestore, and Storage.
 * Config is read from EXPO_PUBLIC_ environment variables.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
// @ts-expect-error — exported at runtime in Firebase v12 but missing from type declarations
import { getReactNativePersistence } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  Firestore,
  orderBy,
  query,
  where,
  limit,
  setDoc,
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import type { ActivityEntry, DailyScore } from "../types/carbon";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;

export async function getTodayActivities(
  userId: string,
  date: string
): Promise<ActivityEntry[]> {
  const ref = collection(db, "users", userId, "activities");
  const q = query(ref, where("date", "==", date));
  const snap = await getDocs(q);
  const entries: ActivityEntry[] = [];
  snap.forEach((d) => {
    entries.push({ id: d.id, ...(d.data() as Omit<ActivityEntry, "id">) });
  });
  entries.sort((a, b) => {
    const aSeconds = a.createdAt?.seconds ?? 0;
    const bSeconds = b.createdAt?.seconds ?? 0;
    return bSeconds - aSeconds;
  });
  return entries;
}

export async function getDailyScore(
  userId: string,
  date: string
): Promise<DailyScore | null> {
  const scoreRef = doc(db, "users", userId, "dailyScores", date);
  const scoreSnap = await getDoc(scoreRef);
  if (!scoreSnap.exists()) return null;
  return scoreSnap.data() as DailyScore;
}

export async function saveDailyScore(
  userId: string,
  date: string,
  data: Partial<DailyScore>
): Promise<void> {
  const scoreRef = doc(db, "users", userId, "dailyScores", date);
  await setDoc(
    scoreRef,
    {
      date,
      updatedAt: Date.now(),
      ...data,
    },
    { merge: true }
  );
}

export async function getRecentDailyScores(
  userId: string,
  take: number
): Promise<DailyScore[]> {
  const scoresRef = collection(db, "users", userId, "dailyScores");
  const q = query(scoresRef, orderBy("date", "desc"), limit(take));
  const snap = await getDocs(q);
  const scores: DailyScore[] = [];
  snap.forEach((d) => {
    scores.push(d.data() as DailyScore);
  });
  return scores;
}
