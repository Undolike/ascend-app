import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { WorkoutPlan } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutMainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { workoutPlans, goals, loadGoals } = useUserProfileStore();
  const { startWorkout, completedSessions, loadHistory, isActive } = useActiveWorkoutStore();

  useEffect(() => {
    if (user?.id) {
      loadGoals(user.id);
      loadHistory(user.id);
    }
  }, [user?.id]);

  const handleLaunchPlan = async (plan: WorkoutPlan) => {
    const mapped = plan.exercises.map((e) => ({
      exerciseId: e.exercise_id,
      targetSets: e.target_sets,
      targetReps: e.target_reps,
      restSec: e.rest_seconds,
    }));
    await startWorkout(plan.title, mapped);
    router.push('/(tabs)/workout/active-session' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>SISTEMA DE CALISTENIA</Text>
            <Text style={styles.title}>Entrenamiento</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout/exercise-library' as any)}
            style={styles.libraryIconBtn}
          >
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            <Text style={styles.libraryBtnText}>Biblioteca</Text>
          </TouchableOpacity>
        </View>

        {/* Banner de sesión activa si existe */}
        {isActive && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout/active-session' as any)}
            style={styles.resumeBanner}
          >
            <View style={styles.pulseIndicator} />
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle}>Sesión activa en curso</Text>
              <Text style={styles.resumeSubtitle}>Toca para volver a registrar tus series y descanso</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primaryText} />
          </TouchableOpacity>
        )}

        {/* Resumen de Objetivos de Calistenia */}
        <Card style={styles.summaryCard} accentBorder="lime">
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>PROGRAMA SEMANAL</Text>
              <Text style={styles.summaryValue}>
                {goals?.training_days_per_week || 3} Días / Semana
              </Text>
            </View>
            <Badge
              label={goals?.experience_level?.toUpperCase() || 'PRINCIPIANTE'}
              variant="lime"
              size="sm"
            />
          </View>
          <Text style={styles.summaryDesc}>
            Rutinas calibradas para {goals?.available_equipment?.includes('pullup_bar') ? 'con barra segura' : 'solo peso corporal sin barra'}.
          </Text>
        </Card>

        {/* Lista de Rutinas Asignadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus Rutinas Programadas</Text>
          {workoutPlans.map((plan, idx) => (
            <Card key={plan.id || idx} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Badge label={plan.day_label || `Día ${idx + 1}`} variant="violet" size="sm" />
                <View style={styles.durationTag}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{plan.target_minutes} min</Text>
                </View>
              </View>

              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planDesc}>{plan.description}</Text>

              <View style={styles.planMetaRow}>
                <Text style={styles.exerciseCountText}>
                  {plan.exercises?.length || 4} ejercicios de peso corporal
                </Text>
              </View>

              <Button
                title="Iniciar Rutina"
                variant="primary"
                size="md"
                onPress={() => handleLaunchPlan(plan)}
                icon={<Ionicons name="play" size={18} color={COLORS.primaryText} />}
                style={styles.startPlanBtn}
              />
            </Card>
          ))}
        </View>

        {/* Historial Reciente de Sesiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Sesiones</Text>
          {completedSessions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Aún no hay sesiones registradas</Text>
              <Text style={styles.emptyDesc}>
                Completa tu primer entrenamiento para visualizar volumen de repeticiones y nuevos récords.
              </Text>
            </Card>
          ) : (
            completedSessions.slice(0, 5).map((session) => (
              <Card key={session.id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{session.title}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(session.completed_at || session.started_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyVolume}>{session.total_volume_reps} reps</Text>
                    <Text style={styles.historyTime}>
                      {Math.round(session.duration_seconds / 60)} min
                    </Text>
                  </View>
                  <Badge label={`+${session.xp_earned} XP`} variant="lime" size="sm" />
                </View>
              </Card>
            ))
          )}
        </View>
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
    marginBottom: SPACING.lg,
  },
  brandSubtitle: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    marginTop: 2,
  },
  libraryIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  libraryBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.danger,
    marginRight: SPACING.md,
  },
  resumeTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '800',
  },
  resumeSubtitle: {
    color: '#242B38',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.sm,
    lineHeight: 16,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  planCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  planTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    marginTop: 4,
  },
  planDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  planMetaRow: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  exerciseCountText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  startPlanBtn: {
    marginTop: SPACING.xs,
  },
  historyCard: {
    marginBottom: SPACING.xs,
    padding: SPACING.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  historyDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  historyStats: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  historyVolume: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  historyTime: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptyDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
