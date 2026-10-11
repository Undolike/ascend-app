-- ==============================================================================
-- ASCEND — PERSONAL EVOLUTION
-- MIGRACIÓN 003: Datos Semilla de Calistenia, Nutrición, Hábitos y Logros
-- ==============================================================================

-- 1. EJERCICIOS DE CALISTENIA
INSERT INTO public.exercises (
    id, name, category, primary_muscles, secondary_muscles, difficulty_level,
    instructions, common_mistakes, suggested_sets, suggested_reps, suggested_rest_sec,
    tempo, regression_exercise_id, progression_exercise_id, required_equipment, contraindications, is_skill
) VALUES
-- EMPUJE
(
    'pushup_knee', 'Flexiones de Rodillas', 'push',
    ARRAY['Pectoral', 'Tríceps']::TEXT[], ARRAY['Deltoides anterior', 'Core']::TEXT[], 1,
    ARRAY['Apoya las rodillas en una superficie suave', 'Manos a la anchura de los hombros', 'Baja el pecho manteniendo los codos a 45 grados', 'Empuja con fuerza hasta extender los brazos']::TEXT[],
    ARRAY['Hundir la zona lumbar', 'Abrir los codos a 90 grados estilo cruz']::TEXT[],
    3, '8-12', 60, '2-0-1-0', NULL, 'pushup_standard', ARRAY['none']::TEXT[],
    ARRAY['Dolor agudo en muñeca']::TEXT[], FALSE
),
(
    'pushup_standard', 'Flexiones Estándar', 'push',
    ARRAY['Pectoral', 'Tríceps']::TEXT[], ARRAY['Deltoides anterior', 'Core', 'Serrato']::TEXT[], 2,
    ARRAY['Cuerpo recto en plancha activa, glúteos contraídos', 'Baja hasta que el pecho roce el suelo', 'Mantén codos pegados a 45 grados respecto al torso', 'Empuja el suelo y haz protracción escapular arriba']::TEXT[],
    ARRAY['Bajar la cadera antes que el pecho', 'Dejar caer la cabeza hacia adelante']::TEXT[],
    4, '8-15', 90, '2-0-1-0', 'pushup_knee', 'pushup_diamond', ARRAY['none']::TEXT[],
    ARRAY['Tendinopatía severa de hombro']::TEXT[], FALSE
),
(
    'pushup_diamond', 'Flexiones Diamante', 'push',
    ARRAY['Tríceps', 'Pectoral interno']::TEXT[], ARRAY['Deltoides anterior', 'Core']::TEXT[], 3,
    ARRAY['Junta los dedos pulgares e índices formando un diamante con las manos', 'Mantén el cuerpo recto y baja controladamente hacia el centro del pecho', 'Extiende los brazos enfatizando el tríceps']::TEXT[],
    ARRAY['Abrir excesivamente los codos', 'Perder la tensión en abdomen']::TEXT[],
    3, '8-12', 90, '2-0-1-0', 'pushup_standard', 'pushup_decline', ARRAY['none']::TEXT[],
    ARRAY['Molestias articulares en muñecas']::TEXT[], FALSE
),
(
    'pushup_decline', 'Flexiones Declinadas', 'push',
    ARRAY['Pectoral superior', 'Deltoides anterior']::TEXT[], ARRAY['Tríceps', 'Core']::TEXT[], 3,
    ARRAY['Coloca los pies elevados sobre una superficie estable y segura (escalón o banco)', 'Manos en el suelo a la anchura de los hombros', 'Baja la cabeza y pecho con control', 'Empuja firmemente hacia arriba']::TEXT[],
    ARRAY['Apoyar pies en muebles inestables o resbaladizos', 'Arquear la espalda baja']::TEXT[],
    3, '8-12', 90, '2-1-1-0', 'pushup_standard', 'dips_parallel', ARRAY['none']::TEXT[],
    ARRAY['Hipertensión descontrolada']::TEXT[], FALSE
),
(
    'dips_parallel', 'Fondos en Paralelas / Sillas Estables', 'push',
    ARRAY['Pectoral inferior', 'Tríceps']::TEXT[], ARRAY['Deltoides anterior']::TEXT[], 4,
    ARRAY['Sujétate a barras paralelas o apoyos simétricos de máxima estabilidad', 'Baja doblando los codos hasta alcanzar 90 grados', 'Mantén hombros deprimidos (lejos de las orejas)', 'Sube empujando con potencia']::TEXT[],
    ARRAY['Bajar más de 90 grados si falta movilidad', 'Elevar los hombros hacia el cuello']::TEXT[],
    3, '6-10', 120, '2-1-1-0', 'pushup_diamond', NULL, ARRAY['dip_bars']::TEXT[],
    ARRAY['Lesión del manguito rotador', 'Inestabilidad acromioclavicular']::TEXT[], FALSE
),

