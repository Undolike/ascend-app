import React, { useState } from 'react';
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
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useAuthStore } from '@/store/authStore';
import { XP_REWARDS } from '@/utils/xpCalculator';
import { Ionicons } from '@expo/vector-icons';

const APPEARANCE_GOALS = [
  { key: 'posture', label: 'Mejora de Postura Corporal', desc: 'Alineación de hombros, cuello y columna erguida' },
  { key: 'skincare', label: 'Cuidado Facial (Skincare)', desc: 'Limpieza, hidratación diaria y protección solar' },
  { key: 'grooming', label: 'Higiene y Cuidado Personal', desc: 'Higiene oral profunda, cabello y barba pulcros' },
  { key: 'style', label: 'Estilo y Coordinación de Ropa', desc: 'Combinación armónica de colores y ajuste de prendas' },
  { key: 'sleep', label: 'Higiene de Sueño y Descanso', desc: 'Desconexión digital nocturna para recuperación óptima' },
];

export default function OnboardingStep5() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuthStore();
  const { goals, saveGoals, generateAndSaveInitialPlan } = useUserProfileStore();

  const [appearance, setAppearance] = useState<string[]>(
    goals?.appearance_goals.length
      ? goals.appearance_goals
      : ['posture', 'skincare', 'sleep']
  );
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<'morning' | 'afternoon' | 'evening'>('evening');
  const [loading, setLoading] = useState(false);

  const toggleAppearance = (key: string) => {
    if (appearance.includes(key)) {
      setAppearance(appearance.filter((a) => a !== key));
    } else {
      setAppearance([...appearance, key]);
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // 1. Guardar metas finales
      await saveGoals(
        {
          appearance_goals: appearance,
        },
        user.id
      );

      // 2. Generar y guardar plan inicial personalizado de calistenia
      await generateAndSaveInitialPlan(user.id);

      // 3. Marcar onboarding como completado y otorgar XP inicial
      await updateProfile({
        onboarding_completed: true,
        current_xp: (profile?.current_xp || 0) + XP_REWARDS.WORKOUT_COMPLETION,
      });

      // 4. Entrar a la experiencia completa
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('Error finishing onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.stepRow}>
            <Text style={styles.stepText}>PASO 5 DE 5</Text>
            <Text style={styles.stepTitleBadge}>Glow Up y Disciplina</Text>
          </View>
          <ProgressBar progress={100} color={COLORS.primary} height={6} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>Evolución Integral</Text>
          <Text style={styles.subtitle}>
            El entrenamiento es la base, pero tu postura, cuidado facial y disciplina diaria definen tu presencia.
          </Text>
        </View>

        {/* Metas Glow Up */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Objetivos de Apariencia y Cuidado (Glow Up)</Text>
          {APPEARANCE_GOALS.map((item) => {
            const isSelected = appearance.includes(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => toggleAppearance(item.key)}
                style={[
                  styles.goalCard,
                  isSelected && { borderColor: COLORS.secondary, backgroundColor: 'rgba(139, 92, 246, 0.08)' },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? COLORS.secondary : COLORS.textMuted}
                />
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={[styles.goalTitle, isSelected && { color: '#E9D5FF' }]}>
                    {item.label}
                  </Text>
                  <Text style={styles.goalDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Momento de entrenamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Horario preferido para entrenar</Text>
          <View style={styles.timeButtonsRow}>
            {(['morning', 'afternoon', 'evening'] as const).map((t) => {
              const label = t === 'morning' ? 'Mañana' : t === 'afternoon' ? 'Tarde' : 'Noche';
              const icon = t === 'morning' ? 'sunny-outline' : t === 'afternoon' ? 'partly-sunny-outline' : 'moon-outline';
              const isSelected = preferredWorkoutTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setPreferredWorkoutTime(t)}
                  style={[
                    styles.timeButton,
                    isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                  ]}
                >
                  <Ionicons
                    name={icon as any}
                    size={20}
                    color={isSelected ? COLORS.primaryText : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.timeButtonText,
                      isSelected && { color: COLORS.primaryText, fontWeight: '800' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title="Generar mi Plan e Iniciar ASCEND"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleFinish}
          style={styles.nextBtn}
        />
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
  },
  header: {
    marginBottom: SPACING.lg,
  },
  backBtn: {
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  stepTitleBadge: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  intro: {
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  goalDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  timeButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  nextBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
