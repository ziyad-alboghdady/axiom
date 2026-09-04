/**
 * Axiom XP Level System
 *
 * XP thresholds and level names for gamification.
 */

export interface LevelDefinition {
  level: number;
  name: string;
  minXp: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Beginner",      minXp: 0    },
  { level: 2, name: "Eco Starter",   minXp: 100  },
  { level: 3, name: "Green Thinker", minXp: 300  },
  { level: 4, name: "Carbon Saver",  minXp: 600  },
  { level: 5, name: "Green Hero",    minXp: 1000 },
];

/**
 * Get the current level for a given XP total.
 */
export function getLevelForXp(xp: number): LevelDefinition {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get XP needed to reach the next level.
 * Returns 0 if already at max level.
 */
export function xpToNextLevel(xp: number): number {
  const current = getLevelForXp(xp);
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level + 1);
  if (nextIndex === -1) return 0;
  return LEVELS[nextIndex].minXp - xp;
}
