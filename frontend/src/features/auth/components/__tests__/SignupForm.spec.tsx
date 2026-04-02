import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignupForm } from '../SignupForm';
import * as authApi from '@/api/authApi';

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

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('모든 입력 필드를 렌더링한다', () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/이름/)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호 확인/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입/ })).toBeInTheDocument();
  });

  it('비밀번호 정책 안내 UI 가 표시된다', () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    expect(screen.getByText(/비밀번호 정책/)).toBeInTheDocument();
    expect(screen.getByText(/8-64 자/)).toBeInTheDocument();
    expect(screen.getByText(/대문자 포함/)).toBeInTheDocument();
    expect(screen.getByText(/소문자 포함/)).toBeInTheDocument();
    expect(screen.getByText(/숫자 포함/)).toBeInTheDocument();
    expect(screen.getByText(/특수문자 포함/)).toBeInTheDocument();
  });

  it('이름을 입력하지 않으면 에러가 표시된다', async () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    const signupButton = screen.getByRole('button', { name: /회원가입/ });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/이름을 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('이메일 형식이 올바르지 않으면 에러가 표시된다', async () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    const nameInput = screen.getByLabelText(/이름/);
    const emailInput = screen.getByLabelText(/이메일/);
    const signupButton = screen.getByRole('button', { name: /회원가입/ });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식이 아닙니다/)).toBeInTheDocument();
    });
  });

  it('비밀번호가 정책을 만족하지 않으면 에러가 표시된다', async () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    const nameInput = screen.getByLabelText(/이름/);
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const signupButton = screen.getByRole('button', { name: /회원가입/ });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호는 8-64 자 사이여야 합니다/)).toBeInTheDocument();
    });
  });

  it('비밀번호 확인이 일치하지 않으면 에러가 표시된다', async () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    const nameInput = screen.getByLabelText(/이름/);
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/);
    const signupButton = screen.getByRole('button', { name: /회원가입/ });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password2!' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/)).toBeInTheDocument();
    });
  });

  it('모든 유효성 검사를 통과하면 회원가입이 진행된다', async () => {
    const mockSignupResponse = {
      success: true as const,
      data: {
        message: '회원가입이 완료되었습니다.',
        userId: 'user-1',
      },
    };

    vi.spyOn(authApi, 'signup').mockResolvedValue(mockSignupResponse);

    render(<SignupForm />, { wrapper: createWrapper() });

    const nameInput = screen.getByLabelText(/이름/);
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/);
    const signupButton = screen.getByRole('button', { name: /회원가입/ });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password1!' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
        name: 'Test User',
      });
    });
  });

  it('회원가입 실패 시 에러 메시지가 표시된다', async () => {
    vi.spyOn(authApi, 'signup').mockRejectedValue(new Error('이미 존재하는 이메일입니다.'));

    render(<SignupForm />, { wrapper: createWrapper() });

    const nameInput = screen.getByLabelText(/이름/);
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/);
    const signupButton = screen.getByRole('button', { name: /회원가입/ });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password1!' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/이미 존재하는 이메일입니다/)).toBeInTheDocument();
    });
  });

  it('로그인 페이지로 이동하는 링크가 있다', () => {
    render(<SignupForm />, { wrapper: createWrapper() });

    const loginLink = screen.getByRole('button', { name: /로그인/ });
    expect(loginLink).toBeInTheDocument();
  });
});
