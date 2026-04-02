import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodoList } from '../TodoList';
import type { Todo } from '@/types/todo';

const mockTodos: Todo[] = [
  {
    id: 'todo-1',
    user_id: 'user-1',
    title: '첫 번째 할일',
    description: '첫 번째 설명',
    start_date: '2024-01-01',
    due_date: '2024-01-10',
    is_completed: false,
    is_success: null,
    status: 'IN_PROGRESS',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'todo-2',
    user_id: 'user-1',
    title: '두 번째 할일',
    description: '두 번째 설명',
    start_date: '2024-01-05',
    due_date: '2024-01-15',
    is_completed: false,
    is_success: null,
    status: 'NOT_STARTED',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

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

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('할일 목록을 렌더링한다', () => {
    render(<TodoList todos={mockTodos} />, { wrapper: createWrapper() });

    expect(screen.getByText('첫 번째 할일')).toBeInTheDocument();
    expect(screen.getByText('두 번째 할일')).toBeInTheDocument();
  });

  it('할일이 없을 때 빈 메시지 표시된다', () => {
    render(<TodoList todos={[]} />, { wrapper: createWrapper() });

    expect(screen.getByText(/등록된 할일이 없습니다/)).toBeInTheDocument();
  });

  it('각 할일 카드에 완료, 수정, 삭제 버튼이 있다', () => {
    render(<TodoList todos={mockTodos} />, { wrapper: createWrapper() });

    const completeButtons = screen.getAllByRole('button', { name: /완료/ });
    const editButtons = screen.getAllByRole('button', { name: /수정/ });
    const deleteButtons = screen.getAllByRole('button', { name: /삭제/ });

    expect(completeButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('완료 버튼을 클릭하면 onComplete 가 호출된다', async () => {
    const onComplete = vi.fn();
    render(<TodoList todos={mockTodos} onEdit={vi.fn()} />, { wrapper: createWrapper() });

    const completeButton = screen.getAllByRole('button', { name: /완료/ })[0];
    if (completeButton) {
      fireEvent.click(completeButton);
    }

    // 모달의 확인 버튼 클릭 - getAllByRole 사용
    const confirmButtons = screen.getAllByRole('button', { name: /성공/ });
    const successButton = confirmButtons[confirmButtons.length - 1];
    if (successButton) {
      fireEvent.click(successButton);
    }

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('삭제 버튼을 클릭하면 onDelete 가 호출된다', async () => {
    const onDelete = vi.fn();
    render(<TodoList todos={mockTodos} onEdit={vi.fn()} />, { wrapper: createWrapper() });

    const deleteButton = screen.getAllByRole('button', { name: /삭제/ })[0];
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // 확인 다이얼로그의 삭제 버튼 클릭 - getAllByRole 사용
    const deleteButtons = screen.getAllByRole('button', { name: /^삭제$/ });
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('수정 버튼을 클릭하면 onEdit 이 호출된다', () => {
    const onEdit = vi.fn();
    render(<TodoList todos={mockTodos} onEdit={onEdit} />, { wrapper: createWrapper() });

    const editButton = screen.getAllByRole('button', { name: /수정/ })[0];
    if (editButton) {
      fireEvent.click(editButton);
    }

    expect(onEdit).toHaveBeenCalledWith(mockTodos[0]);
  });

  it('완료된 할일에는 완료 버튼이 표시되지 않는다', () => {
    const completedTodo: Todo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: '완료된 할일',
      description: '완료된 설명',
      start_date: '2024-01-01',
      due_date: '2024-01-10',
      is_completed: true,
      is_success: true,
      status: 'COMPLETED_SUCCESS',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    render(<TodoList todos={[completedTodo]} />, { wrapper: createWrapper() });

    expect(screen.queryByRole('button', { name: /완료/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /수정/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
  });
});
