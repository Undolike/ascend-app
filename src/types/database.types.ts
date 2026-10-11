export type GoalType = 'muscle_gain' | 'strength' | 'endurance' | 'fat_loss' | 'general_fitness';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'skills' | 'mobility';
export type EquipmentAvailable = 'none' | 'pullup_bar' | 'dip_bars' | 'rings' | 'resistance_bands' | 'parallettes';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MissionCategory = 'calisthenics' | 'nutrition' | 'grooming' | 'discipline' | 'mobility';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  avatar_url?: string;
  level: number;
  current_xp: number;
  current_streak: number;
  longest_streak: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGoals {
  id: string;
  user_id: string;
  primary_goal: GoalType;
  experience_level: ExperienceLevel;
  training_days_per_week: number;
  preferred_session_minutes: number;
  available_equipment: EquipmentAvailable[];
  training_space: 'small' | 'medium' | 'large';
  injuries_limitations: string[];
  dietary_restrictions: string[];
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  target_water_ml?: number;
  appearance_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primary_muscles: string[];
  secondary_muscles: string[];
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  instructions: string[];
  common_mistakes: string[];
  suggested_sets: number;
  suggested_reps: string;
  suggested_rest_sec: number;
  tempo: string;
  regression_exercise_id?: string;
  progression_exercise_id?: string;
  required_equipment: EquipmentAvailable[];
  contraindications: string[];
  is_skill: boolean;
}

export interface WorkoutPlan {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  day_label: string;
  category: string;
  target_minutes: number;
  exercises: {
    exercise_id: string;
    order: number;
    target_sets: number;
    target_reps: string;
    rest_seconds: number;
  }[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id?: string;
  title: string;
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
  rpe_score?: number; // 1 to 10
  notes?: string;
  total_volume_reps: number;
  xp_earned: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface WorkoutSessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps_completed: number;
  weight_added_kg?: number;
  hold_duration_sec?: number;
  rest_after_sec?: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
}

export interface ExerciseRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  max_reps: number;
  max_hold_seconds: number;
  max_weight_added_kg: number;
  achieved_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  is_local_economic: boolean;
  category: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  ai_estimated?: boolean;
}

export interface HabitDefinition {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  category: 'skincare' | 'grooming' | 'posture' | 'hydration' | 'reading' | 'sleep' | 'mobility';
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime';
  xp_reward: number;
  icon_name: string;
  is_active: boolean;
}

export interface HabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed_date: string;
  completed_at: string;
}

export interface DailyMission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: MissionCategory;
  xp_reward: number;
  target_count: number;
  current_count: number;
  completed: boolean;
  date_assigned: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  source: 'workout_completion' | 'daily_mission' | 'habit_completion' | 'achievement_unlocked';
  reference_id: string;
  xp_amount: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  badge_tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  workout_reminder: boolean;
  workout_time: string;
  morning_routine_reminder: boolean;
  morning_time: string;
  evening_routine_reminder: boolean;
  evening_time: string;
  hydration_reminder: boolean;
  hydration_interval_hours: number;
  weekly_review_reminder: boolean;
  tone: 'disciplined' | 'friendly' | 'minimalist';
}
