import { Exercise, EquipmentAvailable, WorkoutPlan, ExperienceLevel } from '@/types/database.types';
import { INITIAL_EXERCISES } from '@/constants/exercisePresets';

interface RoutineGeneratorParams {
  daysPerWeek: number;
  availableEquipment: EquipmentAvailable[];
  experienceLevel: ExperienceLevel;
  preferredMinutes: number;
}

export function generateCustomWorkoutPlans(params: RoutineGeneratorParams): WorkoutPlan[] {
  const { daysPerWeek, availableEquipment, experienceLevel, preferredMinutes } = params;

  // Filtrar ejercicios según el equipo que el usuario realmente tiene en casa
  const availableExercises = INITIAL_EXERCISES.filter((ex) => {
    return ex.required_equipment.every((eq) => eq === 'none' || availableEquipment.includes(eq));
  });

  const getExercise = (id: string): Exercise => {
    const found = availableExercises.find((e) => e.id === id);
    if (found) return found;
    // Fallback al primer ejercicio compatible de la misma categoría o estándar
    return availableExercises[0];
  };

  const plans: WorkoutPlan[] = [];

  // Configuración de series según nivel
  const targetSets = experienceLevel === 'beginner' ? 3 : experienceLevel === 'advanced' ? 4 : 3;

  if (daysPerWeek <= 3) {
    // Rutina de Cuerpo Completo (Full Body) A y B
    const pushEx = experienceLevel === 'beginner' ? 'pushup_knee' : 'pushup_standard';
    const pullEx = availableEquipment.includes('pullup_bar') ? 'pull_australian' : 'pushup_standard';
    const legEx = experienceLevel === 'beginner' ? 'squat_bodyweight' : 'squat_bulgarian';
    const coreEx = 'plank_standard';

    plans.push({
      id: 'plan_fullbody_a',
      title: 'Full Body A — Fuerza Fundamental',
      description: 'Sesión integral para desarrollar base de empuje, pierna y núcleo.',
      day_label: 'Día 1 (Lunes)',
      category: 'Cuerpo Completo',
      target_minutes: preferredMinutes,
      exercises: [
        { exercise_id: pushEx, order: 1, target_sets: targetSets, target_reps: '8-12', rest_seconds: 90 },
        { exercise_id: legEx, order: 2, target_sets: targetSets, target_reps: '10-15', rest_seconds: 90 },
        { exercise_id: pullEx, order: 3, target_sets: targetSets, target_reps: '8-12', rest_seconds: 90 },
        { exercise_id: coreEx, order: 4, target_sets: 3, target_reps: '30-45s', rest_seconds: 60 },
        { exercise_id: 'shoulder_dislocates', order: 5, target_sets: 2, target_reps: '10 reps', rest_seconds: 45 },
      ],
    });

    plans.push({
      id: 'plan_fullbody_b',
      title: 'Full Body B — Control y Estabilidad',
      description: 'Enfoque en tensión isométrica, piernas unilaterales y postura.',
      day_label: 'Día 2 (Miércoles)',
      category: 'Cuerpo Completo',
      target_minutes: preferredMinutes,
      exercises: [
        { exercise_id: 'pushup_diamond', order: 1, target_sets: targetSets, target_reps: '8-10', rest_seconds: 90 },
        { exercise_id: 'calf_raises', order: 2, target_sets: 3, target_reps: '15-20', rest_seconds: 45 },
        { exercise_id: 'hollow_body_hold', order: 3, target_sets: 3, target_reps: '20-30s', rest_seconds: 60 },
        { exercise_id: 'cat_cow_stretch', order: 4, target_sets: 2, target_reps: '10 ciclos', rest_seconds: 30 },
      ],
    });

    plans.push({
      id: 'plan_fullbody_c',
      title: 'Full Body C — Resistencia y Capacidad',
      description: 'Consolidación semanal de volumen y movilidad activa.',
      day_label: 'Día 3 (Viernes)',
      category: 'Cuerpo Completo',
      target_minutes: preferredMinutes,
      exercises: [
        { exercise_id: pushEx, order: 1, target_sets: targetSets, target_reps: '10-15', rest_seconds: 90 },
        { exercise_id: legEx, order: 2, target_sets: targetSets, target_reps: '12-15', rest_seconds: 90 },
        { exercise_id: 'leg_raises_floor', order: 3, target_sets: 3, target_reps: '10-12', rest_seconds: 60 },
        { exercise_id: 'cat_cow_stretch', order: 4, target_sets: 2, target_reps: '10 ciclos', rest_seconds: 30 },
      ],
    });
  } else {
    // División Upper / Lower / Core para 4 o 5 días
    plans.push({
      id: 'plan_upper_1',
      title: 'Empuje y Torso Superior',
      description: 'Enfoque en pecho, tríceps y deltoides.',
      day_label: 'Día 1',
      category: 'Empuje',
      target_minutes: preferredMinutes,
      exercises: [
        { exercise_id: 'pushup_standard', order: 1, target_sets: targetSets, target_reps: '8-12', rest_seconds: 90 },
        { exercise_id: 'pushup_diamond', order: 2, target_sets: 3, target_reps: '8-10', rest_seconds: 90 },
        { exercise_id: 'pushup_decline', order: 3, target_sets: 3, target_reps: '8-10', rest_seconds: 90 },
        { exercise_id: 'shoulder_dislocates', order: 4, target_sets: 2, target_reps: '12 reps', rest_seconds: 45 },
      ],
    });

    plans.push({
      id: 'plan_lower_1',
      title: 'Piernas y Estabilidad Inferior',
      description: 'Fuerza unilateral, cuádriceps y gemelos.',
      day_label: 'Día 2',
      category: 'Piernas',
      target_minutes: preferredMinutes,
      exercises: [
        { exercise_id: 'squat_bulgarian', order: 1, target_sets: targetSets, target_reps: '8-12', rest_seconds: 90 },
        { exercise_id: 'squat_bodyweight', order: 2, target_sets: 3, target_reps: '15-20', rest_seconds: 60 },
        { exercise_id: 'calf_raises', order: 3, target_sets: 4, target_reps: '15 reps', rest_seconds: 45 },
      ],
    });

    plans.push({
      id: 'plan_core_pull',
      title: 'Tirón, Habilidades y Core',
      description: 'Espalda, abdomen compacto y estabilidad.',
      day_label: 'Día 3',
      category: 'Tirón / Core',
      target_minutes: preferredMinutes,
      exercises: [
        {
          exercise_id: availableEquipment.includes('pullup_bar') ? 'pullup_standard' : 'pushup_diamond',
          order: 1,
          target_sets: targetSets,
          target_reps: '5-8',
          rest_seconds: 120,
        },
        { exercise_id: 'hollow_body_hold', order: 2, target_sets: 3, target_reps: '30s', rest_seconds: 60 },
        { exercise_id: 'leg_raises_floor', order: 3, target_sets: 3, target_reps: '12 reps', rest_seconds: 60 },
      ],
    });
  }

  return plans;
}

