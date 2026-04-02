import { describe, it, expect } from 'vitest';
import { TODO_STATUS } from '@/constants/todoStatus';
import type { TodoStatus } from '@/constants/todoStatus';

describe('TODO_STATUS 상수', () => {
  it('NOT_STARTED 값이 올바르다', () => {
    expect(TODO_STATUS.NOT_STARTED).toBe('NOT_STARTED');
  });

  it('IN_PROGRESS 값이 올바르다', () => {
    expect(TODO_STATUS.IN_PROGRESS).toBe('IN_PROGRESS');
  });

  it('OVERDUE 값이 올바르다', () => {
    expect(TODO_STATUS.OVERDUE).toBe('OVERDUE');
  });

  it('COMPLETED_SUCCESS 값이 올바르다', () => {
    expect(TODO_STATUS.COMPLETED_SUCCESS).toBe('COMPLETED_SUCCESS');
  });

  it('COMPLETED_FAILURE 값이 올바르다', () => {
    expect(TODO_STATUS.COMPLETED_FAILURE).toBe('COMPLETED_FAILURE');
  });

  it('5가지 상태가 모두 포함되어 있다', () => {
    const keys = Object.keys(TODO_STATUS);
    expect(keys).toHaveLength(5);
  });

  it('TODO_STATUS의 값은 TodoStatus 타입으로 사용 가능하다', () => {
    const status: TodoStatus = TODO_STATUS.IN_PROGRESS;
    expect(status).toBe('IN_PROGRESS');
  });
});
