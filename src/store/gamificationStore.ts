import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitDefinition, DailyMission, Achievement } from '@/types/database.types';
import { XP_REWARDS, calculateLevel } from '@/utils/xpCalculator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const HABITS_STORE_KEY = 'ascend_habits_definitions';
const HABIT_COMPLETIONS_KEY = 'ascend_habit_completions';
const MISSIONS_KEY = 'ascend_daily_missions';
const ACHIEVEMENTS_KEY = 'ascend_unlocked_achievements';

export const DEFAULT_HABITS: HabitDefinition[] = [
  { id: 'h1', title: 'Limpieza y Bloqueador Solar', description: 'Rutina facial matutina para proteger la piel', category: 'skincare', time_of_day: 'morning', xp_reward: 25, icon_name: 'sparkles', is_active: true },
  { id: 'h2', title: '500ml de Agua al Despertar', description: 'Activación del sistema digestivo e hidratación celular', category: 'hydration', time_of_day: 'morning', xp_reward: 20, icon_name: 'water', is_active: true },
  { id: 'h3', title: 'Alineación Postural y Descompresión', description: '5 min de hombros atrás, cuello neutro y escápulas activas', category: 'posture', time_of_day: 'afternoon', xp_reward: 25, icon_name: 'body', is_active: true },
  { id: 'h4', title: 'Cuidado Facial Nocturno e Hilo Dental', description: 'Limpieza facial profunda y salud bucal estricta', category: 'grooming', time_of_day: 'evening', xp_reward: 30, icon_name: 'moon', is_active: true },
  { id: 'h5', title: 'Lectura o Aprendizaje (10 min)', description: 'Lectura enfocada para desarrollo personal o habilidades', category: 'reading', time_of_day: 'evening', xp_reward: 25, icon_name: 'book', is_active: true },
  { id: 'h6', title: 'Movilidad Suave de Cadera y Espalda', description: 'Gato-vaca y estiramientos suaves antes de dormir', category: 'mobility', time_of_day: 'evening', xp_reward: 25, icon_name: 'fitness', is_active: true },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_workout', code: 'FIRST_WORKOUT', title: 'Primer Paso', description: 'Completaste tu primera sesión de calistenia', icon: 'barbell', xp_reward: 100, badge_tier: 'bronze' },
  { id: 'ach_streak_7', code: 'STREAK_7', title: 'Disciplina Forjada', description: 'Alcanza 7 días de consistencia activa', icon: 'flame', xp_reward: 200, badge_tier: 'silver' },
  { id: 'ach_nutrition_logged', code: 'NUTRITION_LOG', title: 'Combustible Limpio', description: 'Registra tus comidas del día', icon: 'restaurant', xp_reward: 100, badge_tier: 'bronze' },
  { id: 'ach_level_5', code: 'LEVEL_5', title: 'Ascenso Nivel 5', description: 'Alcanza el Nivel 5 de evolución personal', icon: 'ribbon', xp_reward: 300, badge_tier: 'gold' },
];

interface GamificationState {
  habits: HabitDefinition[];
  completedHabitIds: string[];
  missions: DailyMission[];
  unlockedAchievementCodes: string[];
  isLoading: boolean;

  loadData: (dateString: string, userId: string) => Promise<void>;
  toggleHabit: (habitId: string, dateString: string, userId: string, onXpEarned: (xp: number) => void) => Promise<void>;
  completeMission: (missionId: string, userId: string, onXpEarned: (xp: number) => void) => Promise<void>;
  unlockAchievement: (code: string, userId: string, onXpEarned: (xp: number) => void) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  habits: DEFAULT_HABITS,
  completedHabitIds: [],
  missions: [],
  unlockedAchievementCodes: [],
  isLoading: false,

