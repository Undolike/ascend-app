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
import { EquipmentAvailable } from '@/types/database.types';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

const EQUIPMENT_OPTIONS: { key: EquipmentAvailable; label: string; desc: string }[] = [
  { key: 'none', label: 'Solo Suelo / Sin Equipo', desc: 'Flexiones, sentadillas, core e isométricos puros' },
  { key: 'pullup_bar', label: 'Barra de Dominadas Segura', desc: 'Anclaje sólido a pared o puerta certificada' },
  { key: 'dip_bars', label: 'Paralelas o Estación de Fondos', desc: 'Barras paralelas estables para empuje vertical' },
  { key: 'rings', label: 'Anillas de Gimnasia', desc: 'Inestabilidad articular y trabajo de fuerza suprema' },
  { key: 'resistance_bands', label: 'Bandas Elásticas', desc: 'Para asistencia de dominadas, movilidad y activación' },
  { key: 'parallettes', label: 'Parallettes de Suelo', desc: 'Para fondos en L-sit, pino y protección de muñecas' },
];

const INJURY_OPTIONS = [
  'Muñecas sensibles',
  'Molestias en hombros',
  'Dolor lumbar / espalda baja',
  'Rodillas sensibles',
  'Sin limitaciones articulares',
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { goals, saveGoals } = useUserProfileStore();

  const [days, setDays] = useState(goals?.training_days_per_week || 3);
  const [duration, setDuration] = useState(goals?.preferred_session_minutes || 40);
  const [equipment, setEquipment] = useState<EquipmentAvailable[]>(
    goals?.available_equipment || ['none']
  );
  const [space, setSpace] = useState<'small' | 'medium' | 'large'>(
    goals?.training_space || 'medium'
  );
  const [limitations, setLimitations] = useState<string[]>(
    goals?.injuries_limitations || ['Sin limitaciones articulares']
  );

  const toggleEquipment = (key: EquipmentAvailable) => {
    if (key === 'none') {
      setEquipment(['none']);
      return;
    }
    const filtered = equipment.filter((e) => e !== 'none');
    if (filtered.includes(key)) {
      const next = filtered.filter((e) => e !== key);
      setEquipment(next.length === 0 ? ['none'] : next);
    } else {
      setEquipment([...filtered, key]);
    }
  };

  const toggleLimitation = (lim: string) => {
    if (lim === 'Sin limitaciones articulares') {
      setLimitations(['Sin limitaciones articulares']);
      return;
    }
    const filtered = limitations.filter((l) => l !== 'Sin limitaciones articulares');
    if (filtered.includes(lim)) {
      const next = filtered.filter((l) => l !== lim);
      setLimitations(next.length === 0 ? ['Sin limitaciones articulares'] : next);
    } else {
      setLimitations([...filtered, lim]);
    }
  };

  const handleNext = async () => {
    if (user?.id) {
      await saveGoals(
        {
          training_days_per_week: days,
          preferred_session_minutes: duration,
          available_equipment: equipment,
          training_space: space,
          injuries_limitations: limitations,
        },
        user.id
      );
    }
    router.push('/(onboarding)/step4-nutrition');
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
            <Text style={styles.stepText}>PASO 3 DE 5</Text>
            <Text style={styles.stepTitleBadge}>Tiempo y Equipo</Text>
          </View>
          <ProgressBar progress={60} color={COLORS.primary} height={6} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>¿Con qué cuentas en casa?</Text>
          <Text style={styles.subtitle}>
            Ajustaremos los ejercicios para garantizar tu seguridad absoluta.
          </Text>
        </View>

        {/* Días por semana */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Días disponibles a la semana: {days} días</Text>
          <View style={styles.pillRow}>
            {[2, 3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDays(d)}
                style={[
                  styles.dayPill,
                  days === d && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    days === d && { color: COLORS.primaryText, fontWeight: '800' },
                  ]}
                >
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duración */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Duración por sesión: {duration} minutos</Text>
          <View style={styles.pillRow}>
            {[25, 40, 50, 60].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setDuration(m)}
                style={[
                  styles.dayPill,
                  { flex: 1 },
                  duration === m && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                ]}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    duration === m && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  {m} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipo en Casa */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Equipo disponible en casa</Text>
          <Text style={styles.safetyNotice}>
            * Si no tienes barra de dominadas, nunca improvisaremos con muebles inestables.
          </Text>
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = equipment.includes(item.key);
            return (
              <Card
                key={item.key}
                onPress={() => toggleEquipment(item.key)}
                accentBorder={isSelected ? 'lime' : 'none'}
                style={[styles.equipmentCard, isSelected && { backgroundColor: 'rgba(204, 255, 0, 0.05)' }]}
              >
                <View style={styles.optionRow}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                  <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                    <Text style={[styles.optionTitle, isSelected && { color: COLORS.primary }]}>
                      {item.label}
                    </Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Lesiones / Limitaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Molestias o precauciones a considerar</Text>
          {INJURY_OPTIONS.map((inj) => {
            const isSelected = limitations.includes(inj);
            return (
              <TouchableOpacity
                key={inj}
                onPress={() => toggleLimitation(inj)}
                style={[
                  styles.injuryChip,
                  isSelected && { borderColor: COLORS.secondary, backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={isSelected ? '#C4B5FD' : COLORS.textMuted}
                />
                <Text style={[styles.injuryChipText, isSelected && { color: '#E9D5FF' }]}>
                  {inj}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Continuar a Nutrición Saludable"
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
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  safetyNotice: {
    color: COLORS.warning,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dayPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  equipmentCard: {
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  injuryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  injuryChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  nextBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
