import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  '¿Cómo mejorar mis flexiones sin sobrecargar hombros?',
  '¿Qué comer después de entrenar con presupuesto bajo?',
  'Tengo fatiga muscular hoy, ¿debo entrenar o descansar?',
  'Guía de 3 pasos para alinear mi postura al estar de pie',
];

export default function AiChatScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Hola. Soy tu Asistente Personal de Evolución en ASCEND. Puedo orientarte sobre técnica de calistenia en casa, balance de macronutrientes, hábitos diarios y postura. ¿En qué nos enfocamos hoy?',
      timestamp: 'Ahora',
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Respuesta inteligente estructurada de asistencia
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('flexion') || lower.includes('hombro')) {
        reply =
          'Para proteger la articulación glenohumeral durante las flexiones:\n1. Mantén los codos en un ángulo de 45° respecto al torso (forma de flecha, no de cruz).\n2. Realiza una protracción escapular activa en la cima del movimiento.\n3. Si sientes pinchazo articular, haz una regresión a flexiones en plano inclinado o reduce el rango de recorrido hasta calentar adecuadamente.';
      } else if (lower.includes('comer') || lower.includes('presupuesto') || lower.includes('nutricion')) {
        reply =
          'Opciones de alta biodisponibilidad y bajo costo:\n• Huevos enteros revueltos con avena o arroz integral (proteína completa y carbohidratos complejos).\n• Lentejas o frijoles combinados con arroz para aminograma completo.\n• Atún al natural escurrido.\nRecuerda beber 500ml de agua para rehidratar tus tejidos musculares.';
      } else if (lower.includes('fatiga') || lower.includes('descans') || lower.includes('dolor')) {
        reply =
          'En calistenia, el progreso muscular y la densidad conectiva ocurren durante la recuperación. Si tu nivel de esfuerzo percibido en la última sesión fue elevado o sientes fatiga articular, opta por descanso activo: una caminata suave y 10 minutos de movilidad de cadera y gato-vaca.';
      } else if (lower.includes('postura')) {
        reply =
          'Alineación postural en 3 puntos clave:\n1. Hombros: Bájalos y llévalos sutilmente atrás sin forzar el pecho de paloma.\n2. Cuello: Haz una ligera retracción de mentón (evita proyectar la cabeza hacia el teléfono).\n3. Pelvis: Activa el abdomen bajo para neutralizar la curvatura lumbar.';
      } else {
        reply =
          `Excelente enfoque sobre "${text}". Para mantener una progresión consistente, enfócate en la técnica estricta sobre la cantidad de repeticiones, prioriza tu ingesta de proteína y mantén tu racha de hábitos activa. Recuerda que no soy un médico clínico, por lo que ante cualquier molestia aguda consulta siempre a un profesional de la salud.`;
      }

      const botMsg: Message = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Ahora',
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Asistente Gemini</Text>
            </View>
            <Text style={styles.headerSubtitle}>Evolución Física & Hábitos</Text>
          </View>
          <Badge label="SEGURO" variant="lime" size="sm" />
        </View>

        {/* Mensajes del Chat */}
        <ScrollView
          contentContainerStyle={styles.chatScroll}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatarBadge}>
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.messageText, isUser && { color: COLORS.primaryText }]}>
                    {m.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' }}>
                Gemini está redactando tu recomendación...
              </Text>
            </View>
          )}

          {/* Chips de Preguntas Frecuentes */}
          <View style={styles.presetsBox}>
            <Text style={styles.presetsHeading}>Sugerencias rápidas:</Text>
            <View style={styles.chipsContainer}>
              {PRESET_QUESTIONS.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(q)}
                  style={styles.presetChip}
                >
                  <Text style={styles.presetChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Input Barra */}
        <View style={styles.inputContainer}>
          <Input
            placeholder="Pregunta sobre rutinas, macros, postura..."
            value={inputText}
            onChangeText={setInputText}
            style={{ marginBottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
            style={[
              styles.sendBtn,
              (!inputText.trim() || loading) && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="send" size={18} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  chatScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.card,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  botAvatarBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  presetsBox: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  presetsHeading: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  chipsContainer: {
    gap: SPACING.xs,
  },
  presetChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: SPACING.sm,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
