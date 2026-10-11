import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, WorkoutSession, WorkoutSessionExercise } from '@/types/database.types';
import { INITIAL_EXERCISES } from '@/constants/exercisePresets';
import { XP_REWARDS } from '@/utils/xpCalculator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ACTIVE_WORKOUT_STORAGE_KEY = 'ascend_active_workout_state';
const WORKOUT_HISTORY_KEY = 'ascend_workout_history';
const EXERCISE_RECORDS_KEY = 'ascend_exercise_records';

export interface SetEntry {
  setNumber: number;
  targetReps: string;
  repsCompleted: number;
  weightAddedKg?: number;
  holdDurationSec?: number;
  completed: boolean;
  rpe?: number;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  exercise: Exercise;
  sets: SetEntry[];
}

interface ActiveWorkoutState {
  isActive: boolean;
  title: string;
  startedAt: string | null;
  elapsedSeconds: number;
  currentExerciseIndex: number;
  exercises: ActiveExerciseSession[];
  restTimeRemaining: number;
  isRestTimerRunning: boolean;
  currentRestDuration: number;
  completedSessions: WorkoutSession[];

  startWorkout: (title: string, exerciseList: { exerciseId: string; targetSets: number; targetReps: string; restSec?: number }[]) => Promise<void>;
  completeSet: (exerciseIndex: number, setIndex: number, repsCompleted: number, rpe?: number) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  updateElapsed: () => void;
  finishWorkout: (userId: string, rpeScore?: number, notes?: string) => Promise<{ session: WorkoutSession; newPRs: string[] }>;
  discardWorkout: () => Promise<void>;
  restoreSavedWorkout: () => Promise<boolean>;
  loadHistory: (userId: string) => Promise<void>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  isActive: false,
  title: '',
  startedAt: null,
  elapsedSeconds: 0,
  currentExerciseIndex: 0,
  exercises: [],
  restTimeRemaining: 0,
  isRestTimerRunning: false,
  currentRestDuration: 90,
  completedSessions: [],

  startWorkout: async (title, exerciseList) => {
    const formattedExercises: ActiveExerciseSession[] = exerciseList.map((item) => {
      const exercise =
        INITIAL_EXERCISES.find((e) => e.id === item.exerciseId) || INITIAL_EXERCISES[0];
      const sets: SetEntry[] = Array.from({ length: item.targetSets }).map((_, i) => ({
        setNumber: i + 1,
        targetReps: item.targetReps,
        repsCompleted: parseInt(item.targetReps, 10) || 10,
        completed: false,
      }));
      return {
        exerciseId: item.exerciseId,
        exercise,
        sets,
      };
    });

    const now = new Date().toISOString();
    const newState = {
      isActive: true,
      title,
      startedAt: now,
      elapsedSeconds: 0,
      currentExerciseIndex: 0,
      exercises: formattedExercises,
      restTimeRemaining: 0,
      isRestTimerRunning: false,
      currentRestDuration: 90,
    };

    set(newState);
    await AsyncStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(newState));
  },

  completeSet: (exerciseIndex, setIndex, repsCompleted, rpe = 7) => {
    const { exercises } = get();
    const updated = [...exercises];
    const targetEx = updated[exerciseIndex];
    if (!targetEx) return;

    targetEx.sets[setIndex] = {
      ...targetEx.sets[setIndex],
      repsCompleted,
      rpe,
      completed: true,
    };

    set({ exercises: updated });
    // Iniciar automáticamente descanso sugerido
    get().startRestTimer(targetEx.exercise.suggested_rest_sec || 90);
    // Guardar estado de respaldo
    AsyncStorage.setItem(
      ACTIVE_WORKOUT_STORAGE_KEY,
      JSON.stringify({ ...get(), exercises: updated })
    );
  },

  startRestTimer: (seconds) => {
    set({
      restTimeRemaining: seconds,
      currentRestDuration: seconds,
      isRestTimerRunning: true,
    });
  },

  stopRestTimer: () => {
    set({ isRestTimerRunning: false, restTimeRemaining: 0 });
  },

  tickRestTimer: () => {
    const current = get().restTimeRemaining;
    if (current <= 1) {
      set({ restTimeRemaining: 0, isRestTimerRunning: false });
    } else {
      set({ restTimeRemaining: current - 1 });
    }
  },

  updateElapsed: () => {
    const started = get().startedAt;
    if (started) {
      const seconds = Math.floor((Date.now() - new Date(started).getTime()) / 1000);
      set({ elapsedSeconds: Math.max(0, seconds) });
    }
  },

  finishWorkout: async (userId, rpeScore = 7, notes = '') => {
    const { title, startedAt, elapsedSeconds, exercises, completedSessions } = get();
    const completedAt = new Date().toISOString();

    let totalReps = 0;
    const newPRs: string[] = [];

    // Calcular volumen total y verificar récords
    const storedRecordsRaw = await AsyncStorage.getItem(EXERCISE_RECORDS_KEY);
    const storedRecords: Record<string, number> = storedRecordsRaw ? JSON.parse(storedRecordsRaw) : {};

    exercises.forEach((exSession) => {
      exSession.sets.forEach((set) => {
        if (set.completed) {
          totalReps += set.repsCompleted;
          const currentRecord = storedRecords[exSession.exerciseId] || 0;
          if (set.repsCompleted > currentRecord) {
            storedRecords[exSession.exerciseId] = set.repsCompleted;
            newPRs.push(`${exSession.exercise.name}: ${set.repsCompleted} reps`);
          }
        }
      });
    });

    await AsyncStorage.setItem(EXERCISE_RECORDS_KEY, JSON.stringify(storedRecords));

    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      user_id: userId,
      title,
      started_at: startedAt || completedAt,
      completed_at: completedAt,
      duration_seconds: elapsedSeconds,
      rpe_score: rpeScore,
      notes,
      total_volume_reps: totalReps,
      xp_earned: XP_REWARDS.WORKOUT_COMPLETION + (newPRs.length > 0 ? XP_REWARDS.PERSONAL_RECORD : 0),
      status: 'completed',
    };

    const newHistory = [session, ...completedSessions];
    set({
      isActive: false,
      startedAt: null,
      elapsedSeconds: 0,
      exercises: [],
      isRestTimerRunning: false,
      completedSessions: newHistory,
    });

    await AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(newHistory));

    // Si Supabase está configurado, sincronizar sesión
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('workout_sessions').insert(session);
        // Otorgar XP en servidor
        await supabase.rpc('grant_user_xp', {
          p_source: 'workout_completion',
          p_reference_id: session.id,
          p_xp_amount: session.xp_earned,
        });
      } catch (err) {
        console.warn('Sync workout session warning:', err);
      }
    }

    return { session, newPRs };
  },

  discardWorkout: async () => {
    set({
      isActive: false,
      startedAt: null,
      elapsedSeconds: 0,
      exercises: [],
      isRestTimerRunning: false,
    });
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  },

  restoreSavedWorkout: async () => {
    try {
      const saved = await AsyncStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.isActive && data.startedAt) {
          const now = Date.now();
          const started = new Date(data.startedAt).getTime();
          const elapsed = Math.floor((now - started) / 1000);
          set({
            ...data,
            elapsedSeconds: elapsed,
          });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  loadHistory: async (userId: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false });

        if (data && data.length > 0) {
          set({ completedSessions: data as WorkoutSession[] });
          return;
        }
      }

      const stored = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      if (stored) {
        set({ completedSessions: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Error loading workout history:', e);
    }
  },
}));
