import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null });
  });

  it('accessToken이 없으면 /login으로 리다이렉트한다', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <p>보호된 콘텐츠</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('accessToken이 있으면 children을 렌더링한다', () => {
    useAuthStore.setState({
      accessToken: 'test-token',
      user: { id: '1', email: 'test@test.com', name: '테스트' },
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <p>보호된 콘텐츠</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
  });
});
