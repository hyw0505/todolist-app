export type TodoStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'OVERDUE'
  | 'COMPLETED_SUCCESS'
  | 'COMPLETED_FAILURE';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  is_completed: boolean;
  is_success: boolean | null;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  start_date: string;
  due_date: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
}

export interface CompleteTodoInput {
  is_success: boolean;
}

export interface TodosQueryParams {
  status?: TodoStatus;
  sort_by?: 'start_date' | 'due_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TodosResponse {
  success: true;
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
}
