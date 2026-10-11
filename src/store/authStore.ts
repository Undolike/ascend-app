import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_PROFILE_KEY = 'ascend_local_user_profile';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isGuestMode: boolean;
  error: string | null;
  init: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  enterGuestMode: () => Promise<void>;
}

const defaultLocalProfile: Profile = {
  id: 'local-user-id',
  email: 'usuario@ascend.app',
  display_name: 'Atleta Ascend',
  level: 1,
  current_xp: 0,
  current_streak: 1,
  longest_streak: 1,
  onboarding_completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isGuestMode: false,
  error: null,

  init: async () => {
    try {
      set({ isLoading: true, error: null });

      // Si Supabase está configurado, escuchar auth
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = { id: session.user.id, email: session.user.email || '' };
          
          // Obtener perfil desde la base de datos
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) {
            set({ user, profile: profileData as Profile, isGuestMode: false, isLoading: false });
            return;
          }
        }
      }

      // Si no hay sesión o estamos en modo local/offline, recuperar perfil local
      const stored = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          user: { id: parsed.id, email: parsed.email },
          profile: parsed,
          isGuestMode: true,
          isLoading: false,
        });
      } else {
        set({ user: null, profile: null, isGuestMode: false, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Auth init warning:', err);
      set({ isLoading: false, error: err.message });
    }
  },

  signIn: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      // Modo local/demo directo
      const profile: Profile = {
        ...defaultLocalProfile,
        email,
        display_name: email.split('@')[0],
      };
      await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      set({
        user: { id: profile.id, email },
        profile,
        isGuestMode: true,
        isLoading: false,
      });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: { id: data.user.id, email: data.user.email || '' },
          profile: profile as Profile,
          isGuestMode: false,
          isLoading: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  signUp: async (email: string, pass: string, name: string) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      const profile: Profile = {
        ...defaultLocalProfile,
        email,
        display_name: name || email.split('@')[0],
      };
      await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      set({
        user: { id: profile.id, email },
        profile,
        isGuestMode: true,
        isLoading: false,
      });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { display_name: name },
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email,
          display_name: name,
          level: 1,
          current_xp: 0,
          current_streak: 1,
          longest_streak: 1,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(newProfile);

        set({
          user: { id: data.user.id, email },
          profile: newProfile,
          isGuestMode: false,
          isLoading: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Error durante el registro' };
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  enterGuestMode: async () => {
    set({ isLoading: true });
    const profile = { ...defaultLocalProfile };
    await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    set({
      user: { id: profile.id, email: profile.email },
      profile,
      isGuestMode: true,
      isLoading: false,
    });
  },

  signOut: async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);
    set({ user: null, profile: null, isGuestMode: false, error: null });
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const current = get().profile;
    if (!current) return;

    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    set({ profile: updated });

    if (get().isGuestMode || !isSupabaseConfigured()) {
      await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    } else {
      await supabase.from('profiles').update(updates).eq('id', current.id);
    }
  },
}));
