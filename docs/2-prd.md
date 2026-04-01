# PRD (Product Requirements Document)

**프로젝트명:** todolist-app  
**문서 버전:** v0.1  
**작성일:** 2026-04-01  
**작성자:** Yongwoo  

---

## 1. 문서 개요

### 1.1 목적
본 PRD는 개인 할일 관리 웹 애플리케이션 **todolist-app**의 제품 요구사항을 정의한다. 개발, 기획, 운영 팀의 일관된 이해를 기초하며, MVP 출시까지의 기능 범위, 기술 요구사항, 품질 기준을 명시한다.

### 1.2 배경
일상적 업무와 개인 프로젝트 관리의 복잡성으로 인해, 사용자 친화적이면서도 효율적인 할일 관리 도구의 필요성이 증대하고 있다. 본 서비스는 간단하고 직관적인 UI로 누구나 쉽게 할일을 추적하고 완료 현황을 파악할 수 있도록 설계된다.

### 1.3 범위
- 사용자 인증 (회원가입, 로그인)
- 할일 CRUD 기능
- 할일 상태 자동 산출 및 필터링
- 할일 정렬 기능
- 모바일웹 + 데스크탑 반응형 UI
- JWT 기반 보안 인증

**범위 외:**
- 팀 협업 기능, 알림/푸시, 외부 캘린더 연동 (도메인 정의서 §1 참조)

### 1.4 문서 구조
1. 제품 개요 (비전, 타겟 사용자, 핵심 가치)
2. 기능 요구사항 (UC별 명세)
3. 비기능 요구사항 (성능, 보안, 호환성)
4. 기술 아키텍처 개요
5. API 개요
6. 토큰 정책
7. MVP 범위 및 출시 계획

---

## 2. 제품 개요

### 2.1 제품 비전
**"할일 관리의 모든 것을 한 곳에서, 간단하고 명확하게"**

할일의 생성부터 완료까지의 전 과정을 직관적으로 관리할 수 있으며, 시스템이 자동으로 우선순위와 상태를 제시함으로써 사용자의 의사결정을 돕는 스마트한 할일 관리 도구.

### 2.2 타겟 사용자

| 구분 | 설명 |
|------|------|
| **연령대** | 10대~50대 일반인 (전 연령층) |
| **예상 등록 사용자** | 10만 명 |
| **동시접속** | 최대 500명 |
| **주요 사용 시나리오** | 일일 업무 계획, 개인 프로젝트 관리, 학업 과제 추적 |

### 2.3 핵심 가치 제안

| 항목 | 설명 |
|------|------|
| **단순성** | 회원가입 후 즉시 사용 가능한 직관적 인터페이스 |
| **투명성** | 시작일, 종료일 기반 할일 상태를 시스템이 자동 계산 |
| **효율성** | 필터링 + 정렬로 우선순위 파악 및 빠른 작업 |
| **신뢰성** | 개인별 격리된 데이터 저장, 보안 인증 기반 접근 |

---

## 3. 기능 요구사항

### 3.1 UC-01: 회원가입

**액터:** 비인증 사용자  
**목표:** 이메일과 비밀번호로 새로운 계정 생성

| 항목 | 내용 |
|------|------|
| **입력값** | - email (이메일 주소) <br> - password (비밀번호) <br> - name (표시 이름) |
| **제약 조건** | - email: 유효한 이메일 형식, 중복 불가 <br> - password: 비밀번호 정책(§4.6) 참조 <br> - name: 1~50자 <br> - 모든 필드 필수 |
| **처리 로직** | 1. 입력값 검증 <br> 2. email 중복 확인 <br> 3. password 암호화 <br> 4. User 레코드 생성 <br> 5. 성공 메시지 반환 |
| **출력값** | { success: true, message: "회원가입 완료", userId: "UUID" } |
| **오류 처리** | - 중복 이메일: 409 Conflict <br> - 입력값 검증 실패: 400 Bad Request <br> - 서버 오류: 500 Internal Server Error |

