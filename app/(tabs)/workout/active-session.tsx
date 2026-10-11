import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuthStore();
  const {
    isActive,
    title,
    elapsedSeconds,
    exercises,
    completeSet,
    restTimeRemaining,
    isRestTimerRunning,
    startRestTimer,
    stopRestTimer,
    tickRestTimer,
    updateElapsed,
    finishWorkout,
    discardWorkout,
  } = useActiveWorkoutStore();

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionRpe, setSessionRpe] = useState(7);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completedSummary, setCompletedSummary] = useState<{
    totalReps: number;
    durationMinutes: number;
    xpEarned: number;
    newPRs: string[];
  } | null>(null);

  // Timer del entrenamiento
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      updateElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Timer del descanso
  useEffect(() => {
    if (!isRestTimerRunning) return;
    const restInterval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(restInterval);
  }, [isRestTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentExerciseSession = exercises[currentExIndex];

  const handleSetToggle = (setIdx: number, currentReps: number) => {
    completeSet(currentExIndex, setIdx, currentReps, 7);
  };

  const handleUpdateReps = (setIdx: number, delta: number) => {
    if (!currentExerciseSession) return;
    const targetSet = currentExerciseSession.sets[setIdx];
    const newReps = Math.max(1, targetSet.repsCompleted + delta);
    completeSet(currentExIndex, setIdx, newReps, targetSet.rpe || 7);
  };

  const handlePromptDiscard = () => {
    Alert.alert(
      '¿Descartar entrenamiento?',
      'Se perderán los registros de la sesión actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            await discardWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const handleFinishSession = async () => {
    if (!user?.id) return;
    const { session, newPRs } = await finishWorkout(user.id, sessionRpe, sessionNotes);

    if (profile) {
      await updateProfile({
        current_xp: (profile.current_xp || 0) + session.xp_earned,
        current_streak: (profile.current_streak || 0) + 1,
      });
    }

    setCompletedSummary({
      totalReps: session.total_volume_reps,
      durationMinutes: Math.round(session.duration_seconds / 60),
      xpEarned: session.xp_earned,
      newPRs,
    });
    setShowSummaryModal(true);
  };

  if (!isActive || !currentExerciseSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No hay sesión activa en este momento</Text>
          <Button
            title="Volver a Entrenar"
            variant="primary"
            size="md"
            onPress={() => router.replace('/(tabs)/workout' as any)}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barra Superior con Temporizador */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handlePromptDiscard}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.timerDisplay}>
          <Ionicons name="timer-outline" size={18} color={COLORS.primary} />
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <TouchableOpacity onPress={handleFinishSession} style={styles.finishTopBtn}>
          <Text style={styles.finishTopBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      {/* Temporizador de Descanso Activo Flotante */}
      {isRestTimerRunning && (
        <View style={styles.restTimerBar}>
          <View style={styles.restTimeInfo}>
            <Ionicons name="hourglass-outline" size={20} color={COLORS.primaryText} />
            <Text style={styles.restTimerTitle}>Descanso:</Text>
            <Text style={styles.restTimerSeconds}>{restTimeRemaining}s</Text>
          </View>
          <View style={styles.restActions}>
            <TouchableOpacity
              onPress={() => startRestTimer(restTimeRemaining + 30)}
              style={styles.restAddBtn}
            >
              <Text style={styles.restAddText}>+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={stopRestTimer} style={styles.restSkipBtn}>
              <Text style={styles.restSkipText}>Saltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Navegador de Ejercicios */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseTabsScroll}
      >
        {exercises.map((exSession, i) => {
          const isCurrent = i === currentExIndex;
          const allCompleted = exSession.sets.every((s) => s.completed);
          return (
            <TouchableOpacity
              key={exSession.exerciseId + i}
              onPress={() => setCurrentExIndex(i)}
              style={[
                styles.exerciseTab,
                isCurrent && styles.exerciseTabActive,
                allCompleted && styles.exerciseTabDone,
              ]}
            >
              <Text
                style={[
                  styles.exerciseTabText,
                  isCurrent && { color: COLORS.primaryText, fontWeight: '800' },
                  allCompleted && !isCurrent && { color: COLORS.success },
                ]}
              >
                {i + 1}. {exSession.exercise.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Contenido del Ejercicio Actual */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.exerciseHeader}>
          <Badge
            label={currentExerciseSession.exercise.category.toUpperCase()}
            variant="lime"
            size="sm"
          />
          <Text style={styles.exerciseName}>{currentExerciseSession.exercise.name}</Text>
          <Text style={styles.exerciseTargetDetail}>
            Tempo: {currentExerciseSession.exercise.tempo} • Descanso sugerido:{' '}
            {currentExerciseSession.exercise.suggested_rest_sec}s
          </Text>
        </View>

        {/* Lista de Series */}
        <View style={styles.setsContainer}>
          <View style={styles.setHeaderRow}>
            <Text style={[styles.setHeaderLabel, { width: 50 }]}>SERIE</Text>
            <Text style={[styles.setHeaderLabel, { flex: 1 }]}>REPETICIONES</Text>
            <Text style={[styles.setHeaderLabel, { width: 70, textAlign: 'center' }]}>
              ESTADO
            </Text>
          </View>

          {currentExerciseSession.sets.map((set, sIdx) => (
            <Card
              key={sIdx}
              style={[styles.setCard, set.completed && styles.setCardCompleted]}
            >
              <View style={styles.setRow}>
                <View style={styles.setNumberBadge}>
                  <Text style={styles.setNumberText}>{set.setNumber}</Text>
                </View>

                {/* Contador de Reps */}
                <View style={styles.repsCounter}>
                  <TouchableOpacity
                    onPress={() => handleUpdateReps(sIdx, -1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="remove" size={16} color={COLORS.text} />
                  </TouchableOpacity>

                  <Text style={styles.repsValueText}>{set.repsCompleted}</Text>

                  <TouchableOpacity
                    onPress={() => handleUpdateReps(sIdx, 1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="add" size={16} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* Botón de Completar */}
                <TouchableOpacity
                  onPress={() => handleSetToggle(sIdx, set.repsCompleted)}
                  style={[
                    styles.checkSetBtn,
                    set.completed && { backgroundColor: COLORS.success, borderColor: COLORS.success },
                  ]}
                >
                  <Ionicons
                    name={set.completed ? 'checkmark-done' : 'checkmark'}
                    size={20}
                    color={set.completed ? '#FFFFFF' : COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Instrucciones Técnicas Resumidas */}
        <Card style={styles.techInstructionsCard}>
          <Text style={styles.techTitle}>Técnica y Claves</Text>
          {currentExerciseSession.exercise.instructions.map((inst, idx) => (
            <Text key={idx} style={styles.techBullet}>
              • {inst}
            </Text>
          ))}
          {currentExerciseSession.exercise.common_mistakes.length > 0 && (
            <>
              <Text style={[styles.techTitle, { color: COLORS.warning, marginTop: SPACING.sm }]}>
                Errores Comunes a Evitar
              </Text>
              {currentExerciseSession.exercise.common_mistakes.map((err, idx) => (
                <Text key={idx} style={styles.techBullet}>
                  ⚠️ {err}
                </Text>
              ))}
            </>
          )}
        </Card>

        {/* Botón de Siguiente Ejercicio */}
        <View style={styles.navigationBtnsRow}>
          {currentExIndex < exercises.length - 1 ? (
            <Button
              title="Siguiente Ejercicio"
              variant="primary"
              size="lg"
              onPress={() => setCurrentExIndex(currentExIndex + 1)}
              icon={<Ionicons name="arrow-forward" size={18} color={COLORS.primaryText} />}
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="Finalizar Entrenamiento"
              variant="primary"
              size="lg"
              onPress={handleFinishSession}
              icon={<Ionicons name="trophy" size={18} color={COLORS.primaryText} />}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal de Resumen y Recompensas */}
      <Modal
        visible={showSummaryModal}
        transparent
        animationType="slide"
        onRequestClose={() => router.replace('/(tabs)/workout' as any)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalTrophyHeader}>
              <Ionicons name="trophy" size={54} color={COLORS.primary} />
              <Text style={styles.modalTitle}>¡Sesión Completada!</Text>
              <Text style={styles.modalSubtitle}>
                Has demostrado disciplina y consistencia con tu peso corporal.
              </Text>
            </View>

            <View style={styles.modalMetricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DURACIÓN</Text>
                <Text style={styles.metricVal}>{completedSummary?.durationMinutes} min</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>VOLUMEN TOTAL</Text>
                <Text style={styles.metricVal}>{completedSummary?.totalReps} reps</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>RECOMPENSA</Text>
                <Text style={[styles.metricVal, { color: COLORS.primary }]}>
                  +{completedSummary?.xpEarned} XP
                </Text>
              </View>
            </View>

            {completedSummary?.newPRs && completedSummary.newPRs.length > 0 && (
              <View style={styles.prBox}>
                <Text style={styles.prHeading}>🔥 ¡NUEVOS RÉCORDS PERSONALES!</Text>
                {completedSummary.newPRs.map((pr, i) => (
                  <Text key={i} style={styles.prItemText}>
                    ⭐ {pr}
                  </Text>
                ))}
              </View>
            )}

            <Button
              title="Guardar y Continuar"
              variant="primary"
              size="lg"
              onPress={() => {
                setShowSummaryModal(false);
                router.replace('/(tabs)/workout' as any);
              }}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  finishTopBtn: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  finishTopBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  restTimerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  restTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restTimerTitle: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  restTimerSeconds: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '900',
  },
  restActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  restAddBtn: {
    backgroundColor: '#2A3142',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  restSkipBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  restSkipText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseTabsScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  exerciseTab: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  exerciseTabDone: {
    borderColor: COLORS.success,
  },
  exerciseTabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  mainContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  exerciseHeader: {
    marginBottom: SPACING.md,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: SPACING.xs,
  },
  exerciseTargetDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  setsContainer: {
    marginBottom: SPACING.lg,
  },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  setHeaderLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  setCard: {
    marginBottom: SPACING.xs,
    padding: SPACING.sm,
  },
  setCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  repsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 12,
  },
  stepBtn: {
    padding: 6,
  },
  repsValueText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },
  checkSetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techInstructionsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  techTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  techBullet: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  navigationBtnsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTrophyHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: SPACING.sm,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  modalMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricVal: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  prBox: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  prHeading: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  prItemText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