  loadData: async (dateString, userId) => {
    set({ isLoading: true });
    try {
      // 1. Hábitos completados en la fecha
      const compKey = `${HABIT_COMPLETIONS_KEY}_${dateString}`;
      const savedCompletions = await AsyncStorage.getItem(compKey);
      const completedHabitIds: string[] = savedCompletions ? JSON.parse(savedCompletions) : [];

      // 2. Misiones diarias
      const missionKey = `${MISSIONS_KEY}_${dateString}`;
      const savedMissions = await AsyncStorage.getItem(missionKey);
      let missions: DailyMission[] = [];

      if (savedMissions) {
        missions = JSON.parse(savedMissions);
      } else {
        // Generar misiones del día
        missions = [
          {
            id: `mis_calis_${dateString}`,
            user_id: userId,
            title: 'Sesión de Calistenia en Casa',
            description: 'Completa tu rutina programada con técnica estricta',
            category: 'calisthenics',
            xp_reward: 75,
            target_count: 1,
            current_count: 0,
            completed: false,
            date_assigned: dateString,
          },
          {
            id: `mis_water_${dateString}`,
            user_id: userId,
            title: 'Meta de Hidratación',
            description: 'Bebe al menos 2 litros de agua durante el día',
            category: 'discipline',
            xp_reward: 50,
            target_count: 1,
            current_count: 0,
            completed: false,
            date_assigned: dateString,
          },
          {
            id: `mis_glow_${dateString}`,
            user_id: userId,
            title: 'Rutina Glow Up Completa',
            description: 'Cumple el cuidado facial y la alineación postural',
            category: 'grooming',
            xp_reward: 50,
            target_count: 1,
            current_count: 0,
            completed: false,
            date_assigned: dateString,
          },
        ];
        await AsyncStorage.setItem(missionKey, JSON.stringify(missions));
      }

      // 3. Logros
      const savedAch = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      const unlockedAchievementCodes: string[] = savedAch ? JSON.parse(savedAch) : [];

      set({
        habits: DEFAULT_HABITS,
        completedHabitIds,
        missions,
        unlockedAchievementCodes,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error loading gamification data:', e);
      set({ isLoading: false });
    }
  },

  toggleHabit: async (habitId, dateString, userId, onXpEarned) => {
    const { completedHabitIds, habits } = get();
    const isCompleted = completedHabitIds.includes(habitId);
    const compKey = `${HABIT_COMPLETIONS_KEY}_${dateString}`;

    if (isCompleted) {
      // Desmarcar
      const next = completedHabitIds.filter((id) => id !== habitId);
      set({ completedHabitIds: next });
      await AsyncStorage.setItem(compKey, JSON.stringify(next));
    } else {
      // Marcar y otorgar XP de forma segura
      const next = [...completedHabitIds, habitId];
      set({ completedHabitIds: next });
      await AsyncStorage.setItem(compKey, JSON.stringify(next));

      const targetHabit = habits.find((h) => h.id === habitId);
      const xp = targetHabit?.xp_reward || XP_REWARDS.HABIT_COMPLETED;
      onXpEarned(xp);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('habit_completions').upsert({
            user_id: userId,
            habit_id: habitId,
            completed_date: dateString,
          });
          await supabase.rpc('grant_user_xp', {
            p_source: 'habit_completion',
            p_reference_id: `${habitId}_${dateString}`,
            p_xp_amount: xp,
          });
        } catch (err) {
          console.warn('Supabase habit sync warning:', err);
        }
      }
    }
  },

  completeMission: async (missionId, userId, onXpEarned) => {
    const { missions } = get();
    const target = missions.find((m) => m.id === missionId);
    if (!target || target.completed) return;

    const updated = missions.map((m) =>
      m.id === missionId ? { ...m, completed: true, current_count: m.target_count } : m
    );
    set({ missions: updated });

    const missionKey = `${MISSIONS_KEY}_${target.date_assigned}`;
    await AsyncStorage.setItem(missionKey, JSON.stringify(updated));

    onXpEarned(target.xp_reward);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('daily_missions').upsert({
          ...target,
          completed: true,
          current_count: target.target_count,
        });
        await supabase.rpc('grant_user_xp', {
          p_source: 'daily_mission',
          p_reference_id: target.id,
          p_xp_amount: target.xp_reward,
        });
      } catch (err) {
        console.warn('Supabase mission sync warning:', err);
      }
    }
  },

  unlockAchievement: async (code, userId, onXpEarned) => {
    const { unlockedAchievementCodes } = get();
    if (unlockedAchievementCodes.includes(code)) return;

    const next = [...unlockedAchievementCodes, code];
    set({ unlockedAchievementCodes: next });
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));

    const ach = INITIAL_ACHIEVEMENTS.find((a) => a.code === code);
    if (ach) {
      onXpEarned(ach.xp_reward);
      if (isSupabaseConfigured()) {
        try {
          await supabase.rpc('grant_user_xp', {
            p_source: 'achievement_unlocked',
            p_reference_id: ach.id,
            p_xp_amount: ach.xp_reward,
          });
        } catch (err) {
          console.warn('Achievement sync error:', err);
        }
      }
    }
  },
}));
