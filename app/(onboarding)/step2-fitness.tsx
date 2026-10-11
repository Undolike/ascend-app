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
import { Card } from '@/components/common/Card';
import { GoalType, ExperienceLevel } from '@/types/database.types';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

interface GoalOption {
  key: GoalType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GOALS: GoalOption[] = [
  {
    key: 'muscle_gain',
    title: 'Ganar Masa Muscular',
    description: 'Hipertrofia con peso corporal mediante volumen progresivo y tiempo bajo tensión.',
    icon: 'barbell-outline',
  },
  {
    key: 'strength',
    title: 'Desarrollar Fuerza Pura',
    description: 'Dominio de palancas, progresiones complejas y aumento de fuerza relativa.',
    icon: 'flame-outline',
  },
  {
    key: 'fat_loss',
    title: 'Definición y Pérdida de Grasa',
    description: 'Optimización de composición corporal manteniendo masa magra.',
    icon: 'trending-down-outline',
  },
  {
    key: 'endurance',
    title: 'Resistencia Muscular',
    description: 'Mayor capacidad de trabajo, series largas y recuperación activa rápida.',
    icon: 'timer-outline',
  },
  {
    key: 'general_fitness',
    title: 'Salud y Condición General',
    description: 'Movilidad articular, postura, vitalidad y consistencia duradera.',
    icon: 'heart-outline',
  },
];

const LEVELS: { key: ExperienceLevel; title: string; subtitle: string }[] = [
  {
    key: 'beginner',
    title: 'Principiante',
    subtitle: 'Menos de 1 año. Aprendiendo técnica básica de flexiones y remos.',
  },
  {
    key: 'intermediate',
    title: 'Intermedio',
    subtitle: '1 a 3 años. Dominio de flexiones sólidas, fondos y primeras dominadas.',
  },
  {
    key: 'advanced',
    title: 'Avanzado',
    subtitle: 'Más de 3 años. Series estrictas de dominadas, fondos y control corporal alto.',
  },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { goals, saveGoals } = useUserProfileStore();

  const [selectedGoal, setSelectedGoal] = useState<GoalType>(goals?.primary_goal || 'muscle_gain');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(
    goals?.experience_level || 'beginner'
  );

  const handleNext = async () => {
    if (user?.id) {
      await saveGoals(
        {
          primary_goal: selectedGoal,
          experience_level: selectedLevel,
        },
        user.id
      );
    }
    router.push('/(onboarding)/step3-equipment');
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
            <Text style={styles.stepText}>PASO 2 DE 5</Text>
            <Text style={styles.stepTitleBadge}>Objetivo y Nivel</Text>
          </View>
          <ProgressBar progress={40} color={COLORS.primary} height={6} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>¿Cuál es tu enfoque principal?</Text>
          <Text style={styles.subtitle}>
            Diseñaremos el volumen de entrenamiento y tempo en base a tu meta.
          </Text>
        </View>

        {/* Lista de Metas */}
        <View style={styles.section}>
          {GOALS.map((g) => {
            const isSelected = selectedGoal === g.key;
            return (
              <Card
                key={g.key}
                onPress={() => setSelectedGoal(g.key)}
                accentBorder={isSelected ? 'lime' : 'none'}
                style={[
                  styles.optionCard,
                  isSelected && { backgroundColor: 'rgba(204, 255, 0, 0.05)' },
                ]}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && { backgroundColor: COLORS.primary },
                    ]}
                  >
                    <Ionicons
                      name={g.icon}
                      size={22}
                      color={isSelected ? COLORS.primaryText : COLORS.text}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && { color: COLORS.primary },
                      ]}
                    >
                      {g.title}
                    </Text>
                    <Text style={styles.optionDesc}>{g.description}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Nivel de Experiencia */}
        <View style={[styles.section, { marginTop: SPACING.md }]}>
          <Text style={styles.sectionHeading}>Nivel actual de calistenia</Text>
          {LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.key;
            return (
              <Card
                key={lvl.key}
                onPress={() => setSelectedLevel(lvl.key)}
                accentBorder={isSelected ? 'violet' : 'none'}
                style={[
                  styles.optionCard,
                  isSelected && { backgroundColor: 'rgba(139, 92, 246, 0.08)' },
                ]}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && { borderColor: COLORS.secondary },
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && { color: '#C4B5FD' },
                      ]}
                    >
                      {lvl.title}
                    </Text>
                    <Text style={styles.optionDesc}>{lvl.subtitle}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <Button
          title="Continuar a Equipo y Espacio"
          variant="primary"
          size="lg"
          onPress={handleNext}
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
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  optionCard: {
    marginBottom: SPACING.sm,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  nextBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
