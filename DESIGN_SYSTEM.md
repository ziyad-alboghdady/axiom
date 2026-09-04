# Axiom Design System v2

> Single source of truth for all design decisions. Reference this before writing any UI.
> Last updated: redesign to balanced dark + light system.

---

## Philosophy

**Dark base + light cards** — The dark Forest Deep background is always visible.
Light cream surfaces *float above* it as cards, inputs, and panels.
This creates depth, premium feel, and strong readability without a jarring all-light or all-dark UI.

> Never full-screen light. Never full-screen dark-card-only.
> The contrast between `#0D4A35` and `#F5F0E8` IS the design.

---

## Color Tokens (`src/constants/colors.ts`)

### Import

```ts
import { C } from "src/constants/colors";
```

### Dark Surfaces

| Token | Hex | Usage |
|---|---|---|
| `C.bg` | `#0D4A35` | Every screen background |
| `C.bgAlt` | `#239B6B` | Active/pressed dark surface, Log button, category active |
| `C.overlay` | `#0A2E1F` | Tab bar, nav bar, deep modals |
| `C.card` | `#1A3D2B` | *(Legacy — onboarding dark cards only)* |

### Light Surfaces — cards, inputs, panels

| Token | Hex | Usage |
|---|---|---|
| `C.surface` | `#F5F0E8` | **Primary card background** — all main cards |
| `C.surfaceSoft` | `#EDE6DA` | Pressed / hover state on cards |
| `C.surfaceMuted` | `#E3DACB` | Muted card variant, inactive pill bg |
| `C.border` | `#D6CBB5` | Card borders, bar tracks, dividers |

### Accents

| Token | Hex | Usage |
|---|---|---|
| `C.gold` | `#E6C27A` | XP rings, AI borders, badges, tab active, gold CTA |
| `C.goldBright` | `#FFD700` | Gradient highlights, #1 rank medal |
| `C.mint` | `#3ED598` | Low CO₂ score, success states, emission bar fill |
| `C.coral` | `#FF5A3C` | High CO₂ alert, danger states, error borders |
| `C.neon` | `#00FFB2` | Encouragement text — very limited use only |

### Text

| Token | Hex | Surface | Usage |
|---|---|---|---|
| `C.text` | `#F5F0E8` | dark | Primary text on dark bg |
| `C.textMuted` | `#A8C4B4` | dark | Secondary/muted text on dark |
| `C.textDim` | `#D9CEB5` | dark | *(Legacy — onboarding only)* |
| `C.textDark` | `#0D4A35` | light | Primary text on light cards |
| `C.textDarkMuted` | `#6B8F7E` | light | Secondary text on light cards |

---

## Usage Rules

1. **Dark bg always visible** — `C.bg` is the screen backdrop. Never cover it with a full-screen light surface.
2. **Light cards float above dark** — use `C.surface` + `C.border` + shadow for all cards.
3. **Gold = premium only** — XP rings, AI borders, badges, rank medals, CTA button. Never fill large areas.
4. **Never `#FFFFFF`** — Warmest light is `C.surface` (`#F5F0E8`).
5. **Text matches its surface** — `C.textDark` on light cards; `C.text` on dark bg.
6. **Mint = success, Coral = danger** — in the main app. Keep semantic meaning.

---

## Card System

All main-app cards use this pattern:

```ts
{
  backgroundColor: C.surface,     // warm ivory
  borderRadius: 20,                // 20–24px
  borderWidth: 1,
  borderColor: C.border,          // #D6CBB5
  shadowColor: "#0A2E1F",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
}
```

**Gold-accented cards** (AI insight, shortcuts) add:
```ts
borderColor: "rgba(230,194,122,0.3)"
```

**Danger-state cards** add:
```ts
borderLeftWidth: 4, borderLeftColor: C.coral
```

---

## Component Reference

### ScoreCard
- Background: `C.surface`
- Score color: mint / gold / coral (low / medium / high)
- Animated bar width from 0 → pct on mount (`useNativeDriver: false`)
- Status dot + label

### EmissionBar
- Background track: `C.border`
- Fill: animated per-category color
- Label: `C.textDark` · Value: colored per category

### AIInsightBanner
- Background: `C.surface`
- Left accent bar: `C.gold` (4px)
- Badge: dark bg (`C.bg`) + gold text
- Body text: `C.textDark`

### XPRing
- `variant="light"` → track `C.border`, text `C.textDark` (use on light cards)
- `variant="dark"` → track `C.overlay`, text `C.text` (use on dark surfaces)
- Progress ring always: `C.gold`
- Animated `strokeDashoffset` from full → actual on mount

### FeaturePill
- `variant="dark"` (default) → unselected: dark card bg | selected: `C.bg` + gold text
- `variant="light"` → unselected: `C.surfaceMuted` | selected: `C.bg` + gold text

### LeaderRow
- Background: `C.surface`, border: `C.border`
- Top-3 border: `rgba(230,194,122,0.35)`
- Current user: `C.bg` bg + `C.gold` border
- CO₂ score color: `C.mint`

### SuggestionCard
- Background: `C.surface`
- Number badge: `C.bg` bg + `C.gold` text

### AvatarCircle
- Default bg: `C.bg` (dark green), text: `C.gold`
- Leaderboard current-user: bg `C.gold`, text `C.bg`

---

## Screen Layouts

