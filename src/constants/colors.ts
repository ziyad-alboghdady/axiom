/**
 * Axiom Design System — Color Tokens v2
 *
 * Two-tier system:
 *   DARK SURFACES  → screen backgrounds, tab bar, overlays
 *   LIGHT SURFACES → cards, inputs, chat bubbles, data panels
 *
 * Rules:
 * 1.  Never use #FFFFFF — warm ivory is the lightest surface
 * 2.  Never make full screens light — dark bg always visible
 * 3.  Light surfaces only for cards/inputs/panels
 * 4.  Gold is premium-only: XP, AI borders, achievements
 * 5.  Depth: overlay → bg → card → surface (light floats on dark)
 * 6.  Text on dark: C.text / C.textDim
 *     Text on light: C.textDark / C.textDarkMuted
 */

// ─── Dark surfaces ───────────────────────────────────────────────
export const BG   = '#0D4A35'; // Forest Deep  — all screen backgrounds
export const BGALT= '#239B6B'; // Eco Active   — active/pressed states
export const ABYSS= '#0A2E1F'; // Abyss        — tab bar, nav, modals
export const DARK = '#1A3D2B'; // Dark Card    — dark UI cards (onboarding)
export const CARD = '#162B21'; // Card Dark    — NEW: tab screens card bg (v3)

// ─── Light surfaces (cards, inputs, panels) ──────────────────────
export const SURF  = '#F5F0E8'; // Warm Ivory   — primary card bg
export const SURF2 = '#EDE6DA'; // Soft Ivory   — secondary card bg
export const SURF3 = '#E3DACB'; // Muted Ivory  — tertiary / pressed
export const BORD  = '#D6CBB5'; // Border       — card outlines on light

// ─── Accents ─────────────────────────────────────────────────────
export const GOLD  = '#E6C27A'; // Gold         — XP rings, AI borders
export const GOLDB = '#FFD700'; // Bright Gold  — gradients, highlights
export const MINT  = '#3ED598'; // Mint Green   — success, low CO₂
export const CORAL = '#FF5A3C'; // Coral Red    — danger, high CO₂
export const NEON  = '#00FFB2'; // Neon         — very limited use

// ─── Text ────────────────────────────────────────────────────────
export const TEXT      = '#F5F0E8'; // on dark surfaces
export const TEXTDIM   = '#A8C4B4'; // muted on dark surfaces
export const TEXTDARK  = '#0D4A35'; // on light surfaces
export const TEXTDARMD = '#6B8F7E'; // muted on light surfaces

// ─── Legacy aliases (onboarding backward-compat) ─────────────────
const OLDSEC  = '#1D7A54';
const OLDACC  = '#C9A96E';
const OLDSUCC = '#2CA06E';
const OLDDAN  = '#C0482E';
const OLDDIM  = '#D9CEB5';

export const Colors = {
  // Dark
  bg:         BG,
  bgAlt:      BGALT,
  abyss:      ABYSS,
  darkCard:   DARK,
  cardDark:   CARD,
  // Light
  surface:    SURF,
  surfaceSoft:SURF2,
  surfaceMuted:SURF3,
  border:     BORD,
  // Accents
  gold:       GOLD,
  goldBright: GOLDB,
  mint:       MINT,
  coral:      CORAL,
  neon:       NEON,
  // Text
  text:       TEXT,
  textDim:    TEXTDIM,
  textDark:   TEXTDARK,
  textDarkMuted: TEXTDARMD,

  // ── Green ramp (full scale) ──
  green: {
    50:  '#E6F5EE',
    100: '#B3DEC9',
    200: '#7EC4A4',
    400: '#2CA06E',
    600: '#1D7A54',
    800: '#0D4A35',
    900: '#0A2E1F',
  },
  // ── Gold ramp (full scale) ──
  gold: {
    50:  '#FAF5EC',
    100: '#EFE0BC',
    200: '#DFC894',
    400: '#E6C27A',
    600: '#C9A96E',
    800: '#A8863D',
    900: '#7A5F22',
  },
} as const;

/**
 * C — Flat alias map. Import this in all component/screen files.
 *
 * New tokens (tabs design system):
 *   C.surface, C.surfaceSoft, C.surfaceMuted, C.border
 *   C.bgAlt, C.gold, C.goldBright, C.mint, C.coral, C.neon
 *   C.textDark, C.textDarkMuted, C.textMuted
 *
 * Legacy tokens (kept for onboarding backward-compat):
 *   C.bgSecondary, C.accent, C.card, C.overlay
 *   C.success, C.danger, C.textDim
 */
export const C = {
  // ── Dark surfaces ──
  bg:             BG,
  bgAlt:          BGALT,       // NEW: tabs active surface
  bgSecondary:    OLDSEC,      // LEGACY: onboarding active surface
  overlay:        ABYSS,
  card:           DARK,        // LEGACY: dark card (onboarding)
  cardDark:       CARD,        // NEW v3: deep dark cards with accents

  // ── Light surfaces (tabs design system) ──
  surface:        SURF,
  surfaceSoft:    SURF2,
  surfaceMuted:   SURF3,
  border:         BORD,

  // ── Accents ──
  gold:           GOLD,        // NEW: tabs gold
  goldBright:     GOLDB,
  accent:         OLDACC,      // LEGACY: onboarding gold
  mint:           MINT,        // NEW: success on light
  coral:          CORAL,       // NEW: danger on light
  neon:           NEON,
  success:        OLDSUCC,     // LEGACY: onboarding success
  danger:         OLDDAN,      // LEGACY: onboarding danger

  // ── Text on dark ──
  text:           TEXT,
  textDim:        OLDDIM,      // LEGACY: onboarding muted text
  textMuted:      TEXTDIM,     // NEW: muted on dark (tabs)

  // ── Text on light cards ──
  textDark:       TEXTDARK,
  textDarkMuted:  TEXTDARMD,
} as const;

/** Frequently used alpha variants */
export const alpha = {
  gold8:      'rgba(230,194,122,0.08)',
  gold15:     'rgba(230,194,122,0.15)',
  gold25:     'rgba(230,194,122,0.25)',
  mint10:     'rgba(62,213,152,0.10)',
  coral12:    'rgba(255,90,60,0.12)',
  coral35:    'rgba(255,90,60,0.35)',
  dark8:      'rgba(10,46,31,0.08)',
  dark15:     'rgba(10,46,31,0.15)',
  dark25:     'rgba(10,46,31,0.25)',
  surface70:  'rgba(245,240,232,0.70)',
  neon10:     'rgba(0,255,178,0.10)',
} as const;
