import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useNutritionStore, INITIAL_FOOD_ITEMS } from '@/store/nutritionStore';
import { MealType, FoodItem } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';

const MEAL_TYPES: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'Desayuno', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Almuerzo', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Cena', icon: 'moon-outline' },
  { key: 'snack', label: 'Merienda / Snack', icon: 'cafe-outline' },
];

export default function NutritionMainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { goals, loadGoals } = useUserProfileStore();
  const {
    todayEntries,
    waterIntakeMl,
    selectedDate,
    loadDailyNutrition,
    addMealEntry,
    deleteMealEntry,
    addWater,
    resetWater,
    getDailyTotals,
    foodCatalog,
  } = useNutritionStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [showAiScannerModal, setShowAiScannerModal] = useState(false);

  // Campos para nuevo alimento
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState('150');
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('200');
  const [customProtein, setCustomProtein] = useState('20');
  const [customCarbs, setCustomCarbs] = useState('15');
  const [customFat, setCustomFat] = useState('5');

  // Campos del escáner IA
  const [aiMealPrompt, setAiMealPrompt] = useState('Pollo a la plancha con arroz integral y aguacate');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEstimatedResult, setAiEstimatedResult] = useState<{
    foodName: string;
    portionGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    uncertaintyNotice: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGoals(user.id);
      loadDailyNutrition(selectedDate, user.id);
    }
  }, [user?.id, selectedDate]);

  const totals = getDailyTotals();
  const targetCalories = goals?.target_calories || 2200;
  const targetProtein = goals?.target_protein_g || 140;
  const targetCarbs = goals?.target_carbs_g || 250;
  const targetFat = goals?.target_fat_g || 65;
  const targetWater = goals?.target_water_ml || 2500;

  const handleOpenAdd = (mType: MealType) => {
    setSelectedMealType(mType);
    setSelectedFoodItem(INITIAL_FOOD_ITEMS[0]);
    setPortionGrams('100');
    setShowAddModal(true);
  };

  const handleSaveMealEntry = async () => {
    if (!user?.id) return;

    if (selectedFoodItem) {
      const g = parseFloat(portionGrams) || 100;
      const factor = g / selectedFoodItem.serving_size_g;
      await addMealEntry(
        {
          user_id: user.id,
          date: selectedDate,
          meal_type: selectedMealType,
          food_name: selectedFoodItem.name,
          portion_g: g,
          calories: Math.round(selectedFoodItem.calories * factor),
          protein_g: Math.round(selectedFoodItem.protein_g * factor),
          carbs_g: Math.round(selectedFoodItem.carbs_g * factor),
          fat_g: Math.round(selectedFoodItem.fat_g * factor),
        },
        user.id
      );
    } else if (customFoodName.trim()) {
      await addMealEntry(
        {
          user_id: user.id,
          date: selectedDate,
          meal_type: selectedMealType,
          food_name: customFoodName.trim(),
          portion_g: parseFloat(portionGrams) || 100,
          calories: parseFloat(customCalories) || 0,
          protein_g: parseFloat(customProtein) || 0,
          carbs_g: parseFloat(customCarbs) || 0,
          fat_g: parseFloat(customFat) || 0,
        },
        user.id
      );
    }

    setShowAddModal(false);
  };

  // Simulación y validación de escáner de comidas con IA Gemini
  const handleRunAiAnalysis = () => {
    if (!aiMealPrompt.trim()) return;
    setAiLoading(true);

    setTimeout(() => {
      setAiEstimatedResult({
        foodName: aiMealPrompt.trim(),
        portionGrams: 250,
        calories: 420,
        protein: 38,
        carbs: 45,
        fat: 12,
        uncertaintyNotice:
          'Estimación calculada a partir de preparación estándar sin aceites añadidos. Verifica o ajusta los gramos según tu porción real.',
      });
      setAiLoading(false);
    }, 900);
  };

  const handleSaveAiScannedMeal = async () => {
    if (!aiEstimatedResult || !user?.id) return;

    await addMealEntry(
      {
        user_id: user.id,
        date: selectedDate,
        meal_type: selectedMealType,
        food_name: aiEstimatedResult.foodName,
        portion_g: aiEstimatedResult.portionGrams,
        calories: aiEstimatedResult.calories,
        protein_g: aiEstimatedResult.protein,
        carbs_g: aiEstimatedResult.carbs,
        fat_g: aiEstimatedResult.fat,
        ai_estimated: true,
      },
      user.id
    );

    setShowAiScannerModal(false);
    setAiEstimatedResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>COMBUSTIBLE SALUDABLE</Text>
            <Text style={styles.title}>Nutrición</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAiScannerModal(true)}
            style={styles.aiScanBtn}
          >
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            <Text style={styles.aiScanBtnText}>Escáner IA</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Resumen Calórico */}
        <Card style={styles.summaryCard} accentBorder="lime">
          <View style={styles.caloriesOverviewRow}>
            <View>
              <Text style={styles.calLabel}>CALORÍAS HOY</Text>
              <Text style={styles.calMainVal}>
                {totals.calories} <Text style={styles.calTargetText}>/ {targetCalories} kcal</Text>
              </Text>
            </View>
            <View style={styles.calProgressCircle}>
              <Text style={styles.calRemainingText}>
                {Math.max(0, targetCalories - totals.calories)}
              </Text>
              <Text style={styles.calRemainingSub}>restantes</Text>
            </View>
          </View>

          <ProgressBar
            progress={(totals.calories / targetCalories) * 100}
            color={COLORS.primary}
            height={8}
            style={{ marginVertical: SPACING.md }}
          />

          {/* Barras de Macronutrientes */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCol}>
              <Text style={styles.macroLabel}>Proteína</Text>
              <Text style={[styles.macroValText, { color: COLORS.protein }]}>
                {totals.protein}g / {targetProtein}g
              </Text>
              <ProgressBar
                progress={(totals.protein / targetProtein) * 100}
                color={COLORS.protein}
                height={5}
                style={{ marginTop: 4 }}
              />
            </View>

            <View style={styles.macroCol}>
              <Text style={styles.macroLabel}>Carbohidratos</Text>
              <Text style={[styles.macroValText, { color: COLORS.carbs }]}>
                {totals.carbs}g / {targetCarbs}g
              </Text>
              <ProgressBar
                progress={(totals.carbs / targetCarbs) * 100}
                color={COLORS.carbs}
                height={5}
                style={{ marginTop: 4 }}
              />
            </View>

            <View style={styles.macroCol}>
              <Text style={styles.macroLabel}>Grasas</Text>
              <Text style={[styles.macroValText, { color: COLORS.fat }]}>
                {totals.fat}g / {targetFat}g
              </Text>
              <ProgressBar
                progress={(totals.fat / targetFat) * 100}
                color={COLORS.fat}
                height={5}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        </Card>

        {/* Registro de Agua */}
        <Card style={styles.waterCard}>
          <View style={styles.waterHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="water" size={24} color={COLORS.water} />
              <View>
                <Text style={styles.waterTitle}>Hidratación</Text>
                <Text style={styles.waterSubtitle}>
                  {(waterIntakeMl / 1000).toFixed(1)} L de {(targetWater / 1000).toFixed(1)} L recomendados
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={resetWater} style={styles.resetWaterBtn}>
              <Ionicons name="refresh" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ProgressBar
            progress={(waterIntakeMl / targetWater) * 100}
            color={COLORS.water}
            height={6}
            style={{ marginVertical: SPACING.sm }}
          />

          <View style={styles.waterQuickBtnsRow}>
            <TouchableOpacity onPress={() => addWater(250)} style={styles.waterAddChip}>
              <Text style={styles.waterChipText}>+250 ml (1 vaso)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addWater(500)} style={styles.waterAddChip}>
              <Text style={styles.waterChipText}>+500 ml (1 botella)</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Comidas del Día (Desayuno, Almuerzo, Cena, Meriendas) */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Comidas Registradas</Text>

          {MEAL_TYPES.map((mType) => {
            const meals = todayEntries.filter((e) => e.meal_type === mType.key);
            const mealCals = meals.reduce((acc, curr) => acc + curr.calories, 0);

            return (
              <Card key={mType.key} style={styles.mealTypeCard}>
                <View style={styles.mealTypeHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name={mType.icon} size={20} color={COLORS.primary} />
                    <Text style={styles.mealTypeTitle}>{mType.label}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.mealTypeCals}>{mealCals} kcal</Text>
                    <TouchableOpacity
                      onPress={() => handleOpenAdd(mType.key)}
                      style={styles.addFoodIconBtn}
                    >
                      <Ionicons name="add" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {meals.length === 0 ? (
                  <Text style={styles.emptyMealText}>No has registrado alimentos aún</Text>
                ) : (
                  meals.map((item) => (
                    <View key={item.id} style={styles.foodRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodName}>{item.food_name}</Text>
                        <Text style={styles.foodPortion}>
                          {item.portion_g}g • P: {item.protein_g}g | C: {item.carbs_g}g | G:{' '}
                          {item.fat_g}g
                        </Text>
                      </View>
                      <Text style={styles.foodCaloriesText}>{item.calories} kcal</Text>
                      <TouchableOpacity
                        onPress={() => deleteMealEntry(item.id, user?.id || '')}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </Card>
            );
          })}
        </View>

        {/* Modal de Agregar Alimento */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <Text style={styles.modalSheetTitle}>
                  Agregar a {MEAL_TYPES.find((m) => m.key === selectedMealType)?.label}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }}>
                <Text style={styles.modalSectionLabel}>Alimentos saludables base:</Text>
                {foodCatalog.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => {
                      setSelectedFoodItem(f);
                      setCustomFoodName('');
                    }}
                    style={[
                      styles.foodPresetItem,
                      selectedFoodItem?.id === f.id && styles.foodPresetSelected,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.presetName}>{f.name}</Text>
                      <Text style={styles.presetDesc}>
                        {f.serving_size_g}g • {f.calories} kcal • {f.protein_g}g proteína
                      </Text>
                    </View>
                    {f.is_local_economic && (
                      <Badge label="Económico" variant="lime" size="sm" />
                    )}
                  </TouchableOpacity>
                ))}

                <View style={{ marginVertical: SPACING.md }}>
                  <Input
                    label="Cantidad consumida (gramos)"
                    value={portionGrams}
                    onChangeText={setPortionGrams}
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>

              <Button
                title="Guardar en Registro"
                variant="primary"
                size="lg"
                onPress={handleSaveMealEntry}
                style={{ marginTop: SPACING.md }}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Escáner de Comida con IA Gemini */}
        <Modal
          visible={showAiScannerModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAiScannerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                  <Text style={styles.modalSheetTitle}>Escáner Nutricional IA</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAiScannerModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.aiWarningText}>
                ⚠️ Estimación nutricional asistida por IA. No sustituye mediciones exactas de laboratorio ni prescripción clínica.
              </Text>

              <Input
                label="Describe tu plato o comida"
                placeholder="Ej: 2 huevos revueltos, 1 tostada integral y café"
                value={aiMealPrompt}
                onChangeText={setAiMealPrompt}
              />

              <Button
                title={aiLoading ? 'Analizando con Gemini...' : 'Analizar Estimación'}
                variant="violet"
                size="md"
                loading={aiLoading}
                onPress={handleRunAiAnalysis}
                icon={<Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />}
              />

              {aiEstimatedResult && (
                <View style={styles.aiResultBox}>
                  <Text style={styles.aiResultTitle}>{aiEstimatedResult.foodName}</Text>
                  <Text style={styles.aiNoticeSub}>
                    {aiEstimatedResult.uncertaintyNotice}
                  </Text>

                  <View style={styles.aiMetricsRow}>
                    <View style={styles.aiMetric}>
                      <Text style={styles.aiVal}>{aiEstimatedResult.calories} kcal</Text>
                      <Text style={styles.aiLabel}>Calorías</Text>
                    </View>
                    <View style={styles.aiMetric}>
                      <Text style={[styles.aiVal, { color: COLORS.protein }]}>
                        {aiEstimatedResult.protein}g
                      </Text>
                      <Text style={styles.aiLabel}>Proteína</Text>
                    </View>
                    <View style={styles.aiMetric}>
                      <Text style={[styles.aiVal, { color: COLORS.carbs }]}>
                        {aiEstimatedResult.carbs}g
                      </Text>
                      <Text style={styles.aiLabel}>Carbos</Text>
                    </View>
                    <View style={styles.aiMetric}>
                      <Text style={[styles.aiVal, { color: COLORS.fat }]}>
                        {aiEstimatedResult.fat}g
                      </Text>
                      <Text style={styles.aiLabel}>Grasas</Text>
                    </View>
                  </View>

                  <Button
                    title="Añadir a mi Registro"
                    variant="primary"
                    size="md"
                    onPress={handleSaveAiScannedMeal}
                    style={{ marginTop: SPACING.md }}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
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
    color: COLORS.primary,
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
  aiScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: 20,
    gap: 6,
  },
  aiScanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  caloriesOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  calMainVal: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  calTargetText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  calProgressCircle: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 14,
    alignItems: 'center',
  },
  calRemainingText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  calRemainingSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  macroCol: {
    flex: 1,
  },
  macroLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  macroValText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  waterCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  waterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  waterSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  resetWaterBtn: {
    padding: 6,
  },
  waterQuickBtnsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  waterAddChip: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  waterChipText: {
    color: COLORS.water,
    fontSize: 12,
    fontWeight: '700',
  },
  mealsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  mealTypeCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  mealTypeTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  mealTypeCals: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  addFoodIconBtn: {
    backgroundColor: COLORS.surface,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    marginTop: 4,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  foodPortion: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  foodCaloriesText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalSheetTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modalSectionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  foodPresetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  foodPresetSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  presetName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  presetDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  aiWarningText: {
    color: COLORS.warning,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  aiResultBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiResultTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  aiNoticeSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  aiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  aiMetric: {
    alignItems: 'center',
  },
  aiVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  aiLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
