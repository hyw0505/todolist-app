/**
 * Todo status values
 *
 * - NOT_STARTED: Current date is before start_date, not completed
 * - IN_PROGRESS: Current date is between start_date and due_date (inclusive), not completed
 * - OVERDUE: Current date is after due_date, not completed
 * - COMPLETED_SUCCESS: Todo is completed with is_success = true
 * - COMPLETED_FAILURE: Todo is completed with is_success = false
 */
export type TodoStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'OVERDUE'
  | 'COMPLETED_SUCCESS'
  | 'COMPLETED_FAILURE';

/**
 * Base todo interface with required fields for status calculation
 */
export interface TodoBase {
  start_date: string;
  due_date: string;
  is_completed: boolean;
  is_success: boolean | null;
}

/**
 * Todo entity with status - extends TodoBase and adds status
 */
export type TodoWithStatus<T extends TodoBase = TodoBase> = T & {
  status: TodoStatus;
};

/**
 * Calculate the status of a todo based on dates and completion state
 *
 * Uses KST (UTC+9) for date comparison
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param dueDate - Due date in YYYY-MM-DD format
 * @param isCompleted - Whether the todo is completed
 * @param isSuccess - Success status (only valid when completed)
 * @returns TodoStatus value
 */
export function calculateTodoStatus(
  startDate: string,
  dueDate: string,
  isCompleted: boolean,
  isSuccess: boolean | null,
): TodoStatus {
  // If completed, return appropriate completion status
  if (isCompleted) {
    return isSuccess === true ? 'COMPLETED_SUCCESS' : 'COMPLETED_FAILURE';
  }

  // 오늘 날짜를 KST(Asia/Seoul) 기준으로 YYYY-MM-DD 문자열로 추출
  // toLocaleDateString('en-CA')는 'YYYY-MM-DD' 형식을 반환
  const todayKST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

  // YYYY-MM-DD 문자열 직접 비교 (날짜 형식이 동일하므로 사전순 = 날짜순)
  if (todayKST < startDate) {
    return 'NOT_STARTED';
  } else if (todayKST > dueDate) {
    return 'OVERDUE';
  } else {
    return 'IN_PROGRESS';
  }
}

/**
 * Add status property to a single todo object
 *
 * @param todo - Todo entity from database
 * @returns Todo object with status property added
 */
export function addStatusToTodo<T extends TodoBase>(todo: T): TodoWithStatus<T> {
  const todoWithStatus = { ...todo } as TodoWithStatus<T>;

  todoWithStatus.status = calculateTodoStatus(
    todoWithStatus.start_date,
    todoWithStatus.due_date,
    todoWithStatus.is_completed,
    todoWithStatus.is_success,
  );

  return todoWithStatus;
}

/**
 * Add status property to an array of todo objects
 *
 * @param todos - Array of todo entities from database
 * @returns Array of todo objects with status property added
 */
export function addStatusToTodos<T extends TodoBase>(todos: T[]): TodoWithStatus<T>[] {
  return todos.map((todo) => addStatusToTodo(todo));
}
