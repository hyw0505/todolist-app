import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 플레이스홀더 페이지 컴포넌트 (FE-02 이후 실제 구현으로 교체)
function LoginPage(): React.JSX.Element {
  return <div>로그인 페이지</div>;
}

function SignupPage(): React.JSX.Element {
  return <div>회원가입 페이지</div>;
}

function HomePage(): React.JSX.Element {
  return <div>홈 페이지</div>;
}

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<HomePage />} />
      {/* 정의되지 않은 경로는 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
