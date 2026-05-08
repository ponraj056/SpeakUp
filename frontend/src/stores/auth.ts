import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, UserProfile } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data } = await api.login(email, password);
        api.setToken(data.accessToken);
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (email: string, password: string, displayName?: string) => {
        await api.register(email, password, displayName);
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await api.logout(refreshToken);
          }
        } catch {
          // ignore errors on logout
        }
        api.setToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isLoading: false });
          return;
        }
        try {
          const { data } = await api.refreshToken(refreshToken);
          api.setToken(data.accessToken);
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        } catch {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: UserProfile) => set({ user }),

      hydrate: async () => {
        const { accessToken, refreshToken } = get();
        if (accessToken) {
          api.setToken(accessToken);
          try {
            const { data } = await api.getProfile();
            set({ user: data, isAuthenticated: true, isLoading: false });
          } catch {
            // Token expired, try refresh
            if (refreshToken) {
              try {
                const { data } = await api.refreshToken(refreshToken);
                api.setToken(data.accessToken);
                const profile = await api.getProfile();
                set({
                  user: profile.data,
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } catch {
                set({
                  user: null,
                  accessToken: null,
                  refreshToken: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            } else {
              set({ isLoading: false });
            }
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'speakup-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