/**
 * Motor de progresión inteligente:
 * Evalúa si el usuario está listo para avanzar a una variante más exigente
 * sin forzarlo si hubo fallo, dolor o fatiga excesiva.
 */
export function evaluateProgression(exerciseId: string, setsPerformance: { reps: number; rpe?: number }[]): {
  recommendation: 'progress' | 'maintain' | 'regress';
  suggestedExerciseId?: string;
  reason: string;
} {
  const current = INITIAL_EXERCISES.find((e) => e.id === exerciseId);
  if (!current) {
    return { recommendation: 'maintain', reason: 'Ejercicio no encontrado' };
  }

  const allSetsCompleted = setsPerformance.length >= (current.suggested_sets || 3);
  const avgRpe =
    setsPerformance.reduce((acc, curr) => acc + (curr.rpe || 7), 0) / (setsPerformance.length || 1);

  if (avgRpe >= 9.5) {
    // Fatiga extrema o posible sobreesfuerzo
    return {
      recommendation: current.regression_exercise_id ? 'regress' : 'maintain',
      suggestedExerciseId: current.regression_exercise_id || current.id,
      reason: 'Esfuerzo percibido muy alto (RPE 9.5+). Es aconsejable consolidar técnica o descargar.',
    };
  }

  if (allSetsCompleted && avgRpe <= 7.5 && current.progression_exercise_id) {
    return {
      recommendation: 'progress',
      suggestedExerciseId: current.progression_exercise_id,
      reason: 'Excelente control técnico y reserva de energía (RPE ≤ 7.5). ¡Estás listo para ascender a la siguiente variante!',
    };
  }

  return {
    recommendation: 'maintain',
    suggestedExerciseId: current.id,
    reason: 'Buen estímulo de trabajo. Mantén esta variante para perfeccionar rango y tempo antes de progresar.',
  };
}
