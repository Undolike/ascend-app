-- ==============================================================================
-- ASCEND — PERSONAL EVOLUTION
-- MIGRACIÓN 001: Esquema Inicial de Base de Datos y Row Level Security (RLS)
-- ==============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Perfiles de usuario)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    height_cm NUMERIC(5, 2) CHECK (height_cm > 50 AND height_cm < 300),
    weight_kg NUMERIC(5, 2) CHECK (weight_kg > 20 AND weight_kg < 500),
    avatar_url TEXT,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER_GOALS (Objetivos y configuración personalizada)
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL CHECK (primary_goal IN ('muscle_gain', 'strength', 'endurance', 'fat_loss', 'general_fitness')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
    training_days_per_week INTEGER NOT NULL DEFAULT 3 CHECK (training_days_per_week BETWEEN 1 AND 7),
    preferred_session_minutes INTEGER NOT NULL DEFAULT 40 CHECK (preferred_session_minutes BETWEEN 15 AND 120),
    available_equipment TEXT[] NOT NULL DEFAULT ARRAY['none']::TEXT[],
    training_space TEXT NOT NULL DEFAULT 'medium' CHECK (training_space IN ('small', 'medium', 'large')),
    injuries_limitations TEXT[] DEFAULT ARRAY[]::TEXT[],
    dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
    target_calories INTEGER,
    target_protein_g NUMERIC(5, 1),
    target_carbs_g NUMERIC(5, 1),
    target_fat_g NUMERIC(5, 1),
    target_water_ml INTEGER DEFAULT 2500,
    appearance_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- 3. EXERCISES (Catálogo maestro de calistenia)
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('push', 'pull', 'legs', 'core', 'skills', 'mobility')),
    primary_muscles TEXT[] NOT NULL,
    secondary_muscles TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    instructions TEXT[] NOT NULL,
    common_mistakes TEXT[] NOT NULL,
    suggested_sets INTEGER NOT NULL DEFAULT 3,
    suggested_reps TEXT NOT NULL DEFAULT '8-12',
    suggested_rest_sec INTEGER NOT NULL DEFAULT 90,
    tempo TEXT NOT NULL DEFAULT '2-0-1-0',
    regression_exercise_id TEXT,
    progression_exercise_id TEXT,
    required_equipment TEXT[] NOT NULL DEFAULT ARRAY['none']::TEXT[],
    contraindications TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_skill BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. WORKOUT_PLANS (Rutinas personalizadas de calistenia)
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    day_label TEXT NOT NULL,
    category TEXT NOT NULL,
    target_minutes INTEGER NOT NULL DEFAULT 45,
    exercises JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. WORKOUT_SESSIONS (Sesiones de entrenamiento registradas)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    rpe_score INTEGER CHECK (rpe_score BETWEEN 1 AND 10),
    notes TEXT,
    total_volume_reps INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- 6. WORKOUT_SESSION_EXERCISES (Series completadas por ejercicio)
CREATE TABLE IF NOT EXISTS public.workout_session_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    set_number INTEGER NOT NULL CHECK (set_number >= 1),
    reps_completed INTEGER NOT NULL DEFAULT 0,
    weight_added_kg NUMERIC(5, 2) DEFAULT 0,
    hold_duration_sec INTEGER DEFAULT 0,
    rest_after_sec INTEGER DEFAULT 90,
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. EXERCISE_RECORDS (Récords Personales PRs)
CREATE TABLE IF NOT EXISTS public.exercise_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    max_reps INTEGER NOT NULL DEFAULT 0,
    max_hold_seconds INTEGER NOT NULL DEFAULT 0,
    max_weight_added_kg NUMERIC(5, 2) NOT NULL DEFAULT 0,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, exercise_id)
);

-- 8. FOOD_ITEMS (Catálogo de alimentos nutritivos y económicos)
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    serving_size_g NUMERIC(6, 1) NOT NULL DEFAULT 100,
    calories NUMERIC(6, 1) NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL,
    carbs_g NUMERIC(5, 1) NOT NULL,
    fat_g NUMERIC(5, 1) NOT NULL,
    fiber_g NUMERIC(5, 1) DEFAULT 0,
    is_local_economic BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT NOT NULL
);

