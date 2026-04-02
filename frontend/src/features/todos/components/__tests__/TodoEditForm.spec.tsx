import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodoEditForm } from '../TodoEditForm';
import * as todoApi from '@/api/todoApi';
import type { Todo } from '@/types/todo';

const mockTodo: Todo = {
  id: 'todo-1',
  user_id: 'user-1',
  title: '기존 할일',
  description: '기존 설명',
  start_date: '2024-01-01',
  due_date: '2024-01-10',
  is_completed: false,
  is_success: null,
  status: 'IN_PROGRESS',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

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

describe('TodoEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('todo 를 받아서 폼에 pre-fill 한다', () => {
    render(<TodoEditForm isOpen={true} onClose={vi.fn()} todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/제목/)).toHaveValue('기존 할일');
    expect(screen.getByLabelText(/설명/)).toHaveValue('기존 설명');
    expect(screen.getByLabelText(/시작일/)).toHaveValue('2024-01-01');
    expect(screen.getByLabelText(/종료일/)).toHaveValue('2024-01-10');
  });

  it('todo 가 null 이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<TodoEditForm isOpen={true} onClose={vi.fn()} todo={null} />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('제목 입력 검증 - 제목을 입력하지 않으면 에러가 표시된다', async () => {
    render(<TodoEditForm isOpen={true} onClose={vi.fn()} todo={mockTodo} />, { wrapper: createWrapper() });

    const titleInput = screen.getByLabelText(/제목/);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /수정/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('종료일이 시작일보다 이전이면 에러가 표시된다', async () => {
    render(<TodoEditForm isOpen={true} onClose={vi.fn()} todo={mockTodo} />, { wrapper: createWrapper() });

    const startDateInput = screen.getByLabelText(/시작일/);
    const dueDateInput = screen.getByLabelText(/종료일/);

    fireEvent.change(startDateInput, { target: { value: '2024-01-10' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-01-05' } });

    const submitButton = screen.getByRole('button', { name: /수정/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/종료일은 시작일보다 이후여야 합니다/)).toBeInTheDocument();
    });
  });

  it('모든 유효성 검사를 통과하면 할일이 수정된다', async () => {
    const mockUpdateResponse = {
      success: true as const,
      data: {
        ...mockTodo,
        title: '수정된 할일',
        description: '수정된 설명',
      },
    };

    vi.spyOn(todoApi, 'updateTodo').mockResolvedValue(mockUpdateResponse);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <TodoEditForm isOpen={true} onClose={onClose} todo={mockTodo} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByLabelText(/제목/);
    const descriptionInput = screen.getByLabelText(/설명/);
    const submitButton = screen.getByRole('button', { name: /수정/ });

    fireEvent.change(titleInput, { target: { value: '수정된 할일' } });
    fireEvent.change(descriptionInput, { target: { value: '수정된 설명' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalledWith('todo-1', {
        title: '수정된 할일',
        description: '수정된 설명',
        start_date: '2024-01-01',
        due_date: '2024-01-10',
      });
    });
  });

  it('취소 버튼을 클릭하면 모달이 닫히고 폼이 초기화된다', () => {
    const onClose = vi.fn();
    render(<TodoEditForm isOpen={true} onClose={onClose} todo={mockTodo} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /취소/ });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('description 을 비울 수 있다 (선택사항)', async () => {
    const mockUpdateResponse = {
      success: true as const,
      data: {
        ...mockTodo,
        description: null,
      },
    };

    vi.spyOn(todoApi, 'updateTodo').mockResolvedValue(mockUpdateResponse);

    render(<TodoEditForm isOpen={true} onClose={vi.fn()} todo={mockTodo} />, { wrapper: createWrapper() });

    const descriptionInput = screen.getByLabelText(/설명/);
    fireEvent.change(descriptionInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /수정/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalledWith('todo-1', expect.objectContaining({
        description: undefined,
      }));
    });
  });
});
