import {
  calculateTodoStatus,
  addStatusToTodo,
  addStatusToTodos,
  TodoStatus,
} from '../../../src/services/todoStatusService';

describe('Reproduce Issue: 4 월 8 일 할일이 진행 중으로 표시되는 문제', () => {
  // Helper to create a fixed "now" date in KST
  const setSystemDate = (year: number, month: number, day: number) => {
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const kstOffset = 9 * 60 * 60 * 1000;
    return new Date(utcDate.getTime() - kstOffset);
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('시나리오: 오늘 2026-04-02, 시작일 2026-04-08, 종료일 2026-04-27', () => {
    test('2026-04-08 시작일 할일은 NOT_STARTED 가 되어야 함', () => {
      // 오늘을 2026-04-02 로 설정
      const today = setSystemDate(2026, 4, 2);
      jest.setSystemTime(today);

      // 시작일: 2026-04-08, 종료일: 2026-04-27
      const status = calculateTodoStatus('2026-04-08', '2026-04-27', false, null);

      expect(status).toBe('NOT_STARTED');
    });

    test('addStatusToTodo 에서 NOT_STARTED 가 되어야 함', () => {
      const today = setSystemDate(2026, 4, 2);
      jest.setSystemTime(today);

      const todo = {
        id: 'test-id',
        user_id: 'user-id',
        title: '4 월 8 일 할일',
        description: '테스트',
        start_date: '2026-04-08',
        due_date: '2026-04-27',
        is_completed: false,
        is_success: null,
        created_at: new Date('2026-04-01T00:00:00Z'),
        updated_at: new Date('2026-04-01T00:00:00Z'),
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('NOT_STARTED');
    });

    test('배열에서 모든 할일이 올바른 상태로 계산되어야 함', () => {
      const today = setSystemDate(2026, 4, 2);
      jest.setSystemTime(today);

      const todos = [
        {
          id: 'todo-1',
          user_id: 'user-id',
          title: '4 월 1 일 시작 할일',
          start_date: '2026-04-01',
          due_date: '2026-04-05',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'todo-2',
          user_id: 'user-id',
          title: '4 월 8 일 시작 할일 (문제의 할일)',
          start_date: '2026-04-08',
          due_date: '2026-04-27',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'todo-3',
          user_id: 'user-id',
          title: '이미 지난 할일',
          start_date: '2026-03-01',
          due_date: '2026-03-15',
          is_completed: false,
          is_success: null,
        },
      ];

      const results = addStatusToTodos(todos);

      expect(results[0].status).toBe('IN_PROGRESS'); // 4/1 ~ 4/5: 진행 중
      expect(results[1].status).toBe('NOT_STARTED'); // 4/8 ~ 4/27: 시작 전 (이게 문제!)
      expect(results[2].status).toBe('OVERDUE'); // 3/1 ~ 3/15: 연체
    });
  });

  describe('시나리오: ISO 문자열 형식 처리 (실제 데이터베이스 저장 형식)', () => {
    test('ISO 문자열 (2026-04-07T15:00:00.000Z) 을 KST 로 변환하여 비교해야 함', () => {
      // 오늘을 2026-04-02 로 설정
      const today = setSystemDate(2026, 4, 2);
      jest.setSystemTime(today);

      // 데이터베이스에서 반환되는 형식: ISO 8601
      // 2026-04-07T15:00:00.000Z (UTC) = 2026-04-08 00:00:00 (KST)
      const status = calculateTodoStatus(
        '2026-04-07T15:00:00.000Z',
        '2026-04-26T15:00:00.000Z',
        false,
        null
      );

      // 2026-04-02 < 2026-04-08 이므로 NOT_STARTED
      expect(status).toBe('NOT_STARTED');
    });

    test('ISO 문자열에서 KST 기준 같은 날 처리', () => {
      // 오늘을 2026-04-08 로 설정
      const today = setSystemDate(2026, 4, 8);
      jest.setSystemTime(today);

      // 2026-04-07T15:00:00.000Z (UTC) = 2026-04-08 00:00:00 (KST)
      const status = calculateTodoStatus(
        '2026-04-07T15:00:00.000Z',
        '2026-04-26T15:00:00.000Z',
        false,
        null
      );

      // 2026-04-08 == 2026-04-08 이므로 IN_PROGRESS
      expect(status).toBe('IN_PROGRESS');
    });

    test('실제 응답 데이터 재현 - 2026-04-02 기준 2 개의 할일', () => {
      const today = setSystemDate(2026, 4, 2);
      jest.setSystemTime(today);

      const todos = [
        {
          id: '16073668-7a3c-47e8-a53b-95b794ba960f',
          user_id: '76d61640-04cc-45b1-b34d-caa070d7fcbb',
          title: '가나다',
          start_date: '2026-04-01T15:00:00.000Z', // KST: 2026-04-02
          due_date: '2026-04-02T15:00:00.000Z',   // KST: 2026-04-03
          is_completed: false,
          is_success: null,
        },
        {
          id: 'fb23c9f1-87b2-4510-8def-ba552b068c40',
          user_id: '76d61640-04cc-45b1-b34d-caa070d7fcbb',
          title: 'rrrr',
          start_date: '2026-04-07T15:00:00.000Z', // KST: 2026-04-08
          due_date: '2026-04-26T15:00:00.000Z',   // KST: 2026-04-27
          is_completed: false,
          is_success: null,
        },
      ];

      const results = addStatusToTodos(todos);

      // 첫 번째 할일: 2026-04-02 ~ 2026-04-03 → 오늘 (4/2) 이므로 IN_PROGRESS
      expect(results[0].status).toBe('IN_PROGRESS');
      
      // 두 번째 할일: 2026-04-08 ~ 2026-04-27 → 오늘 (4/2) 이므로 NOT_STARTED
      expect(results[1].status).toBe('NOT_STARTED');
    });
  });
});
