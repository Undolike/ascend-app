import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { getLevelProgress } from '@/utils/xpCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuthStore();
  const { goals, workoutPlans, loadGoals } = useUserProfileStore();
  const { startWorkout, isActive: isWorkoutActive } = useActiveWorkoutStore();
  const { loadDailyNutrition, getDailyTotals, waterIntakeMl, addWater } = useNutritionStore();
  const { habits, completedHabitIds, missions, loadData, toggleHabit, completeMission } =
    useGamificationStore();

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      loadGoals(user.id);
      loadDailyNutrition(todayStr, user.id);
      loadData(todayStr, user.id);
    }
  }, [user?.id]);

  const levelInfo = getLevelProgress(profile?.current_xp || 0);
  const nutritionTotals = getDailyTotals();
  const targetCalories = goals?.target_calories || 2200;
  const targetWater = goals?.target_water_ml || 2500;

  const handleXpEarned = (amount: number) => {
    if (profile) {
      updateProfile({
        current_xp: (profile.current_xp || 0) + amount,
      });
    }
  };

  const handleStartTodayWorkout = async () => {
    const plan = workoutPlans[0];
    if (plan) {
      const mapped = plan.exercises.map((e) => ({
        exerciseId: e.exercise_id,
        targetSets: e.target_sets,
        targetReps: e.target_reps,
        restSec: e.rest_seconds,
      }));
      await startWorkout(plan.title, mapped);
      router.push('/(tabs)/workout/active-session' as any);
    } else {
      router.push('/(tabs)/workout' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con Perfil, Nivel y Racha */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>HOLA, {profile?.display_name?.toUpperCase() || 'ATLETA'}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#FF7A00" />
            <Text style={styles.streakNumber}>{profile?.current_streak || 1}</Text>
            <Text style={styles.streakDays}>días</Text>
          </View>
        </View>

        {/* Tarjeta de Nivel y Barra de XP */}
        <Card style={styles.levelCard} accentBorder="lime">
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelLabel}>NIVEL</Text>
              <Text style={styles.levelNumber}>{levelInfo.currentLevel}</Text>
            </View>
            <View style={styles.xpInfo}>
              <View style={styles.xpRow}>
                <Text style={styles.xpText}>
                  {profile?.current_xp || 0} <Text style={{ color: COLORS.textMuted }}>XP Total</Text>
                </Text>
                <Text style={styles.xpPercentage}>{levelInfo.percentage}%</Text>
              </View>
              <ProgressBar
                progress={levelInfo.percentage}
                color={COLORS.primary}
                height={8}
                style={{ marginTop: 6 }}
              />
              <Text style={styles.xpNextLevel}>
                Faltan {levelInfo.xpNeededForNext - levelInfo.xpInCurrentLevel} XP para el Nivel {levelInfo.currentLevel + 1}
              </Text>
            </View>
          </View>
        </Card>

        {/* Notificación si hay un entrenamiento activo guardado */}
        {isWorkoutActive && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout/active-session' as any)}
            style={styles.activeWorkoutBanner}
          >
            <View style={styles.pulseDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTitle}>Entrenamiento en curso</Text>
              <Text style={styles.activeBannerDesc}>Toca aquí para reanudar tu sesión activa</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primaryText} />
          </TouchableOpacity>
        )}

        {/* Tarjeta de Entrenamiento del Día */}
        <Card style={styles.workoutCtaCard}>
          <View style={styles.cardHeader}>
            <Badge label="MISIÓN PRINCIPAL" variant="lime" size="sm" />
            <Text style={styles.xpRewardTag}>+100 XP</Text>
          </View>
          <Text style={styles.workoutCtaTitle}>
            {workoutPlans[0]?.title || 'Entrenamiento de Calistenia'}
          </Text>
          <Text style={styles.workoutCtaDesc}>
            {workoutPlans[0]?.description || 'Consistencia con peso corporal para hipertrofia y fuerza.'}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{goals?.preferred_session_minutes || 40} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                {workoutPlans[0]?.exercises.length || 5} ejercicios
              </Text>
            </View>
          </View>
          <Button
            title="Comenzar Entrenamiento"
            variant="primary"
            size="lg"
            onPress={handleStartTodayWorkout}
            icon={<Ionicons name="play" size={20} color={COLORS.primaryText} />}
            style={{ marginTop: SPACING.md }}
          />
        </Card>

        {/* Misiones Diarias */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Misiones del Día</Text>
            <Text style={styles.sectionSubtitle}>
              {missions.filter((m) => m.completed).length}/{missions.length} completadas
            </Text>
          </View>
          {missions.map((mission) => (
            <Card key={mission.id} style={styles.missionCard}>
              <TouchableOpacity
                onPress={() => completeMission(mission.id, user?.id || '', handleXpEarned)}
                style={styles.missionRow}
              >
                <Ionicons
                  name={mission.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={mission.completed ? COLORS.success : COLORS.textMuted}
                />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text
                    style={[
                      styles.missionTitle,
                      mission.completed && { textDecorationLine: 'line-through', color: COLORS.textMuted },
                    ]}
                  >
                    {mission.title}
                  </Text>
                  <Text style={styles.missionDesc}>{mission.description}</Text>
                </View>
                <Badge label={`+${mission.xp_reward} XP`} variant="violet" size="sm" />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Resumen Rápido de Nutrición e Hidratación */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Combustible & Agua</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition' as any)}>
              <Text style={styles.seeMoreLink}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.nutritionPreviewCard}>
            <View style={styles.nutriGrid}>
              <View style={styles.nutriCol}>
                <Text style={styles.nutriLabel}>Calorías</Text>
                <Text style={styles.nutriVal}>
                  {nutritionTotals.calories} / <Text style={{ fontSize: 13, color: COLORS.textMuted }}>{targetCalories}</Text>
                </Text>
                <ProgressBar
                  progress={(nutritionTotals.calories / targetCalories) * 100}
                  color={COLORS.primary}
                  height={5}
                  style={{ marginTop: 4 }}
                />
              </View>

              <View style={styles.nutriCol}>
                <Text style={styles.nutriLabel}>Agua</Text>
                <Text style={styles.nutriVal}>
                  {(waterIntakeMl / 1000).toFixed(1)} / <Text style={{ fontSize: 13, color: COLORS.textMuted }}>{(targetWater / 1000).toFixed(1)} L</Text>
                </Text>
                <ProgressBar
                  progress={(waterIntakeMl / targetWater) * 100}
                  color={COLORS.water}
                  height={5}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => addWater(250)}
              style={styles.quickAddWaterBtn}
            >
              <Ionicons name="add" size={16} color={COLORS.water} />
              <Text style={styles.quickAddWaterText}>+250ml Agua</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Hábitos Glow Up Rápidos */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hábitos Glow Up</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appearance' as any)}>
              <Text style={styles.seeMoreLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {habits.slice(0, 3).map((habit) => {
            const isCompleted = completedHabitIds.includes(habit.id);
            return (
              <TouchableOpacity
                key={habit.id}
                onPress={() => toggleHabit(habit.id, todayStr, user?.id || '', handleXpEarned)}
                style={[
                  styles.habitRowItem,
                  isCompleted && { borderColor: COLORS.secondary, backgroundColor: 'rgba(139, 92, 246, 0.08)' },
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isCompleted ? COLORS.secondary : COLORS.textMuted}
                />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text
                    style={[
                      styles.habitTitle,
                      isCompleted && { textDecorationLine: 'line-through', color: COLORS.textMuted },
                    ]}
                  >
                    {habit.title}
                  </Text>
                </View>
                <Text style={styles.habitXp}>+{habit.xp_reward} XP</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Floating / Access to Gemini AI Assistant */}
        <TouchableOpacity
          onPress={() => router.push('/ai-chat' as any)}
          style={styles.aiAdvisorBanner}
        >
          <View style={styles.aiIconBubble}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.aiBannerTitle}>Asistente Personal Gemini</Text>
            <Text style={styles.aiBannerSubtitle}>
              Consulta rutinas, técnicas seguras, alimentación o motivación.
            </Text>
          </View>
          <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greetingText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  dateText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF7A00',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  streakNumber: {
    color: '#FF7A00',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 4,
  },
  streakDays: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  levelCard: {
    marginBottom: SPACING.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelNumber: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  xpInfo: {
    flex: 1,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
  },
  xpPercentage: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  xpNextLevel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  activeWorkoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
    marginRight: SPACING.sm,
  },
  activeBannerTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '800',
  },
  activeBannerDesc: {
    color: '#2A3142',
    fontSize: 11,
    fontWeight: '600',
  },
  workoutCtaCard: {
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  xpRewardTag: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
  },
  workoutCtaTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  workoutCtaDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  seeMoreLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  missionCard: {
    marginBottom: SPACING.xs,
    padding: SPACING.md,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  missionDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  nutritionPreviewCard: {
    padding: SPACING.md,
  },
  nutriGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  nutriCol: {
    flex: 1,
  },
  nutriLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nutriVal: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  quickAddWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingVertical: 6,
    marginTop: SPACING.xs,
  },
  quickAddWaterText: {
    color: COLORS.water,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  habitRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  habitTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  habitXp: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
  },
  aiAdvisorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4338CA',
    padding: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  aiIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  aiBannerSubtitle: {
    color: '#C7D2FE',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
