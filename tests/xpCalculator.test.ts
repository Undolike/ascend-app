import {
  calculateLevel,
  xpRequiredForLevel,
  getLevelProgress,
  XP_REWARDS,
} from '../src/utils/xpCalculator';

describe('XP Calculator & Level Progression', () => {
  test('Nivel 1 con 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(-50)).toBe(1);
  });

  test('Calcula subida de nivel según curva cuadrática', () => {
    // Para nivel 2: (2-1)^2 * 75 = 75 XP
    expect(calculateLevel(74)).toBe(1);
    expect(calculateLevel(75)).toBe(2);
    expect(calculateLevel(150)).toBe(2);

    // Para nivel 3: (3-1)^2 * 75 = 300 XP
    expect(calculateLevel(299)).toBe(2);
    expect(calculateLevel(300)).toBe(3);

    // Para nivel 5: (5-1)^2 * 75 = 1200 XP
    expect(calculateLevel(1200)).toBe(5);
  });

  test('xpRequiredForLevel es consistente e inverso', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(75);
    expect(xpRequiredForLevel(3)).toBe(300);
    expect(xpRequiredForLevel(4)).toBe(675);
  });

  test('getLevelProgress calcula correctamente porcentaje y XP restante', () => {
    const progressAtZero = getLevelProgress(0);
    expect(progressAtZero.currentLevel).toBe(1);
    expect(progressAtZero.xpInCurrentLevel).toBe(0);
    expect(progressAtZero.xpNeededForNext).toBe(75);
    expect(progressAtZero.percentage).toBe(0);

    // Con 37 XP en nivel 1 (~50%)
    const progressMid = getLevelProgress(37);
    expect(progressMid.currentLevel).toBe(1);
    expect(progressMid.percentage).toBe(49);

    // Justo al subir a nivel 2 (75 XP)
    const progressAtLevel2 = getLevelProgress(75);
    expect(progressAtLevel2.currentLevel).toBe(2);
    expect(progressAtLevel2.xpInCurrentLevel).toBe(0);
    expect(progressAtLevel2.percentage).toBe(0);
  });

  test('Valores de recompensa de XP son positivos y proporcionales', () => {
    expect(XP_REWARDS.WORKOUT_COMPLETION).toBeGreaterThan(XP_REWARDS.DAILY_MISSION);
    expect(XP_REWARDS.DAILY_MISSION).toBeGreaterThan(XP_REWARDS.HABIT_COMPLETED);
    expect(XP_REWARDS.PERSONAL_RECORD).toBeGreaterThan(0);
  });
});