-- 9. MEAL_ENTRIES (Registro de comidas y macronutrientes)
CREATE TABLE IF NOT EXISTS public.meal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name TEXT NOT NULL,
    portion_g NUMERIC(6, 1) NOT NULL,
    calories NUMERIC(6, 1) NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL,
    carbs_g NUMERIC(5, 1) NOT NULL,
    fat_g NUMERIC(5, 1) NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ai_estimated BOOLEAN NOT NULL DEFAULT FALSE
);

-- 10. HABIT_DEFINITIONS (Hábitos de disciplina y apariencia)
CREATE TABLE IF NOT EXISTS public.habit_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('skincare', 'grooming', 'posture', 'hydration', 'reading', 'sleep', 'mobility')),
    time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
    xp_reward INTEGER NOT NULL DEFAULT 20,
    icon_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. HABIT_COMPLETIONS (Registro de hábitos completados)
CREATE TABLE IF NOT EXISTS public.habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habit_definitions(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, habit_id, completed_date)
);

-- 12. DAILY_MISSIONS (Misiones diarias gamificadas)
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    target_count INTEGER NOT NULL DEFAULT 1,
    current_count INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, title, date_assigned)
);

-- 13. XP_TRANSACTIONS (Movimientos de experiencia inmutables)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('workout_completion', 'daily_mission', 'habit_completion', 'achievement_unlocked')),
    reference_id TEXT NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, source, reference_id)
);

-- 14. ACHIEVEMENTS & USER_ACHIEVEMENTS (Insignias y logros)
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    badge_tier TEXT NOT NULL CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'diamond'))
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, achievement_id)
);

-- 15. NOTIFICATION_PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    workout_time TEXT NOT NULL DEFAULT '18:00',
    morning_routine_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    morning_time TEXT NOT NULL DEFAULT '07:30',
    evening_routine_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    evening_time TEXT NOT NULL DEFAULT '22:00',
    hydration_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    hydration_interval_hours INTEGER NOT NULL DEFAULT 3,
    weekly_review_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    tone TEXT NOT NULL DEFAULT 'disciplined',
    UNIQUE(user_id)
);

-- 16. PROGRESS_ENTRIES (Evolución física opcional)
CREATE TABLE IF NOT EXISTS public.progress_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2),
    waist_cm NUMERIC(5, 2),
    chest_cm NUMERIC(5, 2),
    arms_cm NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. AI_REQUESTS (Control de límites y auditoría mínima)
CREATE TABLE IF NOT EXISTS public.ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('meal_scanner', 'style_advisor', 'assistant_chat', 'routine_builder')),
    token_usage INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

-- 1. Tablas Públicas / Catálogos Maestros (Lectura para todos los usuarios autenticados)
CREATE POLICY "Ejercicios legibles por todos" ON public.exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alimentos legibles por todos" ON public.food_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logros legibles por todos" ON public.achievements FOR SELECT TO authenticated USING (true);

-- 2. Políticas aisladas por usuario (Solo el propietario puede leer o escribir sus datos)
CREATE POLICY "Perfiles propios" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Metas propias" ON public.user_goals FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Planes propios" ON public.workout_plans FOR ALL TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Sesiones propias" ON public.workout_sessions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Series propias" ON public.workout_session_exercises FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = workout_session_exercises.session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Records propios" ON public.exercise_records FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Comidas propias" ON public.meal_entries FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Hábitos propios" ON public.habit_definitions FOR ALL TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Completitud hábitos propios" ON public.habit_completions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Misiones propias" ON public.daily_missions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Transacciones XP propias" ON public.xp_transactions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Logros desbloqueados propios" ON public.user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notificaciones propias" ON public.notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Progreso propio" ON public.progress_entries FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Solicitudes IA propias" ON public.ai_requests FOR ALL TO authenticated USING (auth.uid() = user_id);