### 3.2 UC-02: 로그인

**액터:** 비인증 사용자  
**목표:** 인증 토큰 발급

| 항목 | 내용 |
|------|------|
| **입력값** | - email (이메일) <br> - password (비밀번호) |
| **제약 조건** | - 등록된 사용자만 로그인 가능 <br> - 비밀번호는 암호화 비교 |
| **처리 로직** | 1. email 존재 확인 <br> 2. 비밀번호 검증 <br> 3. Access Token (유효기간 15분) 생성 <br> 4. Refresh Token (유효기간 7일) 생성 <br> 5. 토큰 반환 |
| **출력값** | { success: true, accessToken: "JWT", refreshToken: "JWT", user: { id, email, name } } |
| **오류 처리** | - 사용자 없음: 401 Unauthorized <br> - 비밀번호 오류: 401 Unauthorized <br> - 서버 오류: 500 Internal Server Error |

### 3.3 UC-03: 할일 생성

**액터:** 인증된 사용자  
**목표:** 새로운 할일 등록

| 항목 | 내용 |
|------|------|
| **입력값** | - title (할일 제목, 필수) <br> - description (상세 내용, 선택) <br> - start_date (시작일, 필수) <br> - due_date (종료일, 필수) |
| **제약 조건** | - 인증된 사용자만 가능 (BR-01) <br> - title: 1~100자 <br> - description: 0~1000자 <br> - start_date, due_date: 유효한 날짜 형식 (YYYY-MM-DD) <br> - due_date >= start_date (BR-03) |
| **처리 로직** | 1. Access Token 검증 <br> 2. 입력값 검증 <br> 3. 날짜 비교 검증 <br> 4. Todo 레코드 생성 (is_completed=false, status는 런타임 계산) <br> 5. 생성된 Todo 반환 |
| **출력값** | { success: true, todo: { id, user_id, title, description, start_date, due_date, is_completed, status, created_at, updated_at } } |
| **오류 처리** | - 미인증: 401 Unauthorized <br> - 입력값 검증 실패: 400 Bad Request <br> - 날짜 검증 실패: 400 Bad Request <br> - 서버 오류: 500 Internal Server Error |

### 3.4 UC-04: 할일 목록 조회

**액터:** 인증된 사용자  
**목표:** 상태 필터 및 정렬 조건으로 할일 목록 조회

| 항목 | 내용 |
|------|------|
| **입력값** | - status (필터, 선택): NOT_STARTED, IN_PROGRESS, OVERDUE, COMPLETED_SUCCESS, COMPLETED_FAILURE <br> - sort_by (정렬, 선택): start_date, due_date (기본값: due_date) <br> - sort_order (정렬, 선택): asc, desc (기본값: asc) <br> - page (페이지, 선택): 1 이상 (기본값: 1) <br> - limit (페이지 크기, 선택): 1~100 (기본값: 10) |
| **제약 조건** | - 인증된 사용자만 가능 (BR-01) <br> - 본인 할일만 조회 (BR-04) <br> - status 필터 생략 시 전체 할일 반환 <br> - 정렬은 BR-07 기준 |
| **처리 로직** | 1. Access Token 검증 <br> 2. 쿼리 파라미터 검증 <br> 3. User 소유 Todo 쿼리 구성 <br> 4. status 필터 적용 (런타임 계산) <br> 5. 정렬 적용 <br> 6. 페이지네이션 적용 <br> 7. status 값 포함해 반환 |
| **출력값** | { success: true, todos: [ { id, title, description, start_date, due_date, is_completed, status, created_at, updated_at }, ... ], total: number, page: number, limit: number } |
| **오류 처리** | - 미인증: 401 Unauthorized <br> - 쿼리 검증 실패: 400 Bad Request <br> - 서버 오류: 500 Internal Server Error |

### 3.5 UC-05: 할일 수정

