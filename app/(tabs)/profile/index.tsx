import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useGamificationStore, INITIAL_ACHIEVEMENTS } from '@/store/gamificationStore';
import { getLevelProgress } from '@/utils/xpCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileMainScreen() {
  const router = useRouter();
  const { user, profile, signOut, isGuestMode } = useAuthStore();
  const { goals } = useUserProfileStore();
  const { unlockedAchievementCodes } = useGamificationStore();

  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);
  const [hydrationReminder, setHydrationReminder] = useState(true);

  const levelInfo = getLevelProgress(profile?.current_xp || 0);

  const handleSignOutPrompt = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportación de Datos',
      'Tus datos de entrenamientos, nutrición y hábitos están almacenados de forma segura y cifrada en tu dispositivo y cuenta Supabase.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de Perfil */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile?.display_name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.display_name || 'Atleta Ascend'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'usuario@ascend.app'}</Text>
          {isGuestMode && (
            <Badge
              label="MODO PERSONAL OFFLINE"
              variant="lime"
              size="sm"
              style={{ marginTop: SPACING.xs }}
            />
          )}
        </View>

        {/* Nivel y Rachas */}
        <Card style={styles.levelCard} accentBorder="lime">
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelTitle}>NIVEL {levelInfo.currentLevel}</Text>
              <Text style={styles.xpText}>{profile?.current_xp || 0} XP acumulados</Text>
            </View>
            <View style={styles.streakBox}>
              <Ionicons name="flame" size={24} color="#FF7A00" />
              <View>
                <Text style={styles.streakCount}>{profile?.current_streak || 1} días</Text>
                <Text style={styles.streakLabel}>Racha actual</Text>
              </View>
            </View>
          </View>
          <ProgressBar
            progress={levelInfo.percentage}
            color={COLORS.primary}
            height={8}
            style={{ marginTop: SPACING.md }}
          />
          <Text style={styles.nextLevelNotice}>
            Progreso al Nivel {levelInfo.currentLevel + 1}: {levelInfo.percentage}%
          </Text>
        </Card>

        {/* Logros e Insignias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros e Insignias</Text>
          <View style={styles.achievementsGrid}>
            {INITIAL_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlockedAchievementCodes.includes(ach.code);
              return (
                <Card
                  key={ach.id}
                  style={[
                    styles.achievementCard,
                    isUnlocked && { borderColor: COLORS.primary, backgroundColor: 'rgba(204, 255, 0, 0.05)' },
                  ]}
                >
                  <View
                    style={[
                      styles.achIconCircle,
                      isUnlocked && { backgroundColor: COLORS.primary },
                    ]}
                  >
                    <Ionicons
                      name={ach.icon as any}
                      size={22}
                      color={isUnlocked ? COLORS.primaryText : COLORS.textMuted}
                    />
                  </View>
                  <Text style={[styles.achTitle, isUnlocked && { color: COLORS.text }]}>
                    {ach.title}
                  </Text>
                  <Text style={styles.achDesc}>{ach.description}</Text>
                  <Badge
                    label={isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
                    variant={isUnlocked ? 'lime' : 'neutral'}
                    size="sm"
                    style={{ marginTop: SPACING.xs }}
                  />
                </Card>
              );
            })}
          </View>
        </View>

        {/* Resumen de Objetivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan y Parámetros Actuales</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Objetivo Principal</Text>
              <Text style={styles.settingValue}>
                {goals?.primary_goal === 'muscle_gain'
                  ? 'Ganar Músculo'
                  : goals?.primary_goal === 'strength'
                  ? 'Fuerza Pura'
                  : goals?.primary_goal === 'fat_loss'
                  ? 'Definición'
                  : 'Acondicionamiento'}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Días por Semana</Text>
              <Text style={styles.settingValue}>{goals?.training_days_per_week || 3} días</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Duración por Sesión</Text>
              <Text style={styles.settingValue}>{goals?.preferred_session_minutes || 40} min</Text>
            </View>
          </Card>
        </View>

        {/* Notificaciones y Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones y Avisos</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Recordatorio de Entrenamiento</Text>
                <Text style={styles.switchSubtitle}>Aviso previo a tu horario preferido</Text>
              </View>
              <Switch
                value={workoutReminder}
                onValueChange={setWorkoutReminder}
                trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Rutina Glow Up Matutina</Text>
                <Text style={styles.switchSubtitle}>Recordatorio de hidratación y cuidado facial</Text>
              </View>
              <Switch
                value={morningReminder}
                onValueChange={setMorningReminder}
                trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Aviso de Hidratación</Text>
                <Text style={styles.switchSubtitle}>Recordatorios cada 3 horas</Text>
              </View>
              <Switch
                value={hydrationReminder}
                onValueChange={setHydrationReminder}
                trackColor={{ false: COLORS.surface, true: COLORS.water }}
              />
            </View>
          </Card>
        </View>

        {/* Privacidad y Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Gestión</Text>
          <Button
            title="Exportar mis datos"
            variant="secondary"
            size="md"
            onPress={handleExportData}
            icon={<Ionicons name="download-outline" size={18} color={COLORS.text} />}
            style={{ marginBottom: SPACING.sm }}
          />

          <Button
            title="Cerrar Sesión"
            variant="danger"
            size="md"
            onPress={handleSignOutPrompt}
            icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
          />
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
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarInitial: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  profileName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  profileEmail: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  levelCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  xpText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF7A00',
    gap: 8,
  },
  streakCount: {
    color: '#FF7A00',
    fontSize: 16,
    fontWeight: '800',
  },
  streakLabel: {
    color: '#FF7A00',
    fontSize: 10,
    fontWeight: '600',
  },
  nextLevelNotice: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
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
  achievementsGrid: {
    gap: SPACING.sm,
  },
  achievementCard: {
    padding: SPACING.md,
  },
  achIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  achTitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  achDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  settingsCard: {
    padding: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  settingValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  switchSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
