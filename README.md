# ASCEND — Personal Evolution

Aplicación móvil integral de evolución y transformación personal mediante calistenia en casa, nutrición saludable, cuidado personal (Glow Up), disciplina y gamificación verificada.

Desarrollada con **React Native + Expo SDK 57**, **Expo Router**, **TypeScript**, **Supabase (PostgreSQL con RLS)**, **TanStack Query**, **Zustand** y **Google Gemini API**.

---

## 📱 Características Principales

### 1. Sistema de Calistenia en Casa (Motor Principal)
- **Biblioteca Completa de Ejercicios**: Empuje, Tirón, Piernas, Core, Habilidades (Handstand, L-Sit) y Movilidad, con técnica paso a paso, errores comunes y contraindicaciones biomecánicas.
- **Generador de Rutinas Personalizadas**: Adapta el programa al número de días disponibles y al equipo real disponible en casa (sin improvisar con muebles inestables ni exigir dominadas si no hay barra certificada).
- **Entrenamiento Activo en Vivo**:
  - Temporizador autónomo de sesión.
  - Registro interactivo de repeticiones y esfuerzo percibido (RPE).
  - Temporizador de descanso automatizado con alertas sonoras/hápticas.
  - Detección automática y guardado de **Récords Personales (PRs)**.
  - **Persistencia contra cierres inesperados**: La sesión se guarda en memoria local y se puede reanudar si la app se cierra.

### 2. Nutrición Saludable & Escáner con IA
- Calculadora de macronutrientes científicos basada en la ecuación de **Mifflin-St Jeor** (sin déficits calóricos agresivos ni extremos; protección especial para menores).
- Registro diario de comidas: Desayuno, Almuerzo, Cena y Meriendas.
- Base de datos de alimentos locales y económicos de alta biodisponibilidad proteica.
- Monitor de hidratación diaria con registro rápido (+250ml / +500ml).
- **Escáner de Platos con IA (Gemini)**: Estimación de porciones y macronutrientes a partir de descripciones/imágenes, con advertencia explícita de incertidumbre y edición previa al registro.

### 3. Glow Up, Postura y Cuidado Personal
- **Rutinas Diarias**: Mañana (skincare básico y protección solar), Tarde (alineación postural) y Noche (cuidado bucal, higiene facial y descanso).
- **Chequeo Postural Interactivo**: Pautas ergonómicas de alineación escapular y temporizador de 3 minutos de postura consciente.
- **Asesor de Estilo con IA (Gemini)**: Sugerencias respetuosas sobre armonía cromática, ajuste de prendas y calzado, sin juicios de valor personal ni diagnósticos clínicos.

### 4. Gamificación y Disciplina Verificada
- **Misiones Diarias y Semanales** con asignación verificable de XP.
- **Prevención de Duplicados**: Una misión o hábito solo puede otorgar experiencia una vez por instancia completada.
- **Rachas Inteligentes**: No penalizan el descanso necesario ni fomentan entrenar sobrelesionado.
- **Niveles e Insignias**: Fórmula matemática progresiva inmutable en servidor y local.

### 5. Asistente Personal con IA (Gemini)
- Modal interactivo con respuestas sobre biomecánica segura, ideas de comidas según macros y motivación realista sin positividad tóxica.
- Fallback elegante si la app está fuera de línea o sin conexión a la API.

---

## 🗄️ Arquitectura y Base de Datos (Supabase)

La base de datos se gestiona con **PostgreSQL** y **Row Level Security (RLS)** estricto en todas las tablas:
- `profiles`: Perfil, nivel, XP acumulado, racha actual y más larga.
- `user_goals`: Metas, días disponibles, equipo doméstico y lesiones.
- `exercises`: Catálogo maestro de calistenia con regresiones y progresiones.
- `workout_plans`: Rutinas asignadas por usuario o globales.
- `workout_sessions`: Historial de entrenamientos completados, duración y RPE.
- `workout_session_exercises`: Series individuales y repeticiones registradas.
- `exercise_records`: Historial de récords personales (PRs).
- `food_items` & `meal_entries`: Catálogo y registro diario de alimentos y macros.
- `habit_definitions` & `habit_completions`: Catálogo y registro diario de hábitos.
- `daily_missions`: Misiones del día generadas automáticamente.
- `xp_transactions`: Registro contable inmutable de experiencia para evitar trampas.
- `achievements` & `user_achievements`: Catálogo y desbloqueo de insignias.
- `notification_preferences`: Configuración de horarios y tono de recordatorios.

Las migraciones se encuentran en `supabase/migrations/`:
- `20261011_001_initial_schema.sql` (Esquema y políticas RLS)
- `20261011_002_gamification_triggers.sql` (Triggers y función RPC `grant_user_xp`)
- `20261011_003_seed_calisthenics_data.sql` (Datos semilla de ejercicios, alimentos, hábitos y logros)

---

## 🚀 Cómo Ejecutar la Aplicación en tu Dispositivo Android (Uso Personal)

### Opción A: Ejecutar directamente con Expo Go en tu teléfono Android (Recomendada)
1. Instala **Expo Go** desde Google Play Store en tu teléfono Android.
2. Abre la terminal en esta carpeta (`/home/undolike/Projects/ascend`).
3. Inicia el servidor de desarrollo:
   ```bash
   npx expo start
   ```
4. Escanea el código QR que aparecerá en la terminal con la cámara de tu teléfono o con la app Expo Go (asegúrate de que el teléfono y la computadora estén en la misma red Wi-Fi o usa el modo `--tunnel`).

### Opción B: Ejecutar en un Emulador de Android en Linux
```bash
npx expo start --android
```

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con suites de pruebas unitarias con Jest:
- Cálculo de XP, niveles progresivos y porcentajes.
- Cálculo seguro de calorías (TDEE), macronutrientes e hidratación.
- Motor de sobrecarga progresiva y filtrado de equipo doméstico.
- Integridad de rachas y prevención de transacciones duplicadas de XP.

Para ejecutar las pruebas:
```bash
npm test
```

Para verificar tipos en TypeScript:
```bash
npx tsc --noEmit
```

---

## ⚙️ Configuración de Servicios Opcionales

La aplicación funciona al 100% en modo local/offline sin necesidad de configurar ningún servicio externo. Si deseas sincronizar tus datos con una nube privada o activar la API de Gemini:

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ejecuta los 3 archivos de migración SQL en el **SQL Editor** de Supabase.
3. Copia tus credenciales en el archivo `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   EXPO_PUBLIC_GEMINI_API_KEY=tu-api-key-de-gemini
   ```
