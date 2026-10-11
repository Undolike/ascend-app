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
import { useUserProfileStore } from '@/store/userProfileStore';
import { useAuthStore } from '@/store/authStore';
import { calculateMacroTargets } from '@/utils/macroCalculator';
import { Ionicons } from '@expo/vector-icons';

const DIETARY_OPTIONS = [
  'Sin restricciones (Omnívoro equilibrado)',
  'Enfoque en alimentos locales y económicos',
  'Alto en proteína para hipertrofia',
  'Vegetariano',
  'Sin lácteos / Intolerancia a la lactosa',
];

export default function OnboardingStep4() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { goals, saveGoals } = useUserProfileStore();

  const [dietary, setDietary] = useState<string[]>(
    goals?.dietary_restrictions.length
      ? goals.dietary_restrictions
      : ['Sin restricciones (Omnívoro equilibrado)']
  );

  const targets = calculateMacroTargets({
    age: profile?.age || 25,
    weight_kg: profile?.weight_kg || 70,
    height_cm: profile?.height_cm || 175,
    goal: goals?.primary_goal || 'muscle_gain',
    trainingDays: goals?.training_days_per_week || 3,
  });

  const toggleDietary = (item: string) => {
    if (dietary.includes(item)) {
      const next = dietary.filter((d) => d !== item);
      setDietary(next.length === 0 ? ['Sin restricciones (Omnívoro equilibrado)'] : next);
    } else {
      setDietary([...dietary.filter((d) => d !== 'Sin restricciones (Omnívoro equilibrado)'), item]);
    }
  };

  const handleNext = async () => {
    if (user?.id) {
      await saveGoals(
        {
          dietary_restrictions: dietary,
          target_calories: targets.calories,
          target_protein_g: targets.protein_g,
          target_carbs_g: targets.carbs_g,
          target_fat_g: targets.fat_g,
          target_water_ml: targets.water_ml,
        },
        user.id
      );
    }
    router.push('/(onboarding)/step5-habits');
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
            <Text style={styles.stepText}>PASO 4 DE 5</Text>
            <Text style={styles.stepTitleBadge}>Nutrición y Macros</Text>
          </View>
          <ProgressBar progress={80} color={COLORS.primary} height={6} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>Combustible para tu cuerpo</Text>
          <Text style={styles.subtitle}>
            Estimación científica adaptada a tu perfil, sin dietas extremas ni restricciones dañinas.
          </Text>
        </View>

        {/* Tarjeta de Macros Estimados */}
        <Card style={styles.targetsCard} accentBorder="lime">
          <View style={styles.caloriesRow}>
            <View>
              <Text style={styles.calLabel}>META DIARIA ESTIMADA</Text>
              <Text style={styles.calNumber}>{targets.calories} <Text style={styles.calUnit}>kcal</Text></Text>
            </View>
            <View style={styles.waterBadge}>
              <Ionicons name="water" size={16} color={COLORS.water} />
              <Text style={styles.waterText}>{(targets.water_ml / 1000).toFixed(1)} L agua</Text>
            </View>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: COLORS.protein }]}>{targets.protein_g}g</Text>
              <Text style={styles.macroName}>Proteína</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: COLORS.carbs }]}>{targets.carbs_g}g</Text>
              <Text style={styles.macroName}>Carbos</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: COLORS.fat }]}>{targets.fat_g}g</Text>
              <Text style={styles.macroName}>Grasas</Text>
            </View>
          </View>

          <Text style={styles.disclaimerText}>
            * Estos valores son estimaciones funcionales para guiar tu entrenamiento. Podrás ajustarlos libremente en cualquier momento en tu sección de Nutrición.
          </Text>
        </Card>

        {/* Preferencias Dietéticas */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Preferencias y Enfoque de Alimentación</Text>
          {DIETARY_OPTIONS.map((item) => {
            const isSelected = dietary.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggleDietary(item)}
                style={[
                  styles.dietaryItem,
                  isSelected && { borderColor: COLORS.primary, backgroundColor: 'rgba(204, 255, 0, 0.08)' },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isSelected ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.dietaryText,
                    isSelected && { color: COLORS.text, fontWeight: '700' },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Continuar a Glow Up y Hábitos"
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
  targetsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  calLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  calNumber: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
  },
  calUnit: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  waterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.water,
  },
  waterText: {
    color: COLORS.water,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  macroBox: {
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  macroName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
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
  dietaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dietaryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: SPACING.md,
    flex: 1,
  },
  nextBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
