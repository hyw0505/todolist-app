import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useTodoFilterStore } from '@/features/todos/stores/useTodoFilterStore';
import { TodoFilterBar } from '@/features/todos/components/TodoFilterBar';
import { TodoList } from '@/features/todos/components/TodoList';
import { TodoCreateForm } from '@/features/todos/components/TodoCreateForm';
import { TodoEditForm } from '@/features/todos/components/TodoEditForm';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';
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
  const { status, sortBy, sortOrder, page, limit, setPage } = useTodoFilterStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const filters: Parameters<typeof useTodos>[0] = {
    ...(status !== 'ALL' ? { status: status as TodoStatus } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
    enabled: true,
  };

  const { data, isLoading, error, refetch } = useTodos(filters);

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
    backgroundColor: colors.surface2,
  };

  // 메인 콘텐츠 스타일
  const mainStyle: React.CSSProperties = {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '24px 20px',
  };

  // 콘텐츠 카드 스타일
  const contentCardStyle: React.CSSProperties = {
    backgroundColor: colors.surface1,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: colors.shadow1,
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
    color: colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

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
    color: colors.textMuted,
  };

  const emptyIconStyle: React.CSSProperties = {
    fontSize: '48px',
    color: colors.borderStrong,
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.textSecondary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  const emptyDescriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.textMuted,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.border}`,
  };

  const pageButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '4px',
    backgroundColor: colors.surface1,
    color: colors.textSecondary,
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const activePageButtonStyle: React.CSSProperties = {
    ...pageButtonStyle,
    backgroundColor: colors.primary,
    color: isDark ? '#121212' : '#FFFFFF',
    border: `1px solid ${colors.primary}`,
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
    pages.push(1);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }
    if (totalPages > 1) pages.push(totalPages);

    const uniquePages = [...new Set(pages)].sort((a, b) => {
      if (a === 'ellipsis' || b === 'ellipsis') return 0;
      return a - b;
    });

    return (
      <div style={paginationStyle}>
        <button
          style={currentPage === 1 ? disabledButtonStyle : pageButtonStyle}
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
          type="button"
        >
          ‹
        </button>

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

        <button
          style={currentPage >= (Math.ceil((data && 'data' in data && data.success ? data.data.total : 0) / limit) || 1) ? disabledButtonStyle : pageButtonStyle}
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= (Math.ceil((data && 'data' in data && data.success ? data.data.total : 0) / limit) || 1)}
          aria-label="다음 페이지"
          type="button"
        >
          ›
        </button>
      </div>
    );
  };

  const todosData = data && 'data' in data && data.success ? data.data : undefined;

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main style={mainStyle}>
        <div style={contentCardStyle}>
          {/* 상단 액션 바 */}
          <div style={topActionBarStyle}>
            <h2 style={pageTitleStyle}>{t('todo.title')}</h2>
            <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
              {t('todo.addButton')}
            </Button>
          </div>

          {/* 필터 바 */}
          <TodoFilterBar />

          {/* 콘텐츠 영역 */}
          {isLoading ? (
            <div style={stateContainerStyle}>
              <Spinner size="lg" />
              <span style={{ fontSize: '14px', color: colors.textMuted }}>
                {t('todo.loading')}
              </span>
            </div>
          ) : error ? (
            <div style={stateContainerStyle}>
              <ErrorMessage message={t('todo.loadError')} />
              <Button variant="primary" size="md" onClick={() => refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          ) : !todosData || todosData.todos.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>📝</div>
              <h3 style={emptyTitleStyle}>{t('todo.emptyTitle')}</h3>
              <p style={emptyDescriptionStyle}>{t('todo.emptyDescription')}</p>
              <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
                {t('todo.addButton')}
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
