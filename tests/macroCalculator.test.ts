import { calculateMacroTargets } from '../src/utils/macroCalculator';

describe('Macro Calculator & Nutritional Safety', () => {
  test('Calcula calorías y macros seguros para ganancia muscular', () => {
    const targets = calculateMacroTargets({
      age: 25,
      weight_kg: 70,
      height_cm: 175,
      goal: 'muscle_gain',
      trainingDays: 4,
    });

    // Debe incluir superávit moderado
    expect(targets.calories).toBeGreaterThan(2000);
    // Proteína adecuada para hipertrofia (alrededor de 2.0g/kg = 140g)
    expect(targets.protein_g).toBe(140);
    // Grasas saludables (alrededor de 0.9g/kg = 63g)
    expect(targets.fat_g).toBe(63);
    // Carbohidratos para energía
    expect(targets.carbs_g).toBeGreaterThan(150);
    // Hidratación recomendada (al menos 2.5L)
    expect(targets.water_ml).toBeGreaterThanOrEqual(2500);
  });

  test('Protección de menores: no aplica déficit calórico agresivo a menores de edad', () => {
    const minorTargets = calculateMacroTargets({
      age: 16,
      weight_kg: 65,
      height_cm: 170,
      goal: 'fat_loss',
      trainingDays: 3,
    });

    const maintenanceEquivalent = calculateMacroTargets({
      age: 16,
      weight_kg: 65,
      height_cm: 170,
      goal: 'general_fitness',
      trainingDays: 3,
    });

    // Para menores de 18 años, el objetivo 'fat_loss' mantiene calorías sin recorte severo
    expect(minorTargets.calories).toBe(maintenanceEquivalent.calories);
  });

  test('Calcula hidratación escalada con peso y días de entrenamiento', () => {
    const light = calculateMacroTargets({
      age: 22,
      weight_kg: 60,
      height_cm: 170,
      goal: 'general_fitness',
      trainingDays: 0,
    });

    const heavy = calculateMacroTargets({
      age: 22,
      weight_kg: 90,
      height_cm: 185,
      goal: 'general_fitness',
      trainingDays: 4,
    });

    expect(heavy.water_ml).toBeGreaterThan(light.water_ml);
  });
});
