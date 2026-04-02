import type { TodoStatus } from '@/types/todo';

/** TodoStatus → 한국어 레이블 */
export function getTodoStatusLabel(status: TodoStatus): string {
  const labels: Record<TodoStatus, string> = {
    NOT_STARTED: '시작 전',
    IN_PROGRESS: '진행 중',
    OVERDUE: '기한 초과',
    COMPLETED_SUCCESS: '완료',
    COMPLETED_FAILURE: '실패 완료',
  };
  return labels[status];
}

/** TodoStatus → 배경색 */
export function getTodoStatusBgColor(status: TodoStatus): string {
  const colors: Record<TodoStatus, string> = {
    NOT_STARTED: '#F5F5F5',
    IN_PROGRESS: '#E8F2FF',
    OVERDUE: '#FFF0F0',
    COMPLETED_SUCCESS: '#F0FFF4',
    COMPLETED_FAILURE: '#FFF5F5',
  };
  return colors[status];
}

/** TodoStatus → 텍스트색 */
export function getTodoStatusTextColor(status: TodoStatus): string {
  const colors: Record<TodoStatus, string> = {
    NOT_STARTED: '#767676',
    IN_PROGRESS: '#0068C4',
    OVERDUE: '#D93025',
    COMPLETED_SUCCESS: '#03C75A',
    COMPLETED_FAILURE: '#767676',
  };
  return colors[status];
}

/** TodoStatus → 좌측 보더 색상 (TodoCard용) */
export function getTodoStatusBorderColor(status: TodoStatus): string {
  const colors: Record<TodoStatus, string> = {
    NOT_STARTED: '#C4C4C4',
    IN_PROGRESS: '#0068C4',
    OVERDUE: '#D93025',
    COMPLETED_SUCCESS: '#03C75A',
    COMPLETED_FAILURE: '#FF3838',
  };
  return colors[status];
}
