import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/api/supabase';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.app_metadata?.role === 'admin');
  const currentUser = computed(() => user.value);

  // Actions
  const setUser = (userData: any) => {
    user.value = userData;
  };

  const clearUser = () => {
    user.value = null;
  };

  const signIn = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      user.value = data.user;
      return data.user;
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      clearUser();
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        user.value = session.user;
      }
      return session?.user || null;
    } catch (err: any) {
      error.value = err.message || 'Failed to check authentication status';
      return null;
    }
  };

  // Initialize auth state
  const initialize = async () => {
    await checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null;
    });

    // Cleanup function
    return () => {
      subscription?.unsubscribe();
    };
  };

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    currentUser,
    
    // Actions
    setUser,
    clearUser,
    signIn,
    signOut,
    checkAuth,
    initialize,
  };
});

// Types
export interface User {
  id: string;
  email?: string;
  app_metadata?: {
    role?: string;
  }
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  // Add other user properties as needed
}
