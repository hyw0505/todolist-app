export const QUERY_KEYS = {
  todos: {
    all: ['todos'] as const,
    lists: () => [...QUERY_KEYS.todos.all, 'list'] as const,
    list: (params: object) => [...QUERY_KEYS.todos.lists(), params] as const,
    detail: (id: string) => [...QUERY_KEYS.todos.all, 'detail', id] as const,
  },
} as const;
