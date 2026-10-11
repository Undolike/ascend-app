import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { INITIAL_EXERCISES } from '@/constants/exercisePresets';
import { Exercise, ExerciseCategory } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: { key: ExerciseCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'push', label: 'Empuje' },
  { key: 'pull', label: 'Tirón' },
  { key: 'legs', label: 'Piernas' },
  { key: 'core', label: 'Core' },
  { key: 'skills', label: 'Habilidades' },
  { key: 'mobility', label: 'Movilidad' },
];

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const filteredExercises = INITIAL_EXERCISES.filter((ex) => {
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesQuery =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const getCategoryColor = (cat: ExerciseCategory) => {
    switch (cat) {
      case 'push':
        return 'lime';
      case 'pull':
        return 'violet';
      case 'legs':
        return 'warning';
      case 'core':
        return 'danger';
      case 'skills':
        return 'violet';
      case 'mobility':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Biblioteca de Calistenia</Text>
        </View>

        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Buscar por ejercicio o músculo..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search" size={20} color={COLORS.textSecondary} />}
            style={{ marginBottom: 0 }}
          />
        </View>

        {/* Filtros de Categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFiltersScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.filterChip,
                  isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && { color: COLORS.primaryText, fontWeight: '800' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lista de Ejercicios */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isExpanded = expandedExerciseId === item.id;
            return (
              <Card style={styles.exerciseCard}>
                <TouchableOpacity
                  onPress={() => setExpandedExerciseId(isExpanded ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTopRow}>
                    <Badge
                      label={item.category.toUpperCase()}
                      variant={getCategoryColor(item.category) as any}
                      size="sm"
                    />
                    <View style={styles.diffBadge}>
                      <Text style={styles.diffText}>Dificultad: {item.difficulty_level}/5</Text>
                    </View>
                  </View>

                  <Text style={styles.exerciseName}>{item.name}</Text>

                  <View style={styles.musclesRow}>
                    <Text style={styles.muscleLabel}>Músculos:</Text>
                    <Text style={styles.muscleList}>
                      {item.primary_muscles.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      Series sugeridas: {item.suggested_sets} • Reps: {item.suggested_reps}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Detalles Expandibles */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View style={styles.divider} />
                    <Text style={styles.sectionHeading}>Instrucciones Paso a Paso:</Text>
                    {item.instructions.map((inst, i) => (
                      <Text key={i} style={styles.instructionLine}>
                        {i + 1}. {inst}
                      </Text>
                    ))}

                    {item.common_mistakes.length > 0 && (
                      <>
                        <Text style={[styles.sectionHeading, { color: COLORS.warning, marginTop: SPACING.sm }]}>
                          Errores Técnicos Frecuentes:
                        </Text>
                        {item.common_mistakes.map((err, i) => (
                          <Text key={i} style={styles.mistakeLine}>
                            ⚠️ {err}
                          </Text>
                        ))}
                      </>
                    )}

                    {item.contraindications.length > 0 && (
                      <>
                        <Text style={[styles.sectionHeading, { color: COLORS.danger, marginTop: SPACING.sm }]}>
                          Precauciones / Contraindicaciones:
                        </Text>
                        {item.contraindications.map((contra, i) => (
                          <Text key={i} style={styles.contraLine}>
                            🛑 {contra}
                          </Text>
                        ))}
                      </>
                    )}
                  </View>
                )}
              </Card>
            );
          }}
        />
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  categoryFiltersScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl,
  },
  exerciseCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diffBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
  },
  musclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  muscleLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  muscleList: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  expandedSection: {
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionLine: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  mistakeLine: {
    color: COLORS.warning,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  contraLine: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
});
