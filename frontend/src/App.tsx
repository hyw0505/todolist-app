import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { TodosPage } from '@/pages/TodosPage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';

/**
 * 애플리케이션 라우팅 설정
 *
 * - /login - LoginPage (public)
 * - /signup - SignupPage (public)
 * - / - TodosPage (protected)
 * - ProtectedRoute 로 인증 필요 라우트 가드
 */
function App(): React.JSX.Element {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 인증 필요 라우트 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TodosPage />
          </ProtectedRoute>
        }
      />

      {/* 정의되지 않은 경로는 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
