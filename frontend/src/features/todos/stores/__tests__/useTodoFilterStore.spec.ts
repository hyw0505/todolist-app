import { describe, it, expect, beforeEach } from 'vitest';
import { useTodoFilterStore } from '../useTodoFilterStore';

describe('useTodoFilterStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTodoFilterStore.setState({
      status: 'ALL',
      sortBy: 'due_date',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
    });
  });

  it('should have correct initial state', () => {
    const state = useTodoFilterStore.getState();

    expect(state.status).toBe('ALL');
    expect(state.sortBy).toBe('due_date');
    expect(state.sortOrder).toBe('asc');
    expect(state.page).toBe(1);
    expect(state.limit).toBe(10);
  });

  describe('setStatus', () => {
    it('should update status', () => {
      const { setStatus } = useTodoFilterStore.getState();

      setStatus('IN_PROGRESS');

      expect(useTodoFilterStore.getState().status).toBe('IN_PROGRESS');
    });

    it('should reset page to 1 when status changes', () => {
      const { setStatus, setPage } = useTodoFilterStore.getState();

      setPage(3);
      setStatus('OVERDUE');

      expect(useTodoFilterStore.getState().page).toBe(1);
      expect(useTodoFilterStore.getState().status).toBe('OVERDUE');
    });

    it('should set status to ALL', () => {
      const { setStatus } = useTodoFilterStore.getState();

      setStatus('ALL');

      expect(useTodoFilterStore.getState().status).toBe('ALL');
    });
  });

  describe('setSortBy', () => {
    it('should update sortBy to start_date', () => {
      const { setSortBy } = useTodoFilterStore.getState();

      setSortBy('start_date');

      expect(useTodoFilterStore.getState().sortBy).toBe('start_date');
    });

    it('should update sortBy to due_date', () => {
      const { setSortBy } = useTodoFilterStore.getState();

      setSortBy('due_date');

      expect(useTodoFilterStore.getState().sortBy).toBe('due_date');
    });

    it('should reset page to 1 when sortBy changes', () => {
      const { setSortBy, setPage } = useTodoFilterStore.getState();

      setPage(3);
      setSortBy('start_date');

      expect(useTodoFilterStore.getState().page).toBe(1);
    });
  });

  describe('setSortOrder', () => {
    it('should update sortOrder to asc', () => {
      const { setSortOrder } = useTodoFilterStore.getState();

      setSortOrder('asc');

      expect(useTodoFilterStore.getState().sortOrder).toBe('asc');
    });

    it('should update sortOrder to desc', () => {
      const { setSortOrder } = useTodoFilterStore.getState();

      setSortOrder('desc');

      expect(useTodoFilterStore.getState().sortOrder).toBe('desc');
    });

    it('should reset page to 1 when sortOrder changes', () => {
      const { setSortOrder, setPage } = useTodoFilterStore.getState();

      setPage(3);
      setSortOrder('desc');

      expect(useTodoFilterStore.getState().page).toBe(1);
    });
  });

  describe('setPage', () => {
    it('should update page', () => {
      const { setPage } = useTodoFilterStore.getState();

      setPage(5);

      expect(useTodoFilterStore.getState().page).toBe(5);
    });

    it('should accept any positive number', () => {
      const { setPage } = useTodoFilterStore.getState();

      setPage(100);

      expect(useTodoFilterStore.getState().page).toBe(100);
    });
  });

  describe('setLimit', () => {
    it('should update limit', () => {
      const { setLimit } = useTodoFilterStore.getState();

      setLimit(20);

      expect(useTodoFilterStore.getState().limit).toBe(20);
    });

    it('should reset page to 1 when limit changes', () => {
      const { setLimit, setPage } = useTodoFilterStore.getState();

      setPage(3);
      setLimit(50);

      expect(useTodoFilterStore.getState().page).toBe(1);
      expect(useTodoFilterStore.getState().limit).toBe(50);
    });
  });

  describe('reset', () => {
    it('should reset all filters to initial values', () => {
      const { setStatus, setSortBy, setSortOrder, setPage, setLimit, reset } =
        useTodoFilterStore.getState();

      setStatus('OVERDUE');
      setSortBy('start_date');
      setSortOrder('desc');
      setPage(5);
      setLimit(50);

      reset();

      const state = useTodoFilterStore.getState();
      expect(state.status).toBe('ALL');
      expect(state.sortBy).toBe('due_date');
      expect(state.sortOrder).toBe('asc');
      expect(state.page).toBe(1);
      expect(state.limit).toBe(10);
    });
  });

  describe('multiple state changes', () => {
    it('should handle multiple consecutive changes', () => {
      const store = useTodoFilterStore.getState();

      // Note: setStatus, setSortBy, setSortOrder reset page to 1
      // So we set page last to avoid it being reset
      store.setStatus('IN_PROGRESS');
      store.setSortBy('start_date');
      store.setSortOrder('desc');
      store.setLimit(20);
      store.setPage(2);

      const state = useTodoFilterStore.getState();

      expect(state.status).toBe('IN_PROGRESS');
      expect(state.sortBy).toBe('start_date');
      expect(state.sortOrder).toBe('desc');
      expect(state.page).toBe(2);
      expect(state.limit).toBe(20);
    });
  });
});
