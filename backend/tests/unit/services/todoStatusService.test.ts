import {
  calculateTodoStatus,
  addStatusToTodo,
  addStatusToTodos,
  TodoStatus,
  TodoBase,
  TodoWithStatus,
} from '../../../src/services/todoStatusService';

describe('todoStatusService (BE-12, BE-13)', () => {
  // Helper to create a fixed "now" date in KST
  const setSystemDate = (year: number, month: number, day: number) => {
    // Create date at UTC midnight, then subtract 9 hours to simulate KST midnight
    // This way when the service adds 9 hours, it will be the target date
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

  describe('calculateTodoStatus', () => {
    describe('NOT_STARTED status', () => {
      test('should return NOT_STARTED when today < start_date and is_completed=false', () => {
        // Set "today" to 2024-01-10 in KST
        const today = setSystemDate(2024, 1, 10);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('NOT_STARTED');
      });

      test('should return NOT_STARTED when today is one day before start_date', () => {
        const today = setSystemDate(2024, 1, 14);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('NOT_STARTED');
      });
    });

    describe('IN_PROGRESS status', () => {
      test('should return IN_PROGRESS when start_date <= today <= due_date and is_completed=false', () => {
        // Set "today" to 2024-01-20 in KST (between start and due)
        const today = setSystemDate(2024, 1, 20);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('IN_PROGRESS');
      });

      test('should return IN_PROGRESS when today equals start_date', () => {
        const today = setSystemDate(2024, 1, 15);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('IN_PROGRESS');
      });

      test('should return IN_PROGRESS when today equals due_date', () => {
        const today = setSystemDate(2024, 1, 31);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('IN_PROGRESS');
      });

      test('should return IN_PROGRESS when start_date equals due_date and today is that date', () => {
        const today = setSystemDate(2024, 1, 15);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-15', false, null);

        expect(status).toBe('IN_PROGRESS');
      });
    });

    describe('OVERDUE status', () => {
      test('should return OVERDUE when today > due_date and is_completed=false', () => {
        // Set "today" to 2024-02-05 in KST (after due date)
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('OVERDUE');
      });

      test('should return OVERDUE when today is one day after due_date', () => {
        const today = setSystemDate(2024, 2, 1);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('OVERDUE');
      });
    });

    describe('COMPLETED_SUCCESS status', () => {
      test('should return COMPLETED_SUCCESS when is_completed=true and is_success=true', () => {
        // Date doesn't matter when completed
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', true, true);

        expect(status).toBe('COMPLETED_SUCCESS');
      });

      test('should return COMPLETED_SUCCESS even when overdue', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-01', '2024-01-15', true, true);

        expect(status).toBe('COMPLETED_SUCCESS');
      });

      test('should return COMPLETED_SUCCESS even when not started yet', () => {
        const today = setSystemDate(2024, 1, 10);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', true, true);

        expect(status).toBe('COMPLETED_SUCCESS');
      });
    });

    describe('COMPLETED_FAILURE status', () => {
      test('should return COMPLETED_FAILURE when is_completed=true and is_success=false', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', true, false);

        expect(status).toBe('COMPLETED_FAILURE');
      });

      test('should return COMPLETED_FAILURE even when overdue', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-01', '2024-01-15', true, false);

        expect(status).toBe('COMPLETED_FAILURE');
      });

      test('should return COMPLETED_FAILURE when is_success=false (not null)', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', true, false);

        expect(status).toBe('COMPLETED_FAILURE');
      });
    });

    describe('Edge cases with null is_success', () => {
      test('should return NOT_STARTED when is_success=null, is_completed=false, today < start_date', () => {
        const today = setSystemDate(2024, 1, 10);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('NOT_STARTED');
      });

      test('should return IN_PROGRESS when is_success=null, is_completed=false, in date range', () => {
        const today = setSystemDate(2024, 1, 20);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('IN_PROGRESS');
      });

      test('should return OVERDUE when is_success=null, is_completed=false, today > due_date', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('OVERDUE');
      });

      test('should return COMPLETED_FAILURE when is_success=null and is_completed=true', () => {
        const today = setSystemDate(2024, 2, 5);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-01-15', '2024-01-31', true, null);

        expect(status).toBe('COMPLETED_FAILURE');
      });
    });

    describe('KST timezone handling', () => {
      test('should handle UTC midnight vs KST correctly - KST is ahead of UTC', () => {
        // When it's 2024-01-15 00:00:00 in KST, it's 2024-01-14 15:00:00 UTC
        // Set time to 2024-01-14 15:00:00 UTC which is 2024-01-15 00:00:00 KST
        const kstMidnight = new Date('2024-01-14T15:00:00Z');
        jest.setSystemTime(kstMidnight);

        // Today in KST is 2024-01-15, which equals start_date
        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('IN_PROGRESS');
      });

      test('should handle date boundary correctly at KST midnight', () => {
        // Set time to just before KST midnight (2024-01-14 14:59:59 UTC)
        const justBeforeKstMidnight = new Date('2024-01-14T14:59:59Z');
        jest.setSystemTime(justBeforeKstMidnight);

        // Today in KST is still 2024-01-14
        const status = calculateTodoStatus('2024-01-15', '2024-01-31', false, null);

        expect(status).toBe('NOT_STARTED');
      });

      test('should handle cross-year dates correctly', () => {
        // Set "today" to 2024-12-31 in KST
        const today = setSystemDate(2024, 12, 31);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2025-01-01', '2025-01-15', false, null);

        expect(status).toBe('NOT_STARTED');
      });

      test('should handle leap year dates correctly', () => {
        // Set "today" to 2024-02-29 in KST (leap year)
        const today = setSystemDate(2024, 2, 29);
        jest.setSystemTime(today);

        const status = calculateTodoStatus('2024-02-28', '2024-03-01', false, null);

        expect(status).toBe('IN_PROGRESS');
      });
    });
  });

  describe('addStatusToTodo', () => {
    interface TestTodo extends TodoBase {
      id: string;
      title: string;
    }

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should add NOT_STARTED status to todo', () => {
      const today = setSystemDate(2024, 1, 10);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-1',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      };

      const result = addStatusToTodo(todo);

      expect(result).toEqual({
        ...todo,
        status: 'NOT_STARTED',
      });
      expect(result.status).toBe('NOT_STARTED');
    });

    test('should add IN_PROGRESS status to todo', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-2',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('IN_PROGRESS');
    });

    test('should add OVERDUE status to todo', () => {
      const today = setSystemDate(2024, 2, 5);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-3',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('OVERDUE');
    });

    test('should add COMPLETED_SUCCESS status to todo', () => {
      const today = setSystemDate(2024, 2, 5);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-4',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: true,
        is_success: true,
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('COMPLETED_SUCCESS');
    });

    test('should add COMPLETED_FAILURE status to todo', () => {
      const today = setSystemDate(2024, 2, 5);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-5',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: true,
        is_success: false,
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('COMPLETED_FAILURE');
    });

    test('should add COMPLETED_FAILURE status when is_success is null', () => {
      const today = setSystemDate(2024, 2, 5);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-6',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: true,
        is_success: null,
      };

      const result = addStatusToTodo(todo);

      expect(result.status).toBe('COMPLETED_FAILURE');
    });

    test('should not mutate original todo object', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todo: TestTodo = {
        id: 'test-id-7',
        title: 'Test Todo',
        start_date: '2024-01-15',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      };

      const originalTodo = { ...todo };
      const result = addStatusToTodo(todo);

      expect(todo).toEqual(originalTodo);
      expect(result).not.toBe(todo);
      expect(result).toHaveProperty('status');
    });
  });

  describe('addStatusToTodos', () => {
    interface TestTodo extends TodoBase {
      id: string;
      title: string;
    }

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should add status to array of todos', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todos: TestTodo[] = [
        {
          id: 'test-id-1',
          title: 'Todo 1',
          start_date: '2024-01-15',
          due_date: '2024-01-31',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'test-id-2',
          title: 'Todo 2',
          start_date: '2024-01-10',
          due_date: '2024-01-25',
          is_completed: false,
          is_success: null,
        },
      ];

      const result = addStatusToTodos(todos);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('IN_PROGRESS');
      expect(result[1].status).toBe('IN_PROGRESS');
    });

    test('should add different statuses based on each todo dates', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todos: TestTodo[] = [
        {
          id: 'test-id-1',
          title: 'Not Started',
          start_date: '2024-01-25',
          due_date: '2024-01-31',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'test-id-2',
          title: 'In Progress',
          start_date: '2024-01-15',
          due_date: '2024-01-31',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'test-id-3',
          title: 'Overdue',
          start_date: '2024-01-01',
          due_date: '2024-01-15',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'test-id-4',
          title: 'Completed Success',
          start_date: '2024-01-01',
          due_date: '2024-01-15',
          is_completed: true,
          is_success: true,
        },
        {
          id: 'test-id-5',
          title: 'Completed Failure',
          start_date: '2024-01-01',
          due_date: '2024-01-15',
          is_completed: true,
          is_success: false,
        },
      ];

      const result = addStatusToTodos(todos);

      expect(result[0].status).toBe('NOT_STARTED');
      expect(result[1].status).toBe('IN_PROGRESS');
      expect(result[2].status).toBe('OVERDUE');
      expect(result[3].status).toBe('COMPLETED_SUCCESS');
      expect(result[4].status).toBe('COMPLETED_FAILURE');
    });

    test('should handle empty array', () => {
      const result = addStatusToTodos([]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should handle array with null is_success values', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todos: TestTodo[] = [
        {
          id: 'test-id-1',
          title: 'Todo 1',
          start_date: '2024-01-15',
          due_date: '2024-01-31',
          is_completed: false,
          is_success: null,
        },
        {
          id: 'test-id-2',
          title: 'Todo 2',
          start_date: '2024-01-15',
          due_date: '2024-01-31',
          is_completed: true,
          is_success: null,
        },
      ];

      const result = addStatusToTodos(todos);

      expect(result[0].status).toBe('IN_PROGRESS');
      expect(result[1].status).toBe('COMPLETED_FAILURE');
    });

    test('should not mutate original array items', () => {
      const today = setSystemDate(2024, 1, 20);
      jest.setSystemTime(today);

      const todos: TestTodo[] = [
        {
          id: 'test-id-1',
          title: 'Todo 1',
          start_date: '2024-01-15',
          due_date: '2024-01-31',
          is_completed: false,
          is_success: null,
        },
      ];

      const originalTodos = JSON.parse(JSON.stringify(todos));
      const result = addStatusToTodos(todos);

      expect(todos[0]).toEqual(originalTodos[0]);
      expect(result[0]).not.toBe(todos[0]);
      expect(result[0]).toHaveProperty('status');
    });
  });
});
