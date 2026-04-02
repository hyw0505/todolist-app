import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import type { User } from '@/types/auth';

const testUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useAuthStore.setState({ accessToken: null, user: null });
  });

  describe('초기 상태', () => {
    it('accessToken 초기값은 null이다', () => {
      const { accessToken } = useAuthStore.getState();
      expect(accessToken).toBeNull();
    });

    it('user 초기값은 null이다', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('token과 user를 정상적으로 저장한다', () => {
      const { setAuth } = useAuthStore.getState();
      setAuth('my-access-token', testUser);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('my-access-token');
      expect(state.user).toEqual(testUser);
    });

    it('token만 변경해도 user가 유지된다', () => {
      useAuthStore.setState({ accessToken: 'old-token', user: testUser });
      const { setAuth } = useAuthStore.getState();
      setAuth('new-token', testUser);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-token');
      expect(state.user).toEqual(testUser);
    });
  });

  describe('clearAuth', () => {
    it('accessToken을 null로 초기화한다', () => {
      useAuthStore.setState({ accessToken: 'some-token', user: testUser });
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
    });

    it('user를 null로 초기화한다', () => {
      useAuthStore.setState({ accessToken: 'some-token', user: testUser });
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });
});
