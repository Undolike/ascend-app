import {
  generateCustomWorkoutPlans,
  evaluateProgression,
} from '../src/utils/calisthenicsLogic';

describe('Calisthenics Engine & Safe Progression', () => {
  test('Generador excluye dominadas si el usuario no tiene barra de dominadas segura', () => {
    const plansNoBar = generateCustomWorkoutPlans({
      daysPerWeek: 3,
      availableEquipment: ['none'],
      experienceLevel: 'beginner',
      preferredMinutes: 40,
    });

    plansNoBar.forEach((plan) => {
      plan.exercises.forEach((ex) => {
        // Ningún ejercicio debe requerir pullup_bar si no la tiene
        expect(ex.exercise_id).not.toBe('pullup_standard');
      });
    });
  });

  test('Generador incluye ejercicios de tirón si el usuario cuenta con barra segura', () => {
    const plansWithBar = generateCustomWorkoutPlans({
      daysPerWeek: 3,
      availableEquipment: ['pullup_bar'],
      experienceLevel: 'intermediate',
      preferredMinutes: 45,
    });

    const hasPullExercise = plansWithBar.some((plan) =>
      plan.exercises.some((e) => e.exercise_id === 'pull_australian' || e.exercise_id === 'pullup_standard')
    );
    expect(hasPullExercise).toBe(true);
  });

  test('Motor de progresión: propone avanzar si se completaron las series con RPE holgado', () => {
    const result = evaluateProgression('pushup_standard', [
      { reps: 15, rpe: 7 },
      { reps: 15, rpe: 7 },
      { reps: 14, rpe: 7 },
      { reps: 15, rpe: 7 },
    ]);

    expect(result.recommendation).toBe('progress');
    expect(result.suggestedExerciseId).toBe('pushup_diamond');
  });

  test('Motor de progresión: propone descargar o mantener si el esfuerzo fue límite (RPE 9.5+)', () => {
    const result = evaluateProgression('pushup_standard', [
      { reps: 6, rpe: 10 },
      { reps: 5, rpe: 10 },
      { reps: 4, rpe: 10 },
    ]);

    expect(result.recommendation).toBe('regress');
    expect(result.suggestedExerciseId).toBe('pushup_knee');
  });
});