**액터:** 인증된 사용자  
**목표:** 기존 할일의 정보 수정

| 항목 | 내용 |
|------|------|
| **입력값** | - todo_id (수정할 할일 ID) <br> - title (선택) <br> - description (선택) <br> - start_date (선택) <br> - due_date (선택) |
| **제약 조건** | - 인증된 사용자만 가능 (BR-01) <br> - 본인 할일만 수정 가능 (BR-04) <br> - title: 1~100자 <br> - description: 0~1000자 <br> - due_date >= start_date (BR-03) <br> - 최소 하나의 필드는 업데이트되어야 함 |
| **처리 로직** | 1. Access Token 검증 <br> 2. todo_id 유효성 확인 및 소유권 검증 <br> 3. 입력값 검증 <br> 4. 날짜 비교 검증 (변경 시에만) <br> 5. Todo 레코드 업데이트 <br> 6. updated_at 자동 갱신 <br> 7. 업데이트된 Todo 반환 |
| **출력값** | { success: true, todo: { id, title, description, start_date, due_date, is_completed, status, created_at, updated_at } } |
| **오류 처리** | - 미인증: 401 Unauthorized <br> - todo 없음: 404 Not Found <br> - 권한 없음: 403 Forbidden <br> - 입력값 검증 실패: 400 Bad Request <br> - 서버 오류: 500 Internal Server Error |

### 3.6 UC-06: 할일 완료 처리

**액터:** 인증된 사용자  
**목표:** 할일을 완료 상태로 전환하고 성공/실패 기록

| 항목 | 내용 |
|------|------|
| **입력값** | - todo_id (완료 처리할 할일 ID) <br> - is_success (성공 여부: true/false, 필수) |
| **제약 조건** | - 인증된 사용자만 가능 (BR-01) <br> - 본인 할일만 완료 처리 가능 (BR-04) <br> - OVERDUE 상태 할일도 완료 처리 가능 (BR-09) <br> - 이미 완료된 할일은 재완료 불가 |
| **처리 로직** | 1. Access Token 검증 <br> 2. todo_id 유효성 확인 및 소유권 검증 <br> 3. is_success 유효성 확인 <br> 4. 이미 완료 상태 여부 확인 <br> 5. is_completed=true, is_success값 설정 <br> 6. status 자동 계산 (COMPLETED_SUCCESS 또는 COMPLETED_FAILURE) <br> 7. updated_at 자동 갱신 <br> 8. 업데이트된 Todo 반환 |
| **출력값** | { success: true, todo: { id, title, is_completed, is_success, status, updated_at } } |
| **오류 처리** | - 미인증: 401 Unauthorized <br> - todo 없음: 404 Not Found <br> - 권한 없음: 403 Forbidden <br> - 이미 완료됨: 409 Conflict <br> - 입력값 검증 실패: 400 Bad Request <br> - 서버 오류: 500 Internal Server Error |

### 3.7 UC-07: 할일 삭제

**액터:** 인증된 사용자  
**목표:** 할일을 삭제

| 항목 | 내용 |
|------|------|
| **입력값** | - todo_id (삭제할 할일 ID) |
| **제약 조건** | - 인증된 사용자만 가능 (BR-01) <br> - 본인 할일만 삭제 가능 (BR-04) <br> - 삭제된 할일은 복구 불가 |
| **처리 로직** | 1. Access Token 검증 <br> 2. todo_id 유효성 확인 및 소유권 검증 <br> 3. Todo 레코드 소프트 삭제 또는 물리 삭제 <br> 4. 성공 메시지 반환 |
| **출력값** | { success: true, message: "할일이 삭제되었습니다", todoId: "UUID" } |
| **오류 처리** | - 미인증: 401 Unauthorized <br> - todo 없음: 404 Not Found <br> - 권한 없음: 403 Forbidden <br> - 서버 오류: 500 Internal Server Error |

