import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';

function NavigationGuard() {
  const { user, profile, isLoading, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user) {
      // Si no hay usuario y no está en auth, redirigir a login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!profile?.onboarding_completed) {
      // Si hay usuario pero no ha completado el onboarding
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/step1-basic');
      }
    } else {
      // Usuario autenticado y con onboarding completado
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, profile?.onboarding_completed, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashTitle}>ASCEND</Text>
        <Text style={styles.splashSubtitle}>PERSONAL EVOLUTION</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="ai-chat/index"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <NavigationGuard />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  splashSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 6,
  },
  spinner: {
    marginTop: 32,
  },
});
