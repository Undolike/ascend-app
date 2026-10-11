import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMsg(null);

    if (!isSupabaseConfigured()) {
      // Simulación offline/local
      setTimeout(() => {
        setLoading(false);
        setSent(true);
      }, 600);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo para recibir un enlace de restablecimiento seguro.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Enlace enviado</Text>
            <Text style={styles.successSubtitle}>
              Revisa tu bandeja de entrada o carpeta de spam y sigue las instrucciones.
            </Text>
            <Button
              title="Volver al inicio de sesión"
              variant="primary"
              size="md"
              onPress={() => router.replace('/(auth)/login')}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo registrado"
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

            <Button
              title="Enviar enlace"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
  },
  backBtn: {
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
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
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  form: {
    marginTop: SPACING.md,
  },
  submitBtn: {
    marginTop: SPACING.md,
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
    flex: 1,
  },
  successBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
});
