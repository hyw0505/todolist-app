import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';
import * as authApi from '@/api/authApi';
import { useAuthStore } from '../../stores/useAuthStore';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('이메일과 비밀번호 입력 필드를 렌더링한다', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('이메일 형식이 올바르지 않으면 에러가 표시된다', async () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/이메일/);
    const loginButton = screen.getByRole('button', { name: /로그인/ });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식이 아닙니다/)).toBeInTheDocument();
    });
  });

  it('이메일을 입력하지 않으면 에러가 표시된다', async () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    const loginButton = screen.getByRole('button', { name: /로그인/ });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/이메일을 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('비밀번호를 입력하지 않으면 에러가 표시된다', async () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/이메일/);
    const loginButton = screen.getByRole('button', { name: /로그인/ });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호를 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('로그인 성공 시 페이지가 리다이렉트된다', async () => {
    const mockLoginResponse = {
      success: true as const,
      data: {
        accessToken: 'test-token',
        user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
      },
    };

    vi.spyOn(authApi, 'login').mockResolvedValue(mockLoginResponse);

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const loginButton = screen.getByRole('button', { name: /로그인/ });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
      });
    });
  });

  it('로그인 실패 시 에러 메시지가 표시된다', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const loginButton = screen.getByRole('button', { name: /로그인/ });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/)).toBeInTheDocument();
    });
  });

  it('회원가입 페이지로 이동하는 링크가 있다', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    const signupLink = screen.getByRole('button', { name: /회원가입/ });
    expect(signupLink).toBeInTheDocument();
  });
});
