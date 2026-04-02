import React from 'react';
import { TodoCard } from './TodoCard';
import { useCompleteTodo } from '../hooks/useCompleteTodo';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import type { Todo } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onEdit?: (todo: Todo) => void | undefined;
}

/**
 * 할일 목록 컨테이너 컴포넌트
 *
 * - TodoCard 를 렌더링
 * - 완료 및 삭제 기능 연동
 */
export function TodoList({ todos, onEdit }: TodoListProps): React.JSX.Element {
  const { mutate: completeMutate } = useCompleteTodo({
    onSuccess: () => {
      // 성공 메시지는 TodoCard 에서 처리
    },
  });

  const { mutate: deleteMutate } = useDeleteTodo({
    onSuccess: () => {
      // 성공 메시지는 TodoCard 에서 처리
    },
  });

  const handleComplete = (id: string, isSuccess: boolean) => {
    completeMutate({ id, isSuccess });
  };

  const handleDelete = (id: string) => {
    deleteMutate(id);
  };

  // 목록 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  };

  // 빈 목록 스타일
  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '48px 16px',
    color: '#767676',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '14px',
  };

  if (todos.length === 0) {
    return <div style={emptyStyle}>등록된 할일이 없습니다.</div>;
  }

  return (
    <div style={containerStyle}>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onComplete={handleComplete}
          {...(onEdit ? { onEdit } : {})}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