-- TIRÓN
(
    'pull_scapular', 'Dominadas Escapulares', 'pull',
    ARRAY['Trapecio inferior', 'Dorsal ancho']::TEXT[], ARRAY['Romboides', 'Antebrazos']::TEXT[], 2,
    ARRAY['Cuélgate de una barra segura con agarre prono', 'Sin flexionar los codos, baja y junta las escápulas activamente', 'Mantén 2 segundos arriba y relaja de forma controlada']::TEXT[],
    ARRAY['Doblar los brazos para compensar', 'Balancear el cuerpo']::TEXT[],
    3, '8-10', 60, '1-2-1-0', NULL, 'pull_australian', ARRAY['pullup_bar']::TEXT[],
    ARRAY['Epitrocleitis aguda']::TEXT[], FALSE
),
(
    'pull_australian', 'Remos Australianos (Invertidos)', 'pull',
    ARRAY['Dorsal ancho', 'Romboides']::TEXT[], ARRAY['Bíceps', 'Deltoides posterior']::TEXT[], 2,
    ARRAY['Sujétate a una barra baja o soporte a la altura del pecho', 'Cuerpo recto con talones apoyados en el suelo', 'Lleva el pecho hacia la barra contrayendo la espalda', 'Baja con lentitud sin dejar caer los hombros']::TEXT[],
    ARRAY['Quebrar la cadera', 'Tirar solo con los brazos sin activar escápulas']::TEXT[],
    3, '8-12', 90, '2-1-1-0', NULL, 'pullup_standard', ARRAY['pullup_bar']::TEXT[],
    ARRAY['Dolor agudo en codo']::TEXT[], FALSE
),
(
    'pullup_standard', 'Dominadas Pronas', 'pull',
    ARRAY['Dorsal ancho', 'Espalda alta']::TEXT[], ARRAY['Bíceps', 'Antebrazos', 'Core']::TEXT[], 4,
    ARRAY['Cuélgate de la barra con palmas hacia el frente', 'Inicia el movimiento deprimiendo escápulas', 'Sube hasta pasar la barbilla por encima de la barra', 'Baja con control total sin dejarte caer']::TEXT[],
    ARRAY['Pataleo o kipping descontrolado', 'Rango de movimiento incompleto']::TEXT[],
    4, '4-8', 120, '2-0-1-0', 'pull_australian', 'chinup_standard', ARRAY['pullup_bar']::TEXT[],
    ARRAY['Ausencia de barra con soporte seguro']::TEXT[], FALSE
),
(
    'chinup_standard', 'Dominadas Supinas (Chin-ups)', 'pull',
    ARRAY['Bíceps', 'Dorsal ancho']::TEXT[], ARRAY['Pectoral mayor', 'Antebrazos']::TEXT[], 3,
    ARRAY['Agarra la barra con palmas mirando hacia ti a la anchura de hombros', 'Tracciona llevando el pecho hacia la barra', 'Baja hasta extensión completa de brazos']::TEXT[],
    ARRAY['Soltarse de golpe al descender', 'Girar muñecas durante el recorrido']::TEXT[],
    3, '5-10', 120, '2-0-1-0', 'pull_australian', NULL, ARRAY['pullup_bar']::TEXT[],
    ARRAY['Molestia en tendón bicipital']::TEXT[], FALSE
),