### 3.8 토큰 갱신 (보조 기능)

**액터:** 인증된 사용자  
**목표:** Access Token 만료 시 Refresh Token으로 새 Access Token 발급

| 항목 | 내용 |
|------|------|
| **입력값** | - refreshToken (갱신 토큰) |
| **제약 조건** | - Refresh Token은 만료되지 않아야 함 |
| **처리 로직** | 1. Refresh Token 검증 <br> 2. 만료 여부 확인 <br> 3. 새 Access Token 생성 (유효기간 15분) <br> 4. 토큰 반환 |
| **출력값** | { success: true, accessToken: "JWT" } |
| **오류 처리** | - Refresh Token 만료: 401 Unauthorized <br> - 유효하지 않은 토큰: 401 Unauthorized <br> - 서버 오류: 500 Internal Server Error |

---

## 4. 비기능 요구사항

### 4.1 성능 요구사항

| 항목 | 기준 | 비고 |
|------|------|------|
| **페이지 로드 시간** | < 2초 (P95) | 초기 로딩 기준 |
| **API 응답 시간** | < 500ms (P95) | 데이터베이스 쿼리 포함 |
| **동시접속 처리** | 500명 | TPS 기반 확장성 설계 |
| **데이터베이스 쿼리** | < 100ms (P95) | 인덱싱 최적화 필수 |
| **캐싱** | 자주 조회되는 데이터 Redis 등으로 캐싱 검토 | MVP는 데이터베이스 직접 조회 |

### 4.2 보안 요구사항

| 항목 | 기준 | 구현 방식 |
|------|------|----------|
| **인증** | JWT Access Token + Refresh Token | 도메인 정의서 §2 참조 |
| **비밀번호 저장** | bcrypt 암호화 (salt rounds: 10) | Node.js bcryptjs 라이브러리 |
| **HTTPS** | 모든 통신 HTTPS 필수 | 프로덕션 환경 필수 |
| **CORS** | 허용된 도메인만 요청 수락 | 환경변수로 설정 |
| **XSS 방지** | 입력값 검증 및 출력 인코딩 | React 내장 보호 + Content Security Policy |
| **SQL Injection 방지** | 파라미터화된 쿼리 사용 | pg 라이브러리의 parameterized queries |
| **Rate Limiting** | 로그인: 5회/분, 일반 API: 60회/분 | API 엔드포인트별 적용 |
| **데이터 접근 제어** | 본인 데이터만 조회/수정/삭제 가능 | 모든 조회 쿼리에서 user_id 필터 필수 |

### 4.3 가용성 요구사항

| 항목 | 기준 |
|------|------|
| **가용성 목표** | 99.5% (월간 기준) |
| **계획된 유지보수** | 주 1회, 자정 이후 30분 이내 |
| **에러 로깅** | 모든 5xx, 4xx 오류 기록 및 모니터링 |
| **백업** | 일 1회 자동 백업, 최소 7일 보관 |
| **재해 복구** | RTO 1시간, RPO 1시간 목표 |

### 4.4 호환성 요구사항

| 항목 | 기준 |
|------|------|
| **브라우저 지원** | Chrome, Firefox, Safari, Edge 최신 버전 |
| **모바일 브라우저** | iOS Safari, Android Chrome 최신 버전 |
| **반응형 디자인** | 모바일(320px~), 태블릿(768px~), 데스크탑(1024px~) |
| **데이터베이스** | PostgreSQL 12 이상 |
| **Node.js** | v18 이상 |
| **React** | v19 |

### 4.5 접근성 요구사항

| 항목 | 기준 |
|------|------|
| **WCAG 준수** | WCAG 2.1 Level AA |
| **스크린 리더** | 모든 주요 요소 접근 가능 |
| **키보드 네비게이션** | Tab, Shift+Tab, Enter 지원 |
| **색상 대비** | 텍스트 대비 4.5:1 이상 |

### 4.6 비밀번호 정책

