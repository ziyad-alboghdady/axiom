/**
 * User-related types for Axiom
 */
import { Timestamp } from "firebase/firestore";

export type DietType = "omnivore" | "vegetarian" | "vegan";

export type CommuteType = "walking" | "bus" | "car" | "bike" | "train";

/**
 * User profile document.
 * Stored at: users/{userId}
 */
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  city: string;
  campus?: string;
  dietType: DietType;
  commuteType: CommuteType;
  calendarConnected: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  pushToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
