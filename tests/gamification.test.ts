import { calculateLevel, XP_REWARDS } from '../src/utils/xpCalculator';

describe('Gamification & Streak Integrity', () => {
  test('Racha no se rompe por días de descanso programados', () => {
    // Lógica pura de evaluación de rachas
    const evaluateStreak = (
      lastActiveDate: string,
      currentDate: string,
      currentStreak: number,
      isRestDay: boolean
    ): number => {
      const last = new Date(lastActiveDate).getTime();
      const curr = new Date(currentDate).getTime();
      const diffDays = Math.round((curr - last) / (1000 * 3600 * 24));

      if (diffDays === 0) return currentStreak;
      if (diffDays === 1) return currentStreak + 1;
      // Si fue día de descanso programado y han pasado 2 días, mantener racha
      if (diffDays === 2 && isRestDay) return currentStreak + 1;
      return 1; // Reinicia a 1 si pasaron más días sin justificación
    };

    expect(evaluateStreak('2026-10-10', '2026-10-11', 5, false)).toBe(6);
    expect(evaluateStreak('2026-10-09', '2026-10-11', 5, true)).toBe(6);
    expect(evaluateStreak('2026-10-05', '2026-10-11', 5, false)).toBe(1);
  });

  test('Prevención de transacciones duplicadas de XP', () => {
    const existingTransactions = new Set<string>();

    const grantXpSafely = (
      userId: string,
      source: string,
      referenceId: string,
      amount: number
    ): { success: boolean; granted: number } => {
      const key = `${userId}_${source}_${referenceId}`;
      if (existingTransactions.has(key)) {
        return { success: false, granted: 0 };
      }
      existingTransactions.add(key);
      return { success: true, granted: amount };
    };

    const firstAttempt = grantXpSafely('usr1', 'daily_mission', 'mis_100', 50);
    expect(firstAttempt.success).toBe(true);
    expect(firstAttempt.granted).toBe(50);

    // Segundo intento idéntico debe ser rechazado
    const secondAttempt = grantXpSafely('usr1', 'daily_mission', 'mis_100', 50);
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.granted).toBe(0);
  });
});
