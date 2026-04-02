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

  // Get current date in KST (UTC+9)
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000; // 9 hours in milliseconds
  const kstNow = new Date(now.getTime() + kstOffset);

  // Normalize to start of day in KST (midnight)
  const kstDate = new Date(kstNow);
  kstDate.setUTCHours(0, 0, 0, 0);

  // Parse dates (they are in YYYY-MM-DD format, treat as UTC midnight)
  const start = new Date(startDate);
  const due = new Date(dueDate);

  // Compare dates
  if (kstDate < start) {
    return 'NOT_STARTED';
  } else if (kstDate > due) {
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
