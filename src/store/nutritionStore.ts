import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry, MealType, FoodItem } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { XP_REWARDS } from '@/utils/xpCalculator';

const MEALS_STORAGE_KEY = 'ascend_nutrition_meals';
const WATER_STORAGE_KEY = 'ascend_nutrition_water';

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', name: 'Pechuga de Pollo cocida', serving_size_g: 100, calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, is_local_economic: true, category: 'Proteínas' },
  { id: 'f2', name: 'Huevos enteros (2 uds)', serving_size_g: 100, calories: 143, protein_g: 12.6, carbs_g: 0.7, fat_g: 9.5, is_local_economic: true, category: 'Proteínas' },
  { id: 'f3', name: 'Avena en hojuelas', serving_size_g: 100, calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9, is_local_economic: true, category: 'Carbohidratos' },
  { id: 'f4', name: 'Lentejas cocidas', serving_size_g: 100, calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, is_local_economic: true, category: 'Legumbres' },
  { id: 'f5', name: 'Frijoles negros cocidos', serving_size_g: 100, calories: 132, protein_g: 8.9, carbs_g: 23.7, fat_g: 0.5, is_local_economic: true, category: 'Legumbres' },
  { id: 'f6', name: 'Arroz integral cocido', serving_size_g: 100, calories: 111, protein_g: 2.6, carbs_g: 23, fat_g: 0.9, is_local_economic: true, category: 'Carbohidratos' },
  { id: 'f7', name: 'Atún en agua escurrido', serving_size_g: 100, calories: 116, protein_g: 26, carbs_g: 0, fat_g: 1, is_local_economic: true, category: 'Proteínas' },
  { id: 'f8', name: 'Queso fresco bajo en grasa', serving_size_g: 100, calories: 174, protein_g: 15, carbs_g: 2.5, fat_g: 11.5, is_local_economic: true, category: 'Lácteos' },
  { id: 'f9', name: 'Aguacate mediano', serving_size_g: 100, calories: 160, protein_g: 2, carbs_g: 8.5, fat_g: 14.7, is_local_economic: true, category: 'Grasas saludables' },
  { id: 'f10', name: 'Plátano / Banano fresco', serving_size_g: 100, calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, is_local_economic: true, category: 'Frutas' },
];

interface NutritionState {
  todayEntries: MealEntry[];
  waterIntakeMl: number;
  selectedDate: string; // YYYY-MM-DD
  foodCatalog: FoodItem[];

  loadDailyNutrition: (dateString: string, userId: string) => Promise<void>;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'logged_at'>, userId: string) => Promise<void>;
  deleteMealEntry: (entryId: string, userId: string) => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
  resetWater: () => Promise<void>;
  getDailyTotals: () => { calories: number; protein: number; carbs: number; fat: number };
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayEntries: [],
  waterIntakeMl: 0,
  selectedDate: new Date().toISOString().split('T')[0],
  foodCatalog: INITIAL_FOOD_ITEMS,

  loadDailyNutrition: async (dateString, userId) => {
    set({ selectedDate: dateString });
    try {
      // 1. Cargar agua
      const waterKey = `${WATER_STORAGE_KEY}_${dateString}`;
      const savedWater = await AsyncStorage.getItem(waterKey);
      set({ waterIntakeMl: savedWater ? parseInt(savedWater, 10) : 0 });

      // 2. Cargar comidas
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('meal_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', dateString);

        if (data) {
          set({ todayEntries: data as MealEntry[] });
          return;
        }
      }

      const localMealsRaw = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
      if (localMealsRaw) {
        const allMeals: MealEntry[] = JSON.parse(localMealsRaw);
        const filtered = allMeals.filter((m) => m.date === dateString);
        set({ todayEntries: filtered });
      } else {
        set({ todayEntries: [] });
      }
    } catch (e) {
      console.warn('Error loading nutrition:', e);
    }
  },

  addMealEntry: async (entryData, userId) => {
    const newEntry: MealEntry = {
      ...entryData,
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      logged_at: new Date().toISOString(),
    };

    const updated = [...get().todayEntries, newEntry];
    set({ todayEntries: updated });

    // Guardar en AsyncStorage
    const allStoredRaw = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    const allMeals: MealEntry[] = allStoredRaw ? JSON.parse(allStoredRaw) : [];
    allMeals.push(newEntry);
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(allMeals));

    // Si Supabase está configurado, guardar
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('meal_entries').insert(newEntry);
      } catch (err) {
        console.warn('Sync meal entry error:', err);
      }
    }
  },

  deleteMealEntry: async (entryId, userId) => {
    const updated = get().todayEntries.filter((m) => m.id !== entryId);
    set({ todayEntries: updated });

    const allStoredRaw = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    if (allStoredRaw) {
      const allMeals: MealEntry[] = JSON.parse(allStoredRaw);
      const filtered = allMeals.filter((m) => m.id !== entryId);
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(filtered));
    }

    if (isSupabaseConfigured()) {
      await supabase.from('meal_entries').delete().eq('id', entryId);
    }
  },

  addWater: async (amountMl) => {
    const current = get().waterIntakeMl;
    const date = get().selectedDate;
    const next = current + amountMl;
    set({ waterIntakeMl: next });
    const waterKey = `${WATER_STORAGE_KEY}_${date}`;
    await AsyncStorage.setItem(waterKey, String(next));
  },

  resetWater: async () => {
    const date = get().selectedDate;
    set({ waterIntakeMl: 0 });
    const waterKey = `${WATER_STORAGE_KEY}_${date}`;
    await AsyncStorage.setItem(waterKey, '0');
  },

  getDailyTotals: () => {
    const { todayEntries } = get();
    return todayEntries.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein_g,
        carbs: acc.carbs + item.carbs_g,
        fat: acc.fat + item.fat_g,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
}));
