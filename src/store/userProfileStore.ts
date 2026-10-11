import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserGoals, GoalType, ExperienceLevel, EquipmentAvailable, WorkoutPlan } from '@/types/database.types';
import { calculateMacroTargets } from '@/utils/macroCalculator';
import { generateCustomWorkoutPlans } from '@/utils/calisthenicsLogic';

const LOCAL_GOALS_KEY = 'ascend_local_user_goals';
const LOCAL_PLANS_KEY = 'ascend_local_workout_plans';

interface UserProfileState {
  goals: UserGoals | null;
  workoutPlans: WorkoutPlan[];
  isLoading: boolean;
  loadGoals: (userId: string) => Promise<void>;
  saveGoals: (goalsData: Partial<UserGoals>, userId: string) => Promise<void>;
  generateAndSaveInitialPlan: (userId: string) => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  goals: null,
  workoutPlans: [],
  isLoading: false,

  loadGoals: async (userId: string) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          set({ goals: data as UserGoals, isLoading: false });
          return;
        }
      }

      // Fallback local
      const stored = await AsyncStorage.getItem(LOCAL_GOALS_KEY);
      if (stored) {
        set({ goals: JSON.parse(stored), isLoading: false });
      } else {
        set({ goals: null, isLoading: false });
      }

      const storedPlans = await AsyncStorage.getItem(LOCAL_PLANS_KEY);
      if (storedPlans) {
        set({ workoutPlans: JSON.parse(storedPlans) });
      }
    } catch (e) {
      console.warn('Error loading goals:', e);
      set({ isLoading: false });
    }
  },

  saveGoals: async (goalsData: Partial<UserGoals>, userId: string) => {
    const current = get().goals;

    // Calcular metas nutricionales automáticas
    const macroTargets = calculateMacroTargets({
      age: 25,
      goal: goalsData.primary_goal || current?.primary_goal || 'muscle_gain',
      trainingDays: goalsData.training_days_per_week || current?.training_days_per_week || 3,
    });

    const updatedGoals: UserGoals = {
      id: current?.id || 'local-goals-id',
      user_id: userId,
      primary_goal: goalsData.primary_goal || current?.primary_goal || 'muscle_gain',
      experience_level: goalsData.experience_level || current?.experience_level || 'beginner',
      training_days_per_week: goalsData.training_days_per_week || current?.training_days_per_week || 3,
      preferred_session_minutes: goalsData.preferred_session_minutes || current?.preferred_session_minutes || 40,
      available_equipment: goalsData.available_equipment || current?.available_equipment || ['none'],
      training_space: goalsData.training_space || current?.training_space || 'medium',
      injuries_limitations: goalsData.injuries_limitations || current?.injuries_limitations || [],
      dietary_restrictions: goalsData.dietary_restrictions || current?.dietary_restrictions || [],
      target_calories: macroTargets.calories,
      target_protein_g: macroTargets.protein_g,
      target_carbs_g: macroTargets.carbs_g,
      target_fat_g: macroTargets.fat_g,
      target_water_ml: macroTargets.water_ml,
      appearance_goals: goalsData.appearance_goals || current?.appearance_goals || [],
      created_at: current?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...goalsData,
    };

    set({ goals: updatedGoals });
    await AsyncStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(updatedGoals));

    if (isSupabaseConfigured()) {
      await supabase.from('user_goals').upsert(updatedGoals);
    }
  },

  generateAndSaveInitialPlan: async (userId: string) => {
    const goals = get().goals;
    if (!goals) return;

    const plans = generateCustomWorkoutPlans({
      daysPerWeek: goals.training_days_per_week,
      availableEquipment: goals.available_equipment,
      experienceLevel: goals.experience_level,
      preferredMinutes: goals.preferred_session_minutes,
    });

    set({ workoutPlans: plans });
    await AsyncStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(plans));

    if (isSupabaseConfigured()) {
      for (const p of plans) {
        await supabase.from('workout_plans').upsert({
          ...p,
          user_id: userId,
        });
      }
    }
  },
}));