-- PIERNAS
(
    'squat_bodyweight', 'Sentadillas con Peso Corporal', 'legs',
    ARRAY['Cuádriceps', 'Glúteos']::TEXT[], ARRAY['Isquiotibiales', 'Gemelos', 'Core']::TEXT[], 1,
    ARRAY['Pies al ancho de hombros con puntas ligeramente hacia afuera', 'Desciende llevando la cadera atrás y abajo manteniendo el pecho erguido', 'Rompe el paralelo si tu movilidad lo permite', 'Empuja con la planta del pie para subir']::TEXT[],
    ARRAY['Levantar los talones del suelo', 'Meter las rodillas hacia adentro (valgo)']::TEXT[],
    4, '15-20', 60, '2-1-1-0', NULL, 'squat_bulgarian', ARRAY['none']::TEXT[],
    ARRAY['Meniscopatía aguda no tratada']::TEXT[], FALSE
),
(
    'squat_bulgarian', 'Sentadillas Búlgaras', 'legs',
    ARRAY['Cuádriceps', 'Glúteo mayor']::TEXT[], ARRAY['Isquiotibiales', 'Estabilizadores']::TEXT[], 3,
    ARRAY['Apoya el empeine de un pie sobre una superficie firme detrás de ti', 'Baja la rodilla trasera hacia el suelo manteniendo el torso firme', 'Sube empujando principalmente con el talón de la pierna delantera']::TEXT[],
    ARRAY['Poner el pie delantero demasiado cerca del banco', 'Perder el equilibrio por falta de tensión en core']::TEXT[],
    3, '8-12', 90, '2-1-1-0', 'squat_bodyweight', 'squat_pistol', ARRAY['none']::TEXT[],
    ARRAY['Dolor rotuliano agudo']::TEXT[], FALSE
),
(
    'squat_pistol', 'Pistol Squat (Sentadilla a una pierna)', 'legs',
    ARRAY['Cuádriceps', 'Glúteos', 'Equilibrio']::TEXT[], ARRAY['Tobillo', 'Core']::TEXT[], 5,
    ARRAY['Equilíbrate en un pie con la otra pierna extendida al frente', 'Baja en flexión profunda controlada', 'Sube sin impulsos bruscos manteniendo el talón firme']::TEXT[],
    ARRAY['Colapsar el tobillo', 'Hundir la espalda de forma descontrolada']::TEXT[],
    3, '3-6', 120, '3-1-1-0', 'squat_bulgarian', NULL, ARRAY['none']::TEXT[],
    ARRAY['Inestabilidad ligamentaria de rodilla']::TEXT[], TRUE
),
(
    'calf_raises', 'Elevaciones de Gemelos Unilaterales', 'legs',
    ARRAY['Gastrocnemio', 'Sóleo']::TEXT[], ARRAY['Tendón de Aquiles']::TEXT[], 2,
    ARRAY['Apóyate en el borde de un escalón firme en un solo pie', 'Baja el talón para conseguir estiramiento completo', 'Sube sobre la punta del pie manteniendo 1 segundo en la cima']::TEXT[],
    ARRAY['Rebotar en la fase excéntrica', 'Doblar la rodilla']::TEXT[],
    4, '12-18', 45, '2-1-1-1', NULL, NULL, ARRAY['none']::TEXT[],
    ARRAY['Fascitis plantar aguda']::TEXT[], FALSE
),