| 규칙 | 기준 |
|------|------|
| **최소 길이** | 8자 이상 |
| **최대 길이** | 64자 이하 |
| **영문 대소문자** | 대문자(A-Z) 1자 이상 + 소문자(a-z) 1자 이상 포함 필수 |
| **숫자** | 0-9 중 1자 이상 포함 필수 |
| **특수문자** | `!@#$%^&*()_+-=[]{}` 중 1자 이상 포함 필수 |
| **공백** | 사용 불가 |
| **암호화** | bcrypt (salt rounds: 10) 단방향 암호화 저장 |
| **평문 저장 금지** | DB에 평문 비밀번호 저장 절대 금지 |

**정규식 검증 예시:**
```
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}])[^\s]{8,64}$/
```

### 4.7 JWT 인증 규칙

| 규칙 | 기준 |
|------|------|
| **인증 방식** | JWT (JSON Web Token) Bearer 토큰 방식 |
| **알고리즘** | HS256 (HMAC-SHA256) |
| **Access Token 유효기간** | 15분 |
| **Refresh Token 유효기간** | 7일 |
| **Secret Key 관리** | 환경변수(`.env`) 저장, 최소 32자 이상 랜덤 문자열 |
| **토큰 전달 방식** | Access Token: `Authorization: Bearer <token>` 헤더 |
| **Refresh Token 저장** | HTTP-only 쿠키 (`sameSite=Strict`, `secure=true`) |
| **Access Token 만료 처리** | 클라이언트가 `/auth/refresh`로 자동 갱신 요청 |
| **Refresh Token 만료 처리** | 401 반환 후 재로그인 요구 |
| **토큰 검증 실패** | 위변조·만료·형식 오류 시 401 Unauthorized 반환 |
| **인증 미들웨어** | 모든 protected 엔드포인트에 JWT 검증 미들웨어 적용 필수 |

---

## 5. 기술 아키텍처 개요

### 5.1 3-Tier 아키텍처

```
┌─────────────────────────────────────┐
│        프론트엔드 계층               │
│  React 19 + TypeScript + Zustand   │
│       + TanStack Query              │
│   (모바일웹 + 데스크탑 반응형)      │
└──────────────┬──────────────────────┘
               │ REST API / HTTPS
┌──────────────▼──────────────────────┐
│        백엔드 계층                   │
│  Node.js + Express + pg             │
│  (JWT 인증, 비즈니스 로직)          │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│        데이터계층                    │
│      PostgreSQL 12+                 │
│  (User, Todo 테이블)                │
└─────────────────────────────────────┘
```

### 5.2 기술 스택

| 계층 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **프론트엔드** | React | 19 | UI 렌더링 |
| | TypeScript | 최신 | 타입 안정성 |
| | Zustand | 4.4+ | 상태 관리 |
| | TanStack Query | 5.0+ | 서버 상태 관리 |
| | Axios | 1.6+ | HTTP 클라이언트 |
| | Vite | 최신 | 빌드 도구 |
| **백엔드** | Node.js | v18+ | 런타임 환경 |
| | Express | 4.18+ | 웹 프레임워크 |
| | pg | 8.10+ | PostgreSQL 클라이언트 |
| | bcryptjs | 2.4+ | 비밀번호 암호화 |
| | jsonwebtoken | 9.0+ | JWT 토큰 생성/검증 |
| | joi / zod | 최신 | 입력값 검증 |
| | dotenv | 16.3+ | 환경변수 관리 |
| **데이터베이스** | PostgreSQL | 12+ | RDBMS |
| **배포** | 미정 | - | AWS/GCP/Vercel 등 검토 예정 |

### 5.3 상태(Status) 필드 구현 방식

**결정:** 런타임 계산 방식 채택

