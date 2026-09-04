import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Line, Rect, Polyline } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// ── Home / Dashboard ────────────────────────────────────────────────────────
export function HomeIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10L12 3L21 10V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V10Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V13H15V22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Chart / Analytics ───────────────────────────────────────────────────────
export function ChartIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M5 21V14M9 21V8M13 21V11M17 21V5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── AI / Sparkle ───────────────────────────────────────────────────────────
export function AIIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L15.09 8.26H21.77L16.84 12.45L18.93 18.71L12 14.52L5.07 18.71L7.16 12.45L2.23 8.26H8.91L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Users / Social ──────────────────────────────────────────────────────────
export function UsersIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 20C5 18 6.5 17 8 17H8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="16" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13 20C13 18 14.5 17 16 17H18C19.5 17 21 18 21 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Settings / Gear ────────────────────────────────────────────────────────
export function SettingsIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 1V3M12 21V23M23 12H21M3 12H1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Bell / Notifications ────────────────────────────────────────────────────
export function BellIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8C18 6.4 17.6 4.9 16.8 3.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 8C6 11.3 3 15 3 15V20H21V15C21 15 18 11.3 18 8C18 4.7 15.3 2 12 2C8.7 2 6 4.7 6 8Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 20H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Flame / Streak ────────────────────────────────────────────────────────
export function FlameIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 6 10 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 10 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 8C10 10 9 12 9 14C9 15.7 10.3 17 12 17C13.7 17 15 15.7 15 14C15 12 14 10 12 8Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Camera / Scan ──────────────────────────────────────────────────────────
export function CameraIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 6H16L14 2H10L8 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Zap / Lightning ────────────────────────────────────────────────────────
export function ZapIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="13 2 3 14 12 14 2 22 13 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Crystal Ball / Simulator ────────────────────────────────────────────────
export function CrystalIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 3V1M12 23V21M3 12H1M23 12H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Calendar ────────────────────────────────────────────────────────────────
export function CalendarIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="9" y1="4" x2="9" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="15" y1="4" x2="15" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── User / Profile ────────────────────────────────────────────────────────
export function UserIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Mail / Email ───────────────────────────────────────────────────────────
export function MailIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 6L12 13L22 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── MapPin / Location ──────────────────────────────────────────────────────
export function MapPinIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.1 2 5 5.1 5 9C5 14 12 22 12 22S19 14 19 9C19 5.1 15.9 2 12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── LogOut / Door ──────────────────────────────────────────────────────────
export function LogOutIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="17 8 21 12 17 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Trophy / Award ────────────────────────────────────────────────────────
export function TrophyIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9C6 7 7 5 9 5H15C17 5 18 7 18 9M6 9H3C2 9 2 10 2 11V13C2 15 3 16 5 16M18 9H21C22 9 22 10 22 11V13C22 15 21 16 19 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 16V18C9 19 10 20 11 20H13C14 20 15 19 15 18V16M5 16C3.5 16 2 17 2 18.5C2 20 3.5 22 5 22H19C20.5 22 22 20 22 18.5C22 17 20.5 16 19 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Utensils / Food ────────────────────────────────────────────────────────
export function UtensilsIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 2V10C3 12.2 4.8 14 7 14M3 2L7 6M3 2H1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 2V10C21 12.2 19.2 14 17 14M21 2L17 6M21 2H23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2V18M12 22V18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Car / Transport ────────────────────────────────────────────────────────
export function CarIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 8H22M5 8L6 3H18L19 8M5 8V18C5 19.1 5.9 20 7 20H8M19 8V18C19 19.1 18.1 20 17 20H16M8 20H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="8" cy="16" r="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="16" cy="16" r="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Power / Energy ────────────────────────────────────────────────────────
export function PowerIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18.36 6.64C19.74 8.02 20.5 9.88 20.5 12C20.5 16.14 17.14 19.5 13 19.5C8.86 19.5 5.5 16.14 5.5 12C5.5 9.88 6.26 8.02 7.64 6.64" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="2" x2="12" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── ShoppingBag ────────────────────────────────────────────────────────────
export function ShoppingBagIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2H18C19.1 2 20 2.9 20 4V22H4V4C4 2.9 4.9 2 6 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="9" y1="2" x2="9" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="15" y1="2" x2="15" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Heart ──────────────────────────────────────────────────────────────────
export function HeartIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61C22.11 5.88 22.85 7.62 22.85 9.57C22.85 13.87 19.75 17.54 15.3 19.08C13.55 19.73 11.47 19.73 9.7 19.08C5.25 17.54 2.15 13.87 2.15 9.57C2.15 7.62 2.89 5.88 4.16 4.61M12 8.5V14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── CheckCircle ────────────────────────────────────────────────────────────
export function CheckCircleIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="8 12 11 15 16 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── AlertCircle ────────────────────────────────────────────────────────────
export function AlertCircleIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="16" r="0.5" fill={color} />
    </Svg>
  );
}

// ── Leaf ────────────────────────────────────────────────────────────────────
export function LeafIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2C12 2 16 8 16 12C16 15.31 14.21 18.16 11.5 19.29" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Globe / World ──────────────────────────────────────────────────────────
export function GlobeIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12H22M12 2C9.72 5.15 8.5 8.85 8.5 12C8.5 15.15 9.72 18.85 12 22C14.28 18.85 15.5 15.15 15.5 12C15.5 8.85 14.28 5.15 12 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Radio / Connect ────────────────────────────────────────────────────────
export function RadioIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.56 3.69C6.95 5.3 6 7.5 6 10C6 12.5 6.95 14.7 8.56 16.31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15.44 3.69C17.05 5.3 18 7.5 18 10C18 12.5 17.05 14.7 15.44 16.31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Menu / Bars ────────────────────────────────────────────────────────────
export function MenuIcon({ size = 24, color = "#F5F0E8", strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
