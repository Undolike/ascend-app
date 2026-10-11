import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Ingresa tu nombre o apodo (mínimo 2 letras)'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe contener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    const result = await signUp(data.email, data.password, data.displayName);
    if (!result.success && result.error) {
      setAuthError(result.error);
    }
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.brandTitle}>ASCEND</Text>
            <Text style={styles.welcomeTitle}>Crea tu cuenta</Text>
            <Text style={styles.welcomeSubtitle}>
              Comienza hoy tu transformación física, mental y de hábitos.
            </Text>
          </View>

          {/* Error Banner */}
          {authError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nombre o Apodo"
                  placeholder="Ej: Alexander"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.displayName?.message}
                  leftIcon={
                    <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  leftIcon={
                    <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmar contraseña"
                  placeholder="Repite tu contraseña"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  leftIcon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  }
                />
              )}
            />

            <Button
              title="Registrarme y Comenzar"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  backBtn: {
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  brandTitle: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  welcomeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  form: {
    flex: 1,
  },
  submitBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
});