**이유:**
- status는 오늘 날짜(KST), start_date, due_date, is_completed, is_success에 의존
- 매일 자정에 상태가 변경되므로 데이터베이스의 status 필드를 동기화하기 어려움
- 조회 시 현재 시간 기준으로 status를 동적 계산하는 것이 효율적

**구현:**
```typescript
// 백엔드: Node.js 함수
function calculateTodoStatus(
  startDate: Date,
  dueDate: Date,
  isCompleted: boolean,
  isSuccess: boolean
): TodoStatus {
  if (isCompleted) {
    return isSuccess ? "COMPLETED_SUCCESS" : "COMPLETED_FAILURE";
  }
  
  const today = new Date(); // KST 기준
  if (today < startDate) return "NOT_STARTED";
  if (today > dueDate) return "OVERDUE";
  return "IN_PROGRESS";
}

// 조회 시 모든 Todo에 status 필드 추가
todos = todos.map(todo => ({
  ...todo,
  status: calculateTodoStatus(...)
}));
```

**프론트엔드:**
- 조회한 todos 데이터에서 status 필드를 그대로 사용
- 필터링 로직: 받은 status 값을 기반으로 UI에서 필터링

---

## 6. API 개요

### 6.1 주요 엔드포인트

| ID | 메서드 | 경로 | 설명 | 인증 | 응답 상태 |
|----|----|------|------|------|---------|
| EP-01 | POST | `/auth/signup` | 회원가입 | 불필요 | 201 Created |
| EP-02 | POST | `/auth/login` | 로그인 | 불필요 | 200 OK |
| EP-03 | POST | `/auth/refresh` | 토큰 갱신 | 불필요* | 200 OK |
| EP-04 | POST | `/todos` | 할일 생성 | 필수 | 201 Created |
| EP-05 | GET | `/todos` | 할일 목록 조회 | 필수 | 200 OK |
| EP-06 | GET | `/todos/:id` | 할일 상세 조회 | 필수 | 200 OK |
| EP-07 | PUT | `/todos/:id` | 할일 수정 | 필수 | 200 OK |
| EP-08 | POST | `/todos/:id/complete` | 할일 완료 처리 | 필수 | 200 OK |
| EP-09 | DELETE | `/todos/:id` | 할일 삭제 | 필수 | 204 No Content |

*EP-03: Refresh Token은 쿠키 또는 요청 본문에 포함

### 6.2 인증 헤더

```
Authorization: Bearer <accessToken>
```

**발급:**
- 로그인(EP-02) 또는 토큰 갱신(EP-03) 시 응답 본문에 포함
- HTTP-only 쿠키 저장 권장 (XSS 방지)

**검증:**
- 모든 인증 필수 엔드포인트에서 Bearer 토큰 검증
- 만료 시 401 Unauthorized 응답

---

## 7. 토큰 정책

### 7.1 JWT 토큰 구조

**Access Token:**
- **타입:** JWT (Header.Payload.Signature)
- **알고리즘:** HS256
- **유효 기간:** 15분 (900초)
- **페이로드 클레임:**
  ```json
  {
    "sub": "user_id (UUID)",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234568790
  }
  ```

**Refresh Token:**
- **타입:** JWT
- **알고리즘:** HS256
- **유효 기간:** 7일 (604,800초)
- **페이로드 클레임:**
  ```json
  {
    "sub": "user_id (UUID)",
    "type": "refresh",
    "iat": 1234567890,
    "exp": 1234607890
  }
  ```

### 7.2 토큰 발급 및 갱신 흐름

**로그인 시:**
1. 사용자가 이메일/비밀번호로 로그인
2. 서버가 Access Token + Refresh Token 발급
3. 클라이언트가 두 토큰을 저장 (AccessToken: 메모리 또는 secureContext, RefreshToken: HTTP-only 쿠키)

**Access Token 만료 시:**
1. 클라이언트가 `/auth/refresh` 엔드포인트 호출 (Refresh Token 포함)
2. 서버가 Refresh Token 검증
3. 새 Access Token 발급
4. 클라이언트가 새 토큰으로 요청 재시도

