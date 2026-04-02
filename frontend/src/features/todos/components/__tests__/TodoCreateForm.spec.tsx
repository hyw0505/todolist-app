import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodoCreateForm } from '../TodoCreateForm';
import * as todoApi from '@/api/todoApi';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('TodoCreateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('모달이 열려있을 때 폼을 렌더링한다', () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByText(/새 할일 추가/)).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText(/설명/)).toBeInTheDocument();
    expect(screen.getByLabelText(/시작일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/종료일/)).toBeInTheDocument();
  });

  it('모달이 닫혀있을 때는 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<TodoCreateForm isOpen={false} onClose={vi.fn()} />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('제목 입력 검증 - 제목을 입력하지 않으면 에러가 표시된다', async () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /추가/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/제목을 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('시작일 입력 검증 - 시작일을 입력하지 않으면 에러가 표시된다', async () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    const submitButton = screen.getByRole('button', { name: /추가/ });

    fireEvent.change(titleInput, { target: { value: '새 할일' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/시작일을 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('종료일 입력 검증 - 종료일을 입력하지 않으면 에러가 표시된다', async () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    const startDateInput = screen.getByLabelText(/시작일/);
    const submitButton = screen.getByRole('button', { name: /추가/ });

    fireEvent.change(titleInput, { target: { value: '새 할일' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/종료일을 입력해주세요/)).toBeInTheDocument();
    });
  });

  it('종료일이 시작일보다 이전이면 에러가 표시된다', async () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    const startDateInput = screen.getByLabelText(/시작일/);
    const dueDateInput = screen.getByLabelText(/종료일/);
    const submitButton = screen.getByRole('button', { name: /추가/ });

    fireEvent.change(titleInput, { target: { value: '새 할일' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-10' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-01-05' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/종료일은 시작일보다 이후여야 합니다/)).toBeInTheDocument();
    });
  });

  it('모든 유효성 검사를 통과하면 할일이 생성된다', async () => {
    const mockCreateResponse = {
      success: true as const,
      data: {
        id: 'todo-1',
        title: '새 할일',
        description: '설명',
        start_date: '2024-01-01',
        due_date: '2024-01-10',
        is_completed: false,
        is_success: null,
        status: 'NOT_STARTED' as const,
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    vi.spyOn(todoApi, 'createTodo').mockResolvedValue(mockCreateResponse);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<TodoCreateForm isOpen={true} onClose={onClose} onSuccess={onSuccess} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    const descriptionInput = screen.getByLabelText(/설명/);
    const startDateInput = screen.getByLabelText(/시작일/);
    const dueDateInput = screen.getByLabelText(/종료일/);
    const submitButton = screen.getByRole('button', { name: /추가/ });

    fireEvent.change(titleInput, { target: { value: '새 할일' } });
    fireEvent.change(descriptionInput, { target: { value: '설명' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-01-10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalledWith({
        title: '새 할일',
        description: '설명',
        start_date: '2024-01-01',
        due_date: '2024-01-10',
      });
    });
  });

  it('취소 버튼을 클릭하면 모달이 닫히고 폼이 초기화된다', () => {
    const onClose = vi.fn();
    render(<TodoCreateForm isOpen={true} onClose={onClose} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /취소/ });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('설명 길이가 1000 자를 초과하면 에러가 표시된다', async () => {
    render(<TodoCreateForm isOpen={true} onClose={vi.fn()} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    const descriptionInput = screen.getByLabelText(/설명/);
    const startDateInput = screen.getByLabelText(/시작일/);
    const dueDateInput = screen.getByLabelText(/종료일/);
    const submitButton = screen.getByRole('button', { name: /추가/ });

    const longDescription = 'a'.repeat(1001);

    fireEvent.change(titleInput, { target: { value: '새 할일' } });
    fireEvent.change(descriptionInput, { target: { value: longDescription } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-01-10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/설명은 1000 자 이내로 입력해주세요/)).toBeInTheDocument();
    });
  });
});
