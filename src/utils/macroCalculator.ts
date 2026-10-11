import { GoalType } from '@/types/database.types';

export interface NutritionTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

/**
 * Calcula requerimientos nutricionales seguros basados en Mifflin-St Jeor y evidencia deportiva.
 * Sin déficits agresivos ni extremos.
 */
export function calculateMacroTargets(params: {
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  goal: GoalType;
  trainingDays: number;
}): NutritionTargets {
  const age = params.age && params.age >= 13 ? params.age : 25;
  const weight = params.weight_kg && params.weight_kg > 30 ? params.weight_kg : 70;
  const height = params.height_cm && params.height_cm > 100 ? params.height_cm : 175;

  // Tasa metabólica basal estimada (Mifflin-St Jeor neutra)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  // Factor de actividad según días de entrenamiento
  let activityFactor = 1.35; // Sedentario moderado con calistenia ligera
  if (params.trainingDays >= 4) activityFactor = 1.55;
  if (params.trainingDays >= 6) activityFactor = 1.7;

  const maintenanceCalories = Math.round(bmr * activityFactor);

  let targetCalories = maintenanceCalories;

  // Para menores de 18 años nunca aplicar déficit calórico
  const isMinor = age < 18;

  switch (params.goal) {
    case 'muscle_gain':
      // Superávit limpio moderado (+300 kcal)
      targetCalories = maintenanceCalories + 300;
      break;
    case 'strength':
      targetCalories = maintenanceCalories + 150;
      break;
    case 'fat_loss':
      // Déficit seguro y controlado (-350 kcal) solo para mayores de edad
      targetCalories = isMinor ? maintenanceCalories : Math.max(1500, maintenanceCalories - 350);
      break;
    case 'endurance':
    case 'general_fitness':
    default:
      targetCalories = maintenanceCalories;
      break;
  }

  // Proteína: 1.8g a 2.2g por kg de peso
  const protein_g = Math.round(weight * (params.goal === 'muscle_gain' || params.goal === 'fat_loss' ? 2.0 : 1.8));

  // Grasas: 0.9g por kg de peso
  const fat_g = Math.round(weight * 0.9);

  // Carbohidratos: calorías restantes divididas por 4 kcal/g
  const proteinCalories = protein_g * 4;
  const fatCalories = fat_g * 9;
  const remainingCalories = Math.max(400, targetCalories - (proteinCalories + fatCalories));
  const carbs_g = Math.round(remainingCalories / 4);

  // Requerimiento de agua: 35ml por kg de peso + 500ml por día activo
  const water_ml = Math.round(weight * 35 + (params.trainingDays > 0 ? 500 : 0));

  return {
    calories: targetCalories,
    protein_g,
    carbs_g,
    fat_g,
    water_ml,
  };
}
