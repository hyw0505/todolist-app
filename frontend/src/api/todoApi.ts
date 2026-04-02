import { axiosInstance } from './axiosInstance';
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  CompleteTodoInput,
  TodosQueryParams,
  TodosResponse,
} from '@/types/todo';
import type { ApiResponse } from '@/types/api';

/**
 * 할일 목록 조회 API
 * GET /api/v1/todos
 */
export async function getTodos(params: TodosQueryParams): Promise<ApiResponse<TodosResponse>> {
  const response = await axiosInstance.get<ApiResponse<TodosResponse>>('/todos', { params });
  return response.data;
}

/**
 * 할일 상세 조회 API
 * GET /api/v1/todos/:id
 */
export async function getTodoById(id: string): Promise<ApiResponse<Todo>> {
  const response = await axiosInstance.get<ApiResponse<Todo>>(`/todos/${id}`);
  return response.data;
}

/**
 * 할일 생성 API
 * POST /api/v1/todos
 */
export async function createTodo(data: CreateTodoInput): Promise<ApiResponse<Todo>> {
  const response = await axiosInstance.post<ApiResponse<Todo>>('/todos', data);
  return response.data;
}

/**
 * 할일 수정 API
 * PUT /api/v1/todos/:id
 */
export async function updateTodo(id: string, data: UpdateTodoInput): Promise<ApiResponse<Todo>> {
  const response = await axiosInstance.put<ApiResponse<Todo>>(`/todos/${id}`, data);
  return response.data;
}

/**
 * 할일 완료 처리 API
 * POST /api/v1/todos/:id/complete
 */
export async function completeTodo(id: string, data: CompleteTodoInput): Promise<ApiResponse<Todo>> {
  const response = await axiosInstance.post<ApiResponse<Todo>>(`/todos/${id}/complete`, data);
  return response.data;
}

/**
 * 할일 삭제 API
 * DELETE /api/v1/todos/:id
 */
export async function deleteTodo(id: string): Promise<void> {
  await axiosInstance.delete(`/todos/${id}`);
}
