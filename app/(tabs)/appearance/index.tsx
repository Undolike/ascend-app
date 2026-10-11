import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { Ionicons } from '@expo/vector-icons';

export default function AppearanceMainScreen() {
  const { user, profile, updateProfile } = useAuthStore();
  const { habits, completedHabitIds, toggleHabit, loadData } = useGamificationStore();

  const [activeTab, setActiveTab] = useState<'routines' | 'posture' | 'style'>('routines');

  // Temporizador de Postura
  const [postureTimerActive, setPostureTimerActive] = useState(false);
  const [postureSecondsRemaining, setPostureSecondsRemaining] = useState(180); // 3 minutos

  // Asesor de Estilo con IA
  const [styleOutfitDescription, setStyleOutfitDescription] = useState('Camiseta básica negra, pantalón gris carbón y zapatillas blancas');
  const [styleLoading, setStyleLoading] = useState(false);
  const [styleAdvice, setStyleAdvice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      loadData(todayStr, user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!postureTimerActive) return;
    const interval = setInterval(() => {
      setPostureSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPostureTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [postureTimerActive]);

  const handleXpEarned = (amount: number) => {
    if (profile) {
      updateProfile({
        current_xp: (profile.current_xp || 0) + amount,
      });
    }
  };

  const handleRequestStyleAdvice = () => {
    if (!styleOutfitDescription.trim()) return;
    setStyleLoading(true);

    setTimeout(() => {
      setStyleAdvice(
        `• Armonía cromática: La combinación de negro, carbón y zapatillas blancas es clásica, minimalista y de alto contraste equilibrado.\n• Ajuste (Fit): Asegúrate de que las costuras de la camiseta descansen exactamente sobre el acromion (hombro) y que el pantalón no tenga pliegues excesivos en el tobillo.\n• Accesorios: Un reloj de pulsera con correa plateada o negra mate aportará estructura y presencia visual sin recargar.\n• Consejo económico: Mantén las zapatillas limpias y usa perchas de hombro ancho para preservar la caída de la prenda.`
      );
      setStyleLoading(false);
    }, 800);
  };

  const morningHabits = habits.filter((h) => h.time_of_day === 'morning');
  const afternoonHabits = habits.filter((h) => h.time_of_day === 'afternoon');
  const eveningHabits = habits.filter((h) => h.time_of_day === 'evening');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>CUIDADO PERSONAL & PRESENCIA</Text>
            <Text style={styles.title}>Glow Up</Text>
          </View>
          <Badge label="DISCIPLINA DIARIA" variant="violet" size="sm" />
        </View>

        {/* Selector de sub-sección */}
        <View style={styles.tabButtonsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('routines')}
            style={[styles.tabBtn, activeTab === 'routines' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'routines' && styles.tabBtnTextActive,
              ]}
            >
              Rutinas Diarias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('posture')}
            style={[styles.tabBtn, activeTab === 'posture' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'posture' && styles.tabBtnTextActive,
              ]}
            >
              Postura
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('style')}
            style={[styles.tabBtn, activeTab === 'style' && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'style' && styles.tabBtnTextActive,
              ]}
            >
              Asesor Estilo IA
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. SECCIÓN: RUTINAS DIARIAS */}
        {activeTab === 'routines' && (
          <View style={styles.tabContent}>
            {/* Rutina Matutina */}
            <View style={styles.routineBlock}>
              <View style={styles.routineHeader}>
                <Ionicons name="sunny-outline" size={20} color={COLORS.primary} />
                <Text style={styles.routineTitle}>Rutina Matutina</Text>
              </View>
              {morningHabits.map((habit) => {
                const isCompleted = completedHabitIds.includes(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => toggleHabit(habit.id, todayStr, user?.id || '', handleXpEarned)}
                    style={[
                      styles.habitCard,
                      isCompleted && styles.habitCardCompleted,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isCompleted ? COLORS.secondary : COLORS.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text
                        style={[
                          styles.habitTitleText,
                          isCompleted && styles.habitTitleCompleted,
                        ]}
                      >
                        {habit.title}
                      </Text>
                      <Text style={styles.habitDescText}>{habit.description}</Text>
                    </View>
                    <Badge label={`+${habit.xp_reward} XP`} variant="violet" size="sm" />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rutina de Tarde */}
            <View style={styles.routineBlock}>
              <View style={styles.routineHeader}>
                <Ionicons name="body-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.routineTitle}>Rutina de Tarde (Postura y Enfoque)</Text>
              </View>
              {afternoonHabits.map((habit) => {
                const isCompleted = completedHabitIds.includes(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => toggleHabit(habit.id, todayStr, user?.id || '', handleXpEarned)}
                    style={[
                      styles.habitCard,
                      isCompleted && styles.habitCardCompleted,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isCompleted ? COLORS.secondary : COLORS.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text
                        style={[
                          styles.habitTitleText,
                          isCompleted && styles.habitTitleCompleted,
                        ]}
                      >
                        {habit.title}
                      </Text>
                      <Text style={styles.habitDescText}>{habit.description}</Text>
                    </View>
                    <Badge label={`+${habit.xp_reward} XP`} variant="violet" size="sm" />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rutina Nocturna */}
            <View style={styles.routineBlock}>
              <View style={styles.routineHeader}>
                <Ionicons name="moon-outline" size={20} color="#818CF8" />
                <Text style={styles.routineTitle}>Rutina Nocturna (Higiene y Descanso)</Text>
              </View>
              {eveningHabits.map((habit) => {
                const isCompleted = completedHabitIds.includes(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => toggleHabit(habit.id, todayStr, user?.id || '', handleXpEarned)}
                    style={[
                      styles.habitCard,
                      isCompleted && styles.habitCardCompleted,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isCompleted ? COLORS.secondary : COLORS.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text
                        style={[
                          styles.habitTitleText,
                          isCompleted && styles.habitTitleCompleted,
                        ]}
                      >
                        {habit.title}
                      </Text>
                      <Text style={styles.habitDescText}>{habit.description}</Text>
                    </View>
                    <Badge label={`+${habit.xp_reward} XP`} variant="violet" size="sm" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 2. SECCIÓN: CHEQUEO POSTURAL */}
        {activeTab === 'posture' && (
          <View style={styles.tabContent}>
            <Card style={styles.postureCard} accentBorder="lime">
              <View style={styles.postureTop}>
                <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                <Text style={styles.postureNotice}>
                  Pautas de alineación funcional biomecánica (no diagnóstico médico).
                </Text>
              </View>

              <Text style={styles.postureHeading}>3 Pilares de la Postura Alpha</Text>
              <View style={styles.pilarItem}>
                <Text style={styles.pilarNumber}>1</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pilarTitle}>Depresión y Retracción Escapular</Text>
                  <Text style={styles.pilarDesc}>
                    Aleja los hombros de las orejas y júntalos levemente atrás como si sostuvieras un lápiz entre las escápulas.
                  </Text>
                </View>
              </View>

              <View style={styles.pilarItem}>
                <Text style={styles.pilarNumber}>2</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pilarTitle}>Mentón Retraído (Chin Tuck)</Text>
                  <Text style={styles.pilarDesc}>
                    Evita la proyección de cuello hacia pantallas; alinea el conducto auditivo con el punto medio del hombro.
                  </Text>
                </View>
              </View>

              <View style={styles.pilarItem}>
                <Text style={styles.pilarNumber}>3</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pilarTitle}>Pelvis Neutra y Core Activo</Text>
                  <Text style={styles.pilarDesc}>
                    Evita la anteversión pélvica excesiva; activa levemente glúteos y transverso abdominal al estar de pie.
                  </Text>
                </View>
              </View>

              {/* Temporizador de Alineación Postural */}
              <View style={styles.postureTimerBox}>
                <Text style={styles.timerCountText}>
                  {Math.floor(postureSecondsRemaining / 60)}:
                  {(postureSecondsRemaining % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timerHint}>
                  {postureTimerActive
                    ? 'Mantén la postura activa y respira profundamente con el diafragma'
                    : 'Realiza 3 minutos diarios de postura consciente'}
                </Text>

                <Button
                  title={postureTimerActive ? 'Pausar Concientización' : 'Iniciar 3 Min de Alineación'}
                  variant="primary"
                  size="md"
                  onPress={() => setPostureTimerActive(!postureTimerActive)}
                  icon={<Ionicons name={postureTimerActive ? 'pause' : 'play'} size={18} color={COLORS.primaryText} />}
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            </Card>
          </View>
        )}

        {/* 3. SECCIÓN: ASESOR DE ESTILO CON IA */}
        {activeTab === 'style' && (
          <View style={styles.tabContent}>
            <Card style={styles.styleCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.xs }}>
                <Ionicons name="sparkles" size={20} color={COLORS.secondary} />
                <Text style={styles.styleCardTitle}>Asesor de Estilo y Coordinación</Text>
              </View>
              <Text style={styles.styleNoticeText}>
                Orientación respetuosa y constructiva sobre coordinación textil, paleta de colores y ajuste de ropa. Nunca califica valor personal ni realiza inferencias sobre identidad.
              </Text>

              <Input
                label="Describe tu atuendo o combinación:"
                placeholder="Ej: Camisa oxford celeste, jeans oscuros y botas marrones"
                value={styleOutfitDescription}
                onChangeText={setStyleOutfitDescription}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              <Button
                title={styleLoading ? 'Analizando con Gemini...' : 'Obtener Sugerencias de Estilo'}
                variant="violet"
                size="md"
                loading={styleLoading}
                onPress={handleRequestStyleAdvice}
                icon={<Ionicons name="shirt-outline" size={18} color="#FFFFFF" />}
              />

              {styleAdvice && (
                <View style={styles.styleAdviceBox}>
                  <Text style={styles.adviceHeading}>Recomendaciones de Gemini:</Text>
                  <Text style={styles.adviceBody}>{styleAdvice}</Text>
                </View>
              )}
            </Card>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    marginTop: 2,
  },
  tabButtonsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.lg,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.card,
  },
  tabBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: COLORS.text,
  },
  tabContent: {
    marginBottom: SPACING.lg,
  },
  routineBlock: {
    marginBottom: SPACING.lg,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  routineTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  habitCardCompleted: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  habitTitleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  habitDescText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  postureCard: {
    padding: SPACING.lg,
  },
  postureTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  postureNotice: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
    fontWeight: '600',
  },
  postureHeading: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  pilarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  pilarNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    color: COLORS.primary,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
  },
  pilarTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  pilarDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  postureTimerBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  timerCountText: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: '900',
  },
  timerHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  styleCard: {
    padding: SPACING.lg,
  },
  styleCardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  styleNoticeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  styleAdviceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  adviceHeading: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  adviceBody: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },
});