-- CORE
(
    'plank_standard', 'Plancha Abdominal Estática', 'core',
    ARRAY['Transverso abdominal', 'Recto abdominal']::TEXT[], ARRAY['Glúteos', 'Deltoides']::TEXT[], 1,
    ARRAY['Apoya antebrazos en el suelo alineados con los hombros', 'Activa glúteos, cuádriceps y abdomen formando una línea recta', 'Respira de forma fluida manteniendo la tensión constante']::TEXT[],
    ARRAY['Dejar caer la pelvis hacia el suelo', 'Elevar los glúteos en triángulo']::TEXT[],
    3, '30-60s', 60, 'ISOMÉTRICO', NULL, 'hollow_body_hold', ARRAY['none']::TEXT[],
    ARRAY['Hernia discal lumbar sintomática aguda']::TEXT[], FALSE
),
(
    'hollow_body_hold', 'Hollow Body Hold', 'core',
    ARRAY['Recto abdominal', 'Flexores de cadera']::TEXT[], ARRAY['Serrato', 'Cuádriceps']::TEXT[], 3,
    ARRAY['Acuéstate boca arriba y pega la zona lumbar completamente contra el suelo', 'Extiende brazos hacia atrás y piernas hacia adelante a pocos centímetros del suelo', 'Mantén la forma de canoa sin despegar la espalda baja']::TEXT[],
    ARRAY['Despegar la zona lumbar del suelo', 'Tensión cervical excesiva']::TEXT[],
    3, '20-40s', 60, 'ISOMÉTRICO', 'plank_standard', 'leg_raises_floor', ARRAY['none']::TEXT[],
    ARRAY['Dolor lumbar']::TEXT[], FALSE
),
(
    'leg_raises_floor', 'Elevaciones de Piernas en Suelo', 'core',
    ARRAY['Abdomen inferior', 'Iliopsoas']::TEXT[], ARRAY['Abdominales oblicuos']::TEXT[], 2,
    ARRAY['Boca arriba con manos a los lados del cuerpo', 'Eleva las piernas rectas hasta formar 90 grados', 'Desciende despacio sin permitir que la espalda baja se arquee']::TEXT[],
    ARRAY['Bajar las piernas de golpe', 'Levantar el cuello con tensión']::TEXT[],
    3, '10-15', 60, '2-0-1-0', 'plank_standard', NULL, ARRAY['none']::TEXT[],
    ARRAY['Sobrecarga en psoas ilíaco']::TEXT[], FALSE
),