**Refresh Token 만료 시:**
1. 토큰 갱신 실패 (401 Unauthorized)
2. 사용자에게 재로그인 요청
3. 새로운 Access Token + Refresh Token 발급

### 7.3 보안 고려사항

| 항목 | 정책 |
|------|------|
| **Secret Key** | 환경변수로 관리 (최소 32자 이상 랜덤 문자열) |
| **토큰 저장소** | Refresh Token은 HTTP-only 쿠키 (sameSite=Strict) |
| **토큰 검증** | 모든 protected 엔드포인트에서 필수 검증 |
| **HTTPS** | 토큰 전송은 HTTPS 필수 |
| **토큰 폐기** | 로그아웃 시 클라이언트 쿠키 삭제 (서버 블랙리스트 선택사항) |

---

## 8. MVP 범위 및 출시 계획

### 8.1 포함 기능 (1차 출시)

**인증 기능:**
- UC-01: 회원가입
- UC-02: 로그인
- 토큰 갱신 (보조)

**할일 관리:**
- UC-03: 할일 생성
- UC-04: 할일 목록 조회 (필터링 + 정렬)
- UC-05: 할일 수정
- UC-06: 할일 완료 처리
- UC-07: 할일 삭제

**UI:**
- 모바일웹 + 데스크탑 반응형 디자인
- 로그인/회원가입 페이지
- 할일 목록 페이지
- 할일 생성/수정 모달
- 필터 + 정렬 UI

### 8.2 제외 기능 (향후 고려)

| 기능 | 사유 | 예상 추가 버전 |
|------|------|--------------|
| 팀 협업 | 프로젝트 scope 외 | v1.1 |
| 실시간 알림 | 복잡도 높음, MVP 기간 부족 | v1.2 |
| 파일 첨부 | 저장소 비용 고려 필요 | v1.3 |
| 외부 캘린더 연동 | API 통합 복잡도 | v2.0 |
| 모바일 앱 | 웹 MVP 검증 후 | v2.0 |

### 8.3 출시 일정

| 마일스톤 | 목표 | 기간 |
|---------|------|------|
| **설계 완료** | ERD, API 명세, UI 와이어프레임 | 2026-04-01 (1일) |
| **개발 완료** | 모든 UC 구현, 통합 테스트 | 2026-04-02 (1일) |
| **QA 및 배포** | 회귀 테스트, 성능 검증, 프로덕션 배포 | 2026-04-03 (1일) |
| **출시** | 공식 릴리스, 사용자 문서 배포 | 2026-04-03 |

**총 개발 기간:** 3일 (MVP 최우선)

### 8.4 초기 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|---------|
| **회원가입 수** | 100~500명 (1주) | Google Analytics / 데이터베이스 |
| **일간 활성 사용자(DAU)** | 10% 이상 | Analytics 추적 |
| **평균 세션 시간** | 3분 이상 | Google Analytics |
| **API 에러율** | < 1% | 서버 로그 모니터링 |
| **페이지 로드 시간** | < 2초 (P95) | Google Analytics / Lighthouse |
| **사용자 만족도** | NPS 50+ | 설문조사 또는 피드백 폼 |

---

## 9. 변경 이력

| 버전 | 작성일 | 작성자 | 변경 사항 |
|------|--------|--------|---------|
| v0.1 | 2026-04-01 | Yongwoo | 초기 작성 - UC-01~07, 3-tier 아키텍처, JWT 토큰 정책, MVP 범위 정의 |
| v0.2 | 2026-04-01 | Yongwoo | 비밀번호 정책(§4.6) 및 JWT 인증 규칙(§4.7) 명세 추가 |
| v0.3 | 2026-04-01 | Yongwoo | §5.2 기술 스택에 Vite(빌드 도구) 추가 |

---

**문서 승인자:** (예정)  
**최종 검토일:** (예정)

