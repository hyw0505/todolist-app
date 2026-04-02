import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 윈도우 포커스 시 자동 재조회 비활성화
      refetchOnWindowFocus: false,
      // 재시도 횟수
      retry: 1,
      // 캐시 유지 시간 5분
      staleTime: 5 * 60 * 1000,
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('root element를 찾을 수 없습니다.');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