-- HABILIDADES (SKILLS)
(
    'handstand_wall', 'Parada de Manos contra Pared (Wall Handstand)', 'skills',
    ARRAY['Hombros', 'Trapecios', 'Core']::TEXT[], ARRAY['Muñecas', 'Serrato anterior']::TEXT[], 3,
    ARRAY['Coloca las manos a un palmo de la pared firmes en el suelo', 'Sube los pies a la pared manteniendo el cuerpo en línea activa', 'Empuja el suelo como si quisieras alejarte de él y contrae glúteos']::TEXT[],
    ARRAY['Arquear la espalda en banana', 'Dejar de empujar con los hombros']::TEXT[],
    4, '15-30s', 90, 'ISOMÉTRICO', NULL, NULL, ARRAY['none']::TEXT[],
    ARRAY['Glaucoma', 'Vértigo', 'Lesión de muñeca']::TEXT[], TRUE
),
(
    'tuck_lsit', 'L-Sit en Suelo Encogido (Tuck L-Sit)', 'skills',
    ARRAY['Abdomen', 'Tríceps', 'Flexores de cadera']::TEXT[], ARRAY['Dorsales', 'Serrato']::TEXT[], 3,
    ARRAY['Siéntate con las piernas recogidas y manos apoyadas junto a la cadera', 'Empuja hacia abajo con fuerza deprimiendo escápulas y despega el cuerpo del suelo', 'Mantén las rodillas pegadas al pecho']::TEXT[],
    ARRAY['Doblar los codos por falta de fuerza de empuje', 'Hombros encogidos hacia las orejas']::TEXT[],
    3, '10-20s', 90, 'ISOMÉTRICO', NULL, NULL, ARRAY['none']::TEXT[],
    ARRAY['Síndrome del túnel carpiano severo']::TEXT[], TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 2. ALIMENTOS SALUDABLES Y ECONÓMICOS
INSERT INTO public.food_items (name, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g, is_local_economic, category) VALUES
('Pechuga de Pollo cocida', 100, 165, 31.0, 0.0, 3.6, 0.0, TRUE, 'Proteínas'),
('Huevos enteros medianos (2 uds)', 100, 143, 12.6, 0.7, 9.5, 0.0, TRUE, 'Proteínas'),
('Avena en hojuelas', 100, 389, 16.9, 66.3, 6.9, 10.6, TRUE, 'Carbohidratos'),
('Lentejas cocidas', 100, 116, 9.0, 20.0, 0.4, 7.9, TRUE, 'Legumbres'),
('Frijoles negros cocidos', 100, 132, 8.9, 23.7, 0.5, 8.7, TRUE, 'Legumbres'),
('Arroz integral cocido', 100, 111, 2.6, 23.0, 0.9, 1.8, TRUE, 'Carbohidratos'),
('Atún en agua escurrido', 100, 116, 26.0, 0.0, 1.0, 0.0, TRUE, 'Proteínas'),
('Queso fresco bajo en grasa', 100, 174, 15.0, 2.5, 11.5, 0.0, TRUE, 'Lácteos'),
('Aguacate mediano', 100, 160, 2.0, 8.5, 14.7, 6.7, TRUE, 'Grasas saludables'),
('Plátano / Banano fresco', 100, 89, 1.1, 22.8, 0.3, 2.6, TRUE, 'Frutas'),
('Manzana con piel', 100, 52, 0.3, 13.8, 0.2, 2.4, TRUE, 'Frutas'),
('Espinacas frescas', 100, 23, 2.9, 3.6, 0.4, 2.2, TRUE, 'Verduras')
ON CONFLICT DO NOTHING;

-- 3. HÁBITOS DE DISCIPLINA Y GLOW UP (Plantillas base)
INSERT INTO public.habit_definitions (title, description, category, time_of_day, xp_reward, icon_name, is_active) VALUES
('Limpieza y Protección Facial', 'Lavar rostro con agua tibia o limpiador y aplicar bloqueador solar', 'skincare', 'morning', 25, 'sparkles', TRUE),
('Hidratación Matutina (500ml)', 'Beber un vaso grande de agua al levantarse para activar el metabolismo', 'hydration', 'morning', 20, 'water', TRUE),
('Alineación Postural', '5 minutos de concientización: hombros atrás, pelvis neutra y cuello alineado', 'posture', 'afternoon', 25, 'body', TRUE),
('Rutina Nocturna de Piel e Higiene', 'Lavado facial nocturno, crema hidratante y cepillado dental con hilo', 'grooming', 'evening', 30, 'moon', TRUE),
('Lectura o Aprendizaje (10 min)', 'Lectura activa de desarrollo o habilidad sin distracciones de pantallas', 'reading', 'evening', 25, 'book', TRUE),
('Movilidad o Descompresión', 'Estiramientos suaves de caderas y espalda antes de descansar', 'mobility', 'evening', 25, 'fitness', TRUE)
ON CONFLICT DO NOTHING;

-- 4. LOGROS Y RECOMPENSAS
INSERT INTO public.achievements (id, code, title, description, icon, xp_reward, badge_tier) VALUES
('ach_first_workout', 'FIRST_WORKOUT', 'Primer Paso', 'Completaste tu primer entrenamiento de calistenia', 'barbell', 100, 'bronze'),
('ach_streak_7', 'STREAK_7', 'Disciplina Forjada', 'Mantén una racha de hábitos o entrenamientos durante 7 días', 'flame', 200, 'silver'),
('ach_streak_30', 'STREAK_30', 'Maestría de Hierro', 'Alcanza 30 días de consistencia activa', 'trophy', 500, 'gold'),
('ach_first_pullup', 'FIRST_PULLUP', 'Conquistador de la Barra', 'Registra tu primera serie de dominadas estrictas', 'fitness', 250, 'silver'),
('ach_nutrition_logged', 'NUTRITION_LOG', 'Combustible Limpio', 'Registra tus comidas y alcanza tus metas nutricionales en un día', 'restaurant', 100, 'bronze'),
('ach_level_5', 'LEVEL_5', 'Ascenso Nivel 5', 'Alcanza el Nivel 5 de evolución personal', 'ribbon', 300, 'gold')
ON CONFLICT (id) DO NOTHING;
