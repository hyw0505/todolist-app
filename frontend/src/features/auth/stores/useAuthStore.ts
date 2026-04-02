import { create } from 'zustand';
import type { User } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

// localStorage 에서 저장된 인증 정보 불러오기
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { accessToken, user } = JSON.parse(stored);
      if (accessToken && user) {
        return { accessToken, user };
      }
    }
  } catch {
    // localStorage 파싱 오류 시 기본값 반환
  }
  return { accessToken: null, user: null };
};

const storedAuth = getStoredAuth();

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: storedAuth.accessToken,
  user: storedAuth.user,
  // Computed property: isAuthenticated is true when accessToken exists
  get isAuthenticated() {
    return get().accessToken !== null;
  },
  setAuth: (token, user) => {
    localStorage.setItem('auth', JSON.stringify({ accessToken: token, user }));
    set({ accessToken: token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('auth');
    set({ accessToken: null, user: null });
  },
}));
