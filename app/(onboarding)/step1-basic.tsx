import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingStep1() {
  const router = useRouter();
  const { profile, updateProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '24');
  const [height, setHeight] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [weight, setWeight] = useState(profile?.weight_kg ? String(profile.weight_kg) : '');
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!displayName.trim()) {
      setError('Por favor indica tu nombre o apodo para personalizar tu plan');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 100) {
      setError('Por favor indica una edad válida (13 - 100 años)');
      return;
    }

    await updateProfile({
      display_name: displayName.trim(),
      age: parsedAge,
      height_cm: height ? parseFloat(height) : undefined,
      weight_kg: weight ? parseFloat(weight) : undefined,
    });

    router.push('/(onboarding)/step2-fitness');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Header */}
          <View style={styles.header}>
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>PASO 1 DE 5</Text>
              <Text style={styles.stepTitleBadge}>Datos Básicos</Text>
            </View>
            <ProgressBar progress={20} color={COLORS.primary} height={6} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>¿Cómo te llamas?</Text>
            <Text style={styles.subtitle}>
              Comenzaremos construyendo los cimientos de tu evolución física.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Nombre o Apodo *"
              placeholder="Ej: David"
              value={displayName}
              onChangeText={(t) => {
                setDisplayName(t);
                setError(null);
              }}
              leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />}
            />

            <Input
              label="Edad *"
              placeholder="Ej: 24"
              keyboardType="number-pad"
              value={age}
              onChangeText={(t) => {
                setAge(t);
                setError(null);
              }}
              leftIcon={<Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />}
              helperText="Requerido para ajustar volumen e intensidad con seguridad."
            />

            <View style={styles.optionalBox}>
              <View style={styles.optionalHeader}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.optionalNotice}>
                  Datos opcionales (respeta tu privacidad)
                </Text>
              </View>
              <Text style={styles.optionalDesc}>
                No es obligatorio registrar peso ni altura para entrenar. Si los ingresas, nos permitirá calibrar tus macronutrientes recomendados con mayor precisión.
              </Text>

              <View style={styles.twoCols}>
                <View style={{ flex: 1, marginRight: SPACING.sm }}>
                  <Input
                    label="Estatura (cm)"
                    placeholder="175"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Peso (kg)"
                    placeholder="70"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>
            </View>
          </View>

          <Button
            title="Continuar al siguiente paso"
            variant="primary"
            size="lg"
            onPress={handleNext}
            style={styles.nextBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.lg,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.sm,
  },
  form: {
    flex: 1,
  },
  optionalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  optionalNotice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  optionalDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  twoCols: {
    flexDirection: 'row',
  },
  nextBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