### Dashboard (`index.tsx`)
```
SafeAreaView (dark bg)
  ScrollView
    Header (dark) — greeting + bell
    ScoreCard (full width, light)
    Row — StreakMiniCard | XPRingCard (light)
    BreakdownCard (light, 4 EmissionBars)
    AIInsightBanner (light, gold left border)
    Quick Actions Row (3 light cards)
```

### Log Activity (`log.tsx`)
```
SafeAreaView (dark bg)
  ScrollView
    Header text
    Category Grid (4 light cards, active = dark bg + color border)
    Type pills (light variant, inside light card)
    Amount input (light card, large number input)
    Log button (activeColor bg, full width)
    Scan Food shortcut (light card, gold border)
```

### AI Coach (`ai.tsx`)
```
SafeAreaView (dark bg)
  ScrollView
    Header text
    Analyze button (gold bg)
    → loading: spinner
    → result:
        AIInsightBanner
        Impact card (light, coral left border)
        Suggestions (SuggestionCard × N)
        Encouragement (neon-tinted light card)
    → empty: empty-state light card
    Simulator shortcut (light card, gold border)
```

### Social (`social.tsx`)
```
SafeAreaView (dark bg)
  ScrollView
    Header text
    Scope pills (dark variant)
    Podium (top-3 visual: colored bars + names)
    "Full Rankings" label
    LeaderRow × N (light cards)
    Achievements shortcut (light card, gold border)
```

### Settings (`settings.tsx`)
```
SafeAreaView (dark bg)
  ScrollView
    "Profile" title
    Profile hero card (light: avatar + name/email + badges)
    Stats row (3 light mini-cards: XP | Level | CO₂/wk)
    "Account" settings group (light grouped card)
    "App" settings group (light grouped card)
    Sign Out (danger row)
    Debug button (subtle)
```

---

## Animation Patterns

| Pattern | Where | How |
|---|---|---|
| Staggered section entrance | Dashboard sections | `Animated.stagger(90, [fade+slide × 5])` |
| Fade + slide-up on mount | All screen headers | `Animated.parallel([timing opacity, timing translateY])` |
| Animated bar width | ScoreCard, EmissionBar | `Animated.timing` → `interpolate → width %`, `useNativeDriver: false` |
| XP ring stroke | XPRing | `Animated.timing(strokeDashoffset)` |
| Tab icon glow | Active tab | `backgroundColor: rgba(gold, 0.1)` on icon wrapper |
| Card press | All touchables | `activeOpacity: 0.8` |

---

## Tab Bar

```ts
backgroundColor: C.overlay        // #0A2E1F — Abyss
borderTopColor: rgba(gold, 0.12)  // subtle gold line
activeTintColor: C.gold
inactiveTintColor: C.textMuted
height: 70
```

Active icon gets a `rgba(C.gold, 0.1)` rounded wrapper glow.
`headerShown: false` globally — every screen manages its own header.

---

## App File Structure

```
axiom/
├── DESIGN_SYSTEM.md            ← This file
├── app/
│   ├── _layout.tsx             ← Root auth guard
│   ├── (tabs)/
│   │   ├── _layout.tsx         ← Tab bar (headerShown: false)
│   │   ├── index.tsx           ← Dashboard
│   │   ├── log.tsx             ← Activity logger
│   │   ├── ai.tsx              ← AI Coach
│   │   ├── social.tsx          ← Leaderboard
│   │   └── settings.tsx        ← Profile & settings
│   └── onboarding/
│       ├── index.tsx           ← Auth screen (onboarding design system)
│       ├── profile-setup.tsx
│       └── permissions.tsx
│
├── src/
│   ├── constants/
│   │   └── colors.ts           ← ALL color tokens — import C
│   ├── components/
│   │   ├── OnboardingBg.tsx    ← Animated background (onboarding)
│   │   ├── StepDots.tsx        ← Connected step progress
│   │   ├── ScoreCard.tsx       ← CO₂ score (light card)
│   │   ├── EmissionBar.tsx     ← Category bar (animated)
│   │   ├── AIInsightBanner.tsx ← Gold-border AI card
│   │   ├── XPRing.tsx          ← SVG progress ring (light/dark variant)
│   │   ├── FeaturePill.tsx     ← Chip selector (light/dark variant)
│   │   ├── LeaderRow.tsx       ← Leaderboard entry (light card)
│   │   ├── SuggestionCard.tsx  ← AI suggestion (light card)
│   │   ├── AvatarCircle.tsx    ← Initials avatar
│   │   └── ...
│   ├── hooks/                  ← useGoogleAuth, useEmailAuth, useAIInsight, ...
│   ├── services/               ← firebase, authService, carbonEngine, gemini
│   ├── store/                  ← authStore, carbonStore, progressStore (Zustand)
│   └── types/                  ← UserProfile, ActivityCategory, ...
└── assets/
```

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `C.surface` for all tab-screen cards | Use `C.card` (dark) in tab screens |
| Use `C.textDark` on light cards | Use `C.text` (cream) on light cards |
| Use `C.textMuted` / `C.text` on dark bg | Use `C.textDark` on dark bg |
| Use `C.gold` for XP, AI, premium accents | Fill large areas with gold |
| Use `C.mint` for success / low CO₂ | Mix up mint and coral semantics |
| Add `borderColor: C.border` to all cards | Create cards with no border |
| Animate bars + rings on mount | Use static widths / offsets |
| Set `headerShown: false`, own header | Use default navigator header |
| `SafeAreaView edges={["top"]}` | Ignore status bar / notch |
