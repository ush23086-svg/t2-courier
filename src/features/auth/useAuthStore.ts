import { create } from 'zustand';
import { AuthSession, LoginCredentials, CourierProfile } from '@/types';
import { authApi } from '@/services/api';
import { storage } from '@/services/storage/secureStorage';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateCourierProfile: (profile: Partial<CourierProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authApi.login(credentials);
      await storage.setItem(storage.keys.SESSION_KEY, session.token);
      await storage.setItem(storage.keys.USER_KEY, JSON.stringify(session.courier));
      set({ session, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      await storage.removeItem(storage.keys.SESSION_KEY);
      await storage.removeItem(storage.keys.USER_KEY);
      set({ session: null, isLoading: false, error: null });
    } catch {
      set({ session: null, isLoading: false, error: null });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getItem(storage.keys.SESSION_KEY);
      if (!token) {
        set({ session: null, isLoading: false, isInitialized: true });
        return;
      }
      const session = await authApi.validateSession(token);
      if (session) {
        set({ session, isLoading: false, isInitialized: true });
      } else {
        await storage.removeItem(storage.keys.SESSION_KEY);
        set({ session: null, isLoading: false, isInitialized: true });
      }
    } catch {
      set({ session: null, isLoading: false, isInitialized: true });
    }
  },

  updateCourierProfile: (updatedProfile) => {
    const currentSession = get().session;
    if (currentSession) {
      const newSession = {
        ...currentSession,
        courier: {
          ...currentSession.courier,
          ...updatedProfile,
        },
      };
      set({ session: newSession });
    }
  },
}));
