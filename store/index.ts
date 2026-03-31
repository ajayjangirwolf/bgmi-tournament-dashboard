import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "yellow" | "red" | "dark";

interface AuthState {
  token: string | null;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface SoundState {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAdmin: false,
      setToken: (token) => set({ token, isAdmin: !!token }),
      logout: () => set({ token: null, isAdmin: false }),
    }),
    { name: "bgmi-auth" }
  )
);

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "yellow",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "bgmi-theme" }
  )
);

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    { name: "bgmi-sound" }
  )
);
