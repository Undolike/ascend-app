import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes('placeholder') &&
    Boolean(supabaseAnonKey) &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
