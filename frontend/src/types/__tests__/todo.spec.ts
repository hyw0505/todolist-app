import { describe, it, expect } from 'vitest';
import type { TodoStatus, Todo } from '@/types/todo';

describe('TodoStatus 타입', () => {
  it('올바른 TodoStatus 값들을 허용한다', () => {
    const statuses: TodoStatus[] = [
      'NOT_STARTED',
      'IN_PROGRESS',
      'OVERDUE',
      'COMPLETED_SUCCESS',
      'COMPLETED_FAILURE',
    ];
    expect(statuses).toHaveLength(5);
    expect(statuses).toContain('NOT_STARTED');
    expect(statuses).toContain('IN_PROGRESS');
    expect(statuses).toContain('OVERDUE');
    expect(statuses).toContain('COMPLETED_SUCCESS');
    expect(statuses).toContain('COMPLETED_FAILURE');
  });
});

describe('Todo 인터페이스 필드 타입 검증', () => {
  it('필수 필드를 모두 가진 Todo 객체를 생성할 수 있다', () => {
    const todo: Todo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: '테스트 할 일',
      description: null,
      start_date: '2026-04-01',
      due_date: '2026-04-30',
      is_completed: false,
      is_success: null,
      status: 'NOT_STARTED',
      created_at: '2026-04-01T00:00:00.000Z',
      updated_at: '2026-04-01T00:00:00.000Z',
    };

    expect(todo.id).toBe('todo-1');
    expect(todo.user_id).toBe('user-1');
    expect(todo.description).toBeNull();
    expect(todo.is_completed).toBe(false);
    expect(todo.is_success).toBeNull();
    expect(todo.status).toBe('NOT_STARTED');
  });

  it('description과 is_success 필드는 null을 허용한다', () => {
    const todo: Todo = {
      id: 'todo-2',
      user_id: 'user-1',
      title: '테스트',
      description: null,
      start_date: '2026-04-01',
      due_date: '2026-04-10',
      is_completed: true,
      is_success: true,
      status: 'COMPLETED_SUCCESS',
      created_at: '2026-04-01T00:00:00.000Z',
      updated_at: '2026-04-05T00:00:00.000Z',
    };

    expect(todo.is_success).toBe(true);
    expect(todo.description).toBeNull();
  });
});
