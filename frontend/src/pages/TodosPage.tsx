import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useTodoFilterStore } from '@/features/todos/stores/useTodoFilterStore';
import { TodoFilterBar } from '@/features/todos/components/TodoFilterBar';
import { TodoList } from '@/features/todos/components/TodoList';
import { TodoCreateForm } from '@/features/todos/components/TodoCreateForm';
import { TodoEditForm } from '@/features/todos/components/TodoEditForm';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Button } from '@/shared/components/Button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import type { Todo, TodoStatus } from '@/types/todo';

/**
 * 할일 목록 페이지
 *
 * - useTodos 훅으로 데이터 조회
 * - TodoFilterBar 로 필터링
 * - TodoList 로 렌더링
 * - 로딩 중: Spinner 표시
 * - 에러 시: ErrorMessage 표시
 * - 빈 목록: 안내 메시지 표시
 * - 페이지네이션 UI 포함
 */
export function TodosPage(): React.JSX.Element {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const { status, sortBy, sortOrder, page, limit, setPage } = useTodoFilterStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // 필터 파라미터 구성
  const filters: Parameters<typeof useTodos>[0] = {
    ...(status !== 'ALL' ? { status: status as TodoStatus } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
    enabled: true,
  };

  const { data, isLoading, error, refetch } = useTodos(filters);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingTodo(null);
    refetch();
  };

  // 페이지 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
  };

  // 헤더 스타일
  const headerStyle: React.CSSProperties = {
    backgroundColor: '#0068C4',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  const headerActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  // 메인 콘텐츠 스타일
  const mainStyle: React.CSSProperties = {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '24px 20px',
  };

  // 콘텐츠 카드 스타일
  const contentCardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    minHeight: '400px',
  };

  // 상단 액션 바 스타일
  const topActionBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const pageTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1A1A1A',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  // 로딩/에러 상태 스타일
  const stateContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px',
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px',
    color: '#767676',
  };

  const emptyIconStyle: React.CSSProperties = {
    fontSize: '48px',
    color: '#C4C4C4',
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#404040',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  const emptyDescriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#767676',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  // 페이지네이션 스타일
  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #F0F0F0',
  };

  const pageButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #C4C4C4',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#404040',
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const activePageButtonStyle: React.CSSProperties = {
    ...pageButtonStyle,
    backgroundColor: '#0068C4',
    color: '#FFFFFF',
    border: '1px solid #0068C4',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...pageButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const renderPagination = () => {
    const todosData = data && 'data' in data && data.success ? data.data : undefined;
    const total = todosData?.total ?? 0;
    const totalPages = total ? Math.ceil(total / limit) : 1;
    const currentPage = page;

    const pages: (number | 'ellipsis')[] = [];

    // 항상 첫 페이지 포함
    pages.push(1);

    // 현재 페이지 주변 페이지들
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // 항상 마지막 페이지 포함
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // 중복 제거 및 정렬
    const uniquePages = [...new Set(pages)].sort((a, b) => {
      if (a === 'ellipsis' || b === 'ellipsis') return 0;
      return a - b;
    });

    return (
      <div style={paginationStyle}>
        {/* 이전 버튼 */}
        <button
          style={currentPage === 1 ? disabledButtonStyle : pageButtonStyle}
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
          type="button"
        >
          ‹
        </button>

        {/* 페이지 번호 */}
        {uniquePages.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{ ...pageButtonStyle, border: 'none', cursor: 'default' }}
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              style={isCurrentPage ? activePageButtonStyle : pageButtonStyle}
              onClick={() => setPage(pageNum)}
              aria-label={`${pageNum}페이지`}
              aria-current={isCurrentPage ? 'page' : undefined}
              type="button"
            >
              {pageNum}
            </button>
          );
        })}

        {/* 다음 버튼 */}
        <button
          style={currentPage >= totalPages ? disabledButtonStyle : pageButtonStyle}
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
          type="button"
        >
          ›
        </button>
      </div>
    );
  };

  // 데이터 추출 (성공 응답인 경우)
  const todosData = data && 'data' in data && data.success ? data.data : undefined;

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>TodoList</h1>
        <div style={headerActionsStyle}>
          {user && (
            <span style={userNameStyle}>
              {user.name || '사용자'}님
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={mainStyle}>
        <div style={contentCardStyle}>
          {/* 상단 액션 바 */}
          <div style={topActionBarStyle}>
            <h2 style={pageTitleStyle}>할일 목록</h2>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + 할일 추가
            </Button>
          </div>

          {/* 필터 바 */}
          <TodoFilterBar />

          {/* 콘텐츠 영역 */}
          {isLoading ? (
            <div style={stateContainerStyle}>
              <Spinner size="lg" />
              <span style={{ fontSize: '14px', color: '#767676' }}>
                할일을 불러오는 중...
              </span>
            </div>
          ) : error ? (
            <div style={stateContainerStyle}>
              <ErrorMessage message="할일 목록을 불러오는데 실패했습니다." />
              <Button variant="primary" size="md" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          ) : !todosData || todosData.todos.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>📝</div>
              <h3 style={emptyTitleStyle}>등록된 할일이 없습니다</h3>
              <p style={emptyDescriptionStyle}>
                새로운 할일을 추가해보세요
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + 할일 추가
              </Button>
            </div>
          ) : (
            <>
              <TodoList
                todos={todosData.todos}
                onEdit={(todo) => setEditingTodo(todo)}
              />
              {renderPagination()}
            </>
          )}
        </div>
      </main>

      {/* 할일 생성 모달 */}
      <TodoCreateForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 할일 수정 모달 */}
      <TodoEditForm
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
