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

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, enterGuestMode, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    const result = await signIn(data.email, data.password);
    if (!result.success && result.error) {
      setAuthError(result.error);
    }
  };

  const handleGuestAccess = async () => {
    await enterGuestMode();
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
            <Text style={styles.brandTitle}>ASCEND</Text>
            <Text style={styles.brandTagline}>PERSONAL EVOLUTION</Text>
            <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.welcomeSubtitle}>
              Disciplina, calistenia, nutrición y apariencia en un solo lugar.
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
                  placeholder="••••••••"
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

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassContainer}
            >
              <Text style={styles.forgotPassText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button
              title="Iniciar Sesión"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O ACCESO DIRECTO</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Continuar en Modo Personal / Offline"
              variant="secondary"
              size="md"
              onPress={handleGuestAccess}
              icon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={COLORS.primary}
                />
              }
              style={styles.guestBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Comienza ahora</Text>
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
    paddingVertical: SPACING.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  brandTitle: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTagline: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    marginTop: SPACING.lg,
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
    justifyContent: 'center',
  },
  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPassText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: SPACING.md,
    letterSpacing: 1,
  },
  guestBtn: {
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
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
