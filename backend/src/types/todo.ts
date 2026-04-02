/**
 * Todo related types
 */

import { TodoStatus } from '../services/todoStatusService';

/**
 * Todo item with calculated status
 */
export interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  due_date: string;
  is_completed: boolean;
  is_success: boolean | null;
  created_at: string;
  updated_at: string;
  status: TodoStatus;
}

/**
 * Create todo request body
 */
export interface CreateTodoRequest {
  title: string;
  description?: string;
  start_date: string;
  due_date: string;
}

/**
 * Update todo request body (partial)
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
}

/**
 * Complete todo request body
 */
export interface CompleteTodoRequest {
  is_success: boolean;
}

/**
 * Get todos query parameters
 */
export interface GetTodosQuery {
  status?: TodoStatus;
  sort_by?: 'start_date' | 'due_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Create todo response body
 */
export interface CreateTodoResponse {
  success: true;
  todo: TodoItem;
}

/**
 * Get todos response body
 */
export interface GetTodosResponse {
  success: true;
  todos: TodoItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get todo by ID response body
 */
export interface GetTodoByIdResponse {
  success: true;
  todo: TodoItem;
}

/**
 * Update todo response body
 */
export interface UpdateTodoResponse {
  success: true;
  todo: TodoItem;
}

/**
 * Complete todo response body
 */
export interface CompleteTodoResponse {
  success: true;
  todo: TodoItem;
}

/**
 * URL parameters for todo ID
 */
export interface TodoIdParams {
  id: string;
}
