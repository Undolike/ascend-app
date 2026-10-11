export const XP_REWARDS = {
  WORKOUT_COMPLETION: 100,
  DAILY_MISSION: 50,
  HABIT_COMPLETED: 25,
  PERSONAL_RECORD: 75,
  BONUS_STREAK_7: 200,
} as const;

/**
 * Calcula el nivel alcanzado a partir de la experiencia total acumulada.
 * Fórmula progresiva: Nivel = 1 + floor(sqrt(xp / 75))
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return 1 + Math.floor(Math.sqrt(xp / 75));
}

/**
 * Calcula la experiencia mínima requerida para alcanzar un nivel determinado.
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return n * n * 75;
}

/**
 * Devuelve el progreso porcentual (0 - 100) dentro del nivel actual,
 * además del XP restante para ascender.
 */
export function getLevelProgress(currentXp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  percentage: number;
} {
  const currentLevel = calculateLevel(currentXp);
  const baseForCurrent = xpRequiredForLevel(currentLevel);
  const baseForNext = xpRequiredForLevel(currentLevel + 1);

  const xpInCurrentLevel = currentXp - baseForCurrent;
  const xpNeededForNext = baseForNext - baseForCurrent;
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))
  );

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNext,
    percentage,
  };
}
