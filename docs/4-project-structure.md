# 프로젝트 구조 설계 원칙

**프로젝트명:** todolist-app
**문서 버전:** v0.1
**작성일:** 2026-04-01
**작성자:** Yongwoo

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성 / 레이어 원칙](#2-의존성--레이어-원칙)
3. [코드 / 네이밍 원칙](#3-코드--네이밍-원칙)
4. [테스트 / 품질 원칙](#4-테스트--품질-원칙)
5. [설정 / 보안 / 운영 원칙](#5-설정--보안--운영-원칙)
6. [프론트엔드 디렉토리 구조](#6-프론트엔드-디렉토리-구조)
7. [백엔드 디렉토리 구조](#7-백엔드-디렉토리-구조)

---

## 1. 최상위 공통 원칙

프론트엔드, 백엔드, DB 모든 스택에 공통 적용되는 원칙이다.

| ID | 원칙 | 설명 |
|----|------|------|
| P-001 | 단일 책임 | 모든 모듈(파일, 함수, 클래스)은 하나의 책임만 가진다. 한 파일에 복수의 도메인 로직을 혼재하지 않는다 |
| P-002 | 명시적 의존 | 의존하는 모듈은 import로 명시한다. 전역 상태나 암묵적 사이드이펙트에 의존하지 않는다 |
| P-003 | 런타임 상태 계산 | `status` 필드는 DB에 저장하지 않는다. 조회 시점의 날짜(KST), `start_date`, `due_date`, `is_completed`, `is_success` 값으로 서버에서 동적 계산 후 응답에 포함한다 |
| P-004 | 환경 격리 | 개발(development), 스테이징(staging), 프로덕션(production) 환경을 분리한다. 환경별 설정은 환경변수로만 관리한다 |
| P-005 | 보안 우선 | 모든 입력값은 신뢰하지 않는다. 프론트엔드 검증은 UX 목적이며, 최종 검증은 반드시 백엔드에서 수행한다 |
| P-006 | 인증 범위 명시 | 모든 API 엔드포인트는 인증 필요 여부를 명시한다. 인증이 필요한 엔드포인트는 반드시 JWT 미들웨어를 적용한다 |
| P-007 | 에러 표준화 | 에러 응답 형식을 전 계층에서 통일한다. 클라이언트에 스택 트레이스나 내부 구현 세부사항을 노출하지 않는다 |
| P-008 | 코드 리뷰 가능성 | PR 단위의 변경은 리뷰 가능한 크기로 유지한다. 단일 파일 변경이 300줄을 초과하지 않도록 분리를 검토한다 |

---

## 2. 의존성 / 레이어 원칙

### 2.1 전체 레이어 구조

```
[프론트엔드]
  Pages / Screens
       ↓
  Features (도메인 기능 단위)
       ↓
  Shared (공통 컴포넌트, 훅, 유틸)
       ↓
  API Layer (Axios 인스턴스, 엔드포인트 함수)

[백엔드]
  Router (Express 라우터)
       ↓
  Controller (요청 파싱, 응답 구성)
       ↓
  Service (비즈니스 로직, 상태 계산)
       ↓
  Repository (SQL 쿼리, DB 접근)
       ↓
  Database (PostgreSQL)
```

### 2.2 레이어 의존 규칙

| ID | 원칙 | 설명 |
|----|------|------|
| P-010 | 단방향 의존 | 의존 방향은 위에서 아래로만 흐른다. 하위 레이어는 상위 레이어를 절대 import하지 않는다 |
| P-011 | Repository 격리 | DB 접근(SQL 쿼리)은 반드시 Repository 레이어에서만 수행한다. Service 레이어에서 직접 `pg` 쿼리를 작성하지 않는다 |
| P-012 | Controller 무상태 | Controller는 요청 파싱과 응답 직렬화만 담당한다. 비즈니스 판단 로직을 포함하지 않는다 |
| P-013 | Service 레이어 책임 | 비즈니스 규칙(BR), 상태 계산(`calculateTodoStatus`), 소유권 검증(user_id 일치 확인)은 Service 레이어에서 처리한다 |
| P-014 | 프론트 API 레이어 격리 | 서버 API 호출은 반드시 `/src/api/` 내의 함수를 통해서만 수행한다. 컴포넌트에서 Axios를 직접 호출하지 않는다 |
| P-015 | 상태 관리 분리 | TanStack Query는 서버 상태(Todo 목록, 사용자 정보 등) 관리에 사용한다. Zustand는 클라이언트 전용 UI 상태(필터 선택값, 모달 열림 여부 등) 관리에 사용한다 |

### 2.3 레이어별 책임 요약

| 레이어 | 위치 | 책임 | 금지 사항 |
|--------|------|------|----------|
| Router | `src/routes/` | URL 매핑, 미들웨어 체인 구성 | 비즈니스 로직 |
| Controller | `src/controllers/` | 요청 파싱, 입력값 검증 위임, 응답 반환 | DB 직접 접근, 비즈니스 판단 |
| Service | `src/services/` | 비즈니스 규칙 적용, 상태 계산, 소유권 검증 | HTTP 개념(`req`, `res`) 참조 |
| Repository | `src/repositories/` | SQL 파라미터화 쿼리, DB 결과 매핑 | 비즈니스 로직, HTTP 개념 참조 |
| Middleware | `src/middlewares/` | JWT 검증, Rate Limiting, 에러 핸들링 | 비즈니스 로직 |

---

## 3. 코드 / 네이밍 원칙

### 3.1 공통

| ID | 원칙 | 규칙 |
|----|------|------|
| P-020 | 언어 | 변수명, 함수명, 폴더명은 영어로 작성한다. 주석과 문서는 한국어로 작성한다 |
| P-021 | 약어 금지 | `usr`, `req`, `res` 등 Express 관례를 제외한 도메인 약어는 사용하지 않는다. `user`, `todo`, `response` 등 전체 단어를 사용한다 |
| P-022 | 매직 값 금지 | 숫자 리터럴, 문자열 리터럴을 코드에 직접 사용하지 않는다. 상수(`constants/`) 또는 enum으로 정의한다 |

### 3.2 프론트엔드 (React 19 + TypeScript)

| ID | 대상 | 규칙 | 예시 |
|----|------|------|------|
| P-030 | 컴포넌트 파일명 | PascalCase | `TodoCard.tsx`, `LoginForm.tsx` |
| P-031 | 컴포넌트 함수명 | PascalCase | `function TodoCard()` |
| P-032 | 훅 파일명 | camelCase, `use` 접두사 | `useTodoList.ts`, `useAuth.ts` |
| P-033 | 훅 함수명 | camelCase, `use` 접두사 | `function useTodoList()` |
| P-034 | 유틸 함수명 | camelCase | `calculateTodoStatus`, `formatDate` |
| P-035 | 타입 / 인터페이스명 | PascalCase | `Todo`, `User`, `ApiResponse<T>` |
| P-036 | Zustand 스토어 | camelCase, `use` 접두사 | `useTodoFilterStore`, `useAuthStore` |
| P-037 | 폴더명 | kebab-case | `todo-list/`, `auth/`, `shared/` |
| P-038 | 상수명 | UPPER_SNAKE_CASE | `TODO_STATUS`, `ACCESS_TOKEN_KEY` |
| P-039 | CSS 클래스명 | kebab-case | `todo-card`, `btn-primary` |
| P-040 | API 함수명 | camelCase, HTTP 메서드 + 리소스 | `getTodos`, `createTodo`, `deleteTodo` |

### 3.3 백엔드 (Node.js + Express)

| ID | 대상 | 규칙 | 예시 |
|----|------|------|------|
| P-050 | 파일명 | camelCase | `todoService.ts`, `authController.ts` |
| P-051 | 라우터 파일 | 리소스명 단수 | `todoRouter.ts`, `authRouter.ts` |
| P-052 | 함수명 | camelCase, 동사 + 명사 | `createTodo`, `findTodoById`, `calculateTodoStatus` |
| P-053 | 타입 / 인터페이스 | PascalCase | `TodoRow`, `CreateTodoInput`, `JwtPayload` |
| P-054 | 환경변수명 | UPPER_SNAKE_CASE | `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN` |
| P-055 | DB 컬럼명 | snake_case (PostgreSQL 관례) | `user_id`, `is_completed`, `created_at` |
| P-056 | 상수 파일 | camelCase | `httpStatus.ts`, `errorMessages.ts` |
| P-057 | 미들웨어 함수 | camelCase, 기능 명시 | `authenticateToken`, `rateLimitLogin` |
| P-058 | Repository 함수 | camelCase, DB 동작 명시 | `findUserByEmail`, `insertTodo`, `updateTodoById` |

### 3.4 DB (PostgreSQL)

| ID | 대상 | 규칙 | 예시 |
|----|------|------|------|
| P-060 | 테이블명 | snake_case 복수형 | `users`, `todos` |
| P-061 | 컬럼명 | snake_case | `user_id`, `due_date`, `is_completed` |
| P-062 | 인덱스명 | `idx_{테이블}_{컬럼}` | `idx_todos_user_id`, `idx_todos_due_date` |
| P-063 | 제약조건명 | `{테이블}_{컬럼}_{타입}` | `todos_user_id_fk`, `users_email_unique` |

---

## 4. 테스트 / 품질 원칙

| ID | 원칙 | 기준 |
|----|------|------|
| P-070 | 단위 테스트 우선 | Service 레이어 비즈니스 로직(특히 `calculateTodoStatus`)은 반드시 단위 테스트를 작성한다 |
| P-071 | 커버리지 목표 | Service 레이어 라인 커버리지 80% 이상. Repository, Controller 레이어는 통합 테스트로 보완한다 |
| P-072 | 상태 계산 테스트 | `calculateTodoStatus` 함수는 5가지 상태(`NOT_STARTED`, `IN_PROGRESS`, `OVERDUE`, `COMPLETED_SUCCESS`, `COMPLETED_FAILURE`) 전체를 테스트 케이스로 커버한다 |
| P-073 | 통합 테스트 | 인증 흐름(회원가입 → 로그인 → 토큰 갱신), 할일 CRUD 전 주기를 통합 테스트로 검증한다 |
| P-074 | 프론트 컴포넌트 테스트 | 사용자 인터랙션이 있는 핵심 컴포넌트(로그인 폼, 할일 생성 폼, 완료 처리)는 React Testing Library로 테스트한다 |
| P-075 | 타입 안전성 | TypeScript strict 모드를 활성화한다. `any` 타입 사용을 금지한다 (lint 규칙으로 강제) |
| P-076 | 린트 / 포맷 | ESLint + Prettier를 CI에서 강제 적용한다. 린트 오류가 있는 코드는 병합하지 않는다 |
| P-077 | 보안 테스트 | SQL Injection 방어 확인(parameterized query), JWT 위변조 테스트, 타인 할일 접근 차단(403) 테스트를 포함한다 |
| P-078 | 성능 기준 | API 응답 P95 < 500ms, DB 쿼리 P95 < 100ms. 부하 테스트(동시접속 500명)를 출시 전 필수로 실행한다 |

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경변수 관리

| ID | 원칙 | 규칙 |
|----|------|------|
| P-080 | `.env` 파일 비공개 | `.env` 파일은 `.gitignore`에 등록한다. 저장소에 절대 커밋하지 않는다 |
| P-081 | `.env.example` 유지 | 필요한 환경변수 목록과 설명을 담은 `.env.example`을 저장소에 관리한다. 실제 값은 포함하지 않는다 |
| P-082 | 환경별 분리 | `.env.development`, `.env.production` 등 환경별 파일을 분리한다 |
| P-083 | 환경변수 검증 | 서버 시작 시 필수 환경변수 존재 여부와 최소 길이를 검증한다. 누락 시 즉시 프로세스를 종료한다 |

**필수 환경변수 목록 (Tier별)**

---

#### [Tier 1] 프론트엔드 (`frontend/.env.*`)

| 변수명 | 필수 | 개발 기본값 | 설명 |
|--------|:----:|------------|------|
| `VITE_API_BASE_URL` | ✅ | `http://localhost:3000` | 백엔드 API 서버 기본 URL. Axios 인스턴스의 `baseURL`로 사용 |
| `VITE_APP_ENV` | ✅ | `development` | 현재 실행 환경 (`development` / `production`). 로그·디버그 출력 여부 제어 |

```
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development

# frontend/.env.production
VITE_API_BASE_URL=https://api.todolist-app.com
VITE_APP_ENV=production
```

> Vite 환경변수는 반드시 `VITE_` 접두사를 사용해야 클라이언트 번들에 포함된다.  
> API 키·시크릿 값은 프론트엔드 환경변수에 절대 포함하지 않는다.

---

#### [Tier 2] 백엔드 (`backend/.env.*`)

| 변수명 | 필수 | 개발 기본값 | 설명 |
|--------|:----:|------------|------|
| **서버** | | | |
| `NODE_ENV` | ✅ | `development` | 실행 환경 (`development` / `production`). Express 오류 출력 방식 제어 |
| `PORT` | ✅ | `3000` | Express 서버 리슨 포트 |
| **JWT 인증** | | | |
| `JWT_ACCESS_SECRET` | ✅ | _(없음, 직접 설정)_ | Access Token 서명 키. 최소 32자 랜덤 문자열 필수. 서버 시작 시 길이 검증 |
| `JWT_REFRESH_SECRET` | ✅ | _(없음, 직접 설정)_ | Refresh Token 서명 키. Access Secret과 반드시 다른 값 사용 |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | `15m` | Access Token 유효기간 (`15m` = 15분) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | `7d` | Refresh Token 유효기간 (`7d` = 7일) |
| **CORS** | | | |
| `CORS_ORIGIN` | ✅ | `http://localhost:5173` | 허용할 프론트엔드 도메인. 와일드카드(`*`) 사용 금지 |
| **Rate Limiting** | | | |
| `RATE_LIMIT_LOGIN_MAX` | ✅ | `5` | 로그인 엔드포인트 최대 요청 수 (건/분, IP 기준) |
| `RATE_LIMIT_API_MAX` | ✅ | `60` | 일반 API 최대 요청 수 (건/분, IP 기준) |
| `RATE_LIMIT_WINDOW_MS` | ✅ | `60000` | Rate Limit 측정 윈도우 (밀리초, 기본 1분) |
| **암호화** | | | |
| `BCRYPT_SALT_ROUNDS` | ✅ | `10` | bcrypt 해싱 라운드 수. 프로덕션에서 낮추지 않는다 |

```
# backend/.env.development
NODE_ENV=development
PORT=3000

JWT_ACCESS_SECRET=dev-access-secret-must-be-32-chars-min!!
JWT_REFRESH_SECRET=dev-refresh-secret-must-be-32-chars-min!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_API_MAX=60
RATE_LIMIT_WINDOW_MS=60000

BCRYPT_SALT_ROUNDS=10

# backend/.env.production
NODE_ENV=production
PORT=3000

JWT_ACCESS_SECRET=<CI/CD 시크릿 매니저에서 주입>
JWT_REFRESH_SECRET=<CI/CD 시크릿 매니저에서 주입>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://todolist-app.com

RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_API_MAX=60
RATE_LIMIT_WINDOW_MS=60000

BCRYPT_SALT_ROUNDS=10
```

---

#### [Tier 3] 데이터베이스 (`backend/.env.*` — DB 접속 정보)

| 변수명 | 필수 | 개발 기본값 | 설명 |
|--------|:----:|------------|------|
| `DB_HOST` | ✅ | `localhost` | PostgreSQL 서버 호스트 |
| `DB_PORT` | ✅ | `5432` | PostgreSQL 포트 |
| `DB_NAME` | ✅ | `todolist_dev` | 데이터베이스 이름 |
| `DB_USER` | ✅ | `postgres` | DB 접속 사용자 |
| `DB_PASSWORD` | ✅ | _(없음, 직접 설정)_ | DB 접속 비밀번호. 평문으로 코드에 하드코딩 금지 |
| `DB_POOL_MAX` | ✅ | `10` | pg Pool 최대 연결 수 (동시접속 500명 기준 10~20 권장) |
| `DB_POOL_IDLE_TIMEOUT_MS` | ✅ | `30000` | 유휴 커넥션 해제 대기 시간 (밀리초) |
| `DB_CONNECTION_TIMEOUT_MS` | ✅ | `2000` | 연결 타임아웃 (밀리초) |

```
# backend/.env.development (DB 항목)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=2000

# backend/.env.production (DB 항목)
DB_HOST=<RDS 또는 Cloud SQL 엔드포인트>
DB_PORT=5432
DB_NAME=todolist_prod
DB_USER=<CI/CD 시크릿 매니저에서 주입>
DB_PASSWORD=<CI/CD 시크릿 매니저에서 주입>
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=2000
```

---

#### `.env.example` 관리 원칙

- 모든 환경변수를 포함하되 실제 시크릿 값은 `<설명>` 형식으로 대체한다
- 신규 환경변수 추가 시 반드시 `.env.example`도 동시에 업데이트한다
- `backend/src/config/env.ts`에서 서버 시작 시 필수 변수 누락 여부를 검증한다

### 5.2 보안 원칙

| ID | 원칙 | 규칙 |
|----|------|------|
| P-090 | 비밀번호 저장 | bcrypt salt rounds 10으로 단방향 암호화 저장. 평문 비밀번호를 DB에 저장하거나 로그에 출력하지 않는다 |
| P-091 | JWT Secret 강도 | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`은 최소 32자 이상의 랜덤 문자열이어야 한다. 서버 시작 시 길이 검증을 수행한다 |
| P-092 | Parameterized Query 필수 | 모든 SQL 쿼리는 `pg` 라이브러리의 파라미터화 쿼리(`$1`, `$2` 방식)를 사용한다. 문자열 템플릿으로 SQL을 구성하지 않는다 |
| P-093 | Refresh Token 쿠키 | Refresh Token은 `httpOnly: true`, `secure: true`, `sameSite: 'Strict'` 옵션의 쿠키로 전달한다 |
| P-094 | Rate Limiting | 로그인 엔드포인트: 5회/분, 일반 API: 60회/분 제한을 IP 기반으로 적용한다 |
| P-095 | CORS 화이트리스트 | 허용 도메인은 `CORS_ORIGIN` 환경변수로 관리한다. 와일드카드(`*`) 사용을 금지한다 |
| P-096 | 소유권 검증 | Todo 조회, 수정, 삭제, 완료 처리 시 반드시 `WHERE user_id = $userId AND id = $todoId` 조건으로 소유권을 DB 쿼리 레벨에서 검증한다 |
| P-097 | 민감정보 로그 금지 | 로그에 비밀번호, JWT 토큰, 개인정보를 출력하지 않는다 |

### 5.3 로깅 원칙

| ID | 원칙 | 규칙 |
|----|------|------|
| P-100 | 로깅 도구 | 별도 로깅 라이브러리를 사용하지 않는다. Node.js 내장 `console` 객체를 사용한다 |
| P-101 | 레벨별 메서드 | `console.error()`: 5xx 서버 오류 및 예외 / `console.warn()`: 4xx 클라이언트 오류, Rate Limit 초과 / `console.info()`: 요청/응답 요약, 서버 시작 / `console.log()`: 개발 환경 디버그 정보 |
| P-102 | 구조화 출력 | 로그 출력 시 단순 문자열 대신 객체를 함께 출력한다. `console.info('[REQ]', { method, path, statusCode, durationMs })` 형식으로 기록한다 |
| P-103 | 요청 로깅 | 모든 HTTP 요청에 대해 메서드, 경로, 상태코드, 응답시간을 `console.info()`로 기록한다 |
| P-104 | 에러 로깅 | 5xx 에러는 `console.error()`로 스택 트레이스 전체를 출력한다. 클라이언트 응답에는 포함하지 않는다 |
| P-105 | 프로덕션 로그 억제 | `NODE_ENV=production` 환경에서는 `console.log()` 출력을 비활성화한다. `console.info()` 이상 레벨만 출력한다 |

### 5.4 에러 핸들링 원칙

| ID | 원칙 | 규칙 |
|----|------|------|
| P-110 | 표준 에러 응답 형식 | 모든 에러 응답은 `{ success: false, error: { code: string, message: string } }` 형식을 따른다 |
| P-111 | 글로벌 에러 핸들러 | Express의 글로벌 에러 핸들링 미들웨어(`errorHandler.ts`)에서 모든 에러를 일괄 처리한다 |
| P-112 | 도메인 에러 클래스 | `AppError` 기반의 도메인 에러 클래스(`ValidationError`, `AuthError`, `NotFoundError`, `ForbiddenError`)를 정의한다. 이를 통해 HTTP 상태코드를 일관되게 매핑한다 |
| P-113 | 비동기 에러 전파 | async/await 함수는 try-catch 또는 `asyncHandler` 래퍼로 감싸 에러가 글로벌 핸들러로 전달되도록 한다 |

---

## 6. 프론트엔드 디렉토리 구조

React 19 + TypeScript + Zustand + TanStack Query + Axios 기반.

```
frontend/
├── public/                          # 정적 파일 (favicon, robots.txt 등)
├── src/
│   ├── main.tsx                     # 애플리케이션 진입점, QueryClient·Router 주입
│   ├── App.tsx                      # 루트 컴포넌트, 라우팅 정의
│   │
│   ├── api/                         # 서버 API 통신 레이어 (Axios 기반)
│   │   ├── axiosInstance.ts         # Axios 인스턴스 생성, 인터셉터 (토큰 자동 갱신)
│   │   ├── authApi.ts               # 회원가입·로그인·토큰 갱신 API 함수
│   │   └── todoApi.ts               # 할일 CRUD·완료처리 API 함수
│   │
│   ├── features/                    # 도메인 기능 단위 모듈
│   │   ├── auth/                    # 인증 기능 모음
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx    # 로그인 폼 컴포넌트 (UC-02)
│   │   │   │   └── SignupForm.tsx   # 회원가입 폼 컴포넌트 (UC-01)
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts      # 로그인 TanStack Query mutation
│   │   │   │   └── useSignup.ts     # 회원가입 TanStack Query mutation
│   │   │   └── stores/
│   │   │       └── useAuthStore.ts  # Zustand: 인증 상태 (accessToken, user)
│   │   │
│   │   └── todos/                   # 할일 기능 모음
│   │       ├── components/
│   │       │   ├── TodoList.tsx        # 할일 목록 렌더링 (UC-04)
│   │       │   ├── TodoCard.tsx        # 개별 할일 카드 (status 배지 포함)
│   │       │   ├── TodoCreateForm.tsx  # 할일 생성 폼 (UC-03)
│   │       │   ├── TodoEditForm.tsx    # 할일 수정 폼 (UC-05)
│   │       │   ├── TodoFilterBar.tsx   # 상태 필터 + 정렬 선택 UI
│   │       │   └── TodoCompleteModal.tsx  # 완료 처리 모달 (UC-06)
│   │       ├── hooks/
│   │       │   ├── useTodos.ts         # 할일 목록 TanStack Query (필터·정렬·페이지 포함)
│   │       │   ├── useCreateTodo.ts    # 할일 생성 mutation
│   │       │   ├── useUpdateTodo.ts    # 할일 수정 mutation
│   │       │   ├── useCompleteTodo.ts  # 할일 완료처리 mutation
│   │       │   └── useDeleteTodo.ts    # 할일 삭제 mutation
│   │       └── stores/
│   │           └── useTodoFilterStore.ts  # Zustand: 필터·정렬·페이지 UI 상태
│   │
│   ├── pages/                       # 라우트 단위 페이지 컴포넌트
│   │   ├── LoginPage.tsx            # /login
│   │   ├── SignupPage.tsx           # /signup
│   │   └── TodosPage.tsx            # / (메인, 인증 필요)
│   │
│   ├── shared/                      # 도메인에 종속되지 않는 공통 자원
│   │   ├── components/
│   │   │   ├── Button.tsx           # 공통 버튼 컴포넌트
│   │   │   ├── Input.tsx            # 공통 입력 필드
│   │   │   ├── Modal.tsx            # 공통 모달 레이아웃
│   │   │   ├── Spinner.tsx          # 로딩 스피너
│   │   │   ├── ErrorMessage.tsx     # 에러 메시지 표시
│   │   │   └── ProtectedRoute.tsx   # 인증 필요 라우트 가드
│   │   ├── hooks/
│   │   │   └── useDebounce.ts       # 입력값 디바운스 훅
│   │   └── utils/
│   │       ├── formatDate.ts        # 날짜 포맷 유틸 (YYYY-MM-DD)
│   │       └── todoStatusLabel.ts   # status → 한국어 레이블 변환
│   │
│   ├── constants/                   # 애플리케이션 전역 상수
│   │   ├── todoStatus.ts            # TODO_STATUS enum / 상수 정의
│   │   └── queryKeys.ts             # TanStack Query queryKey 상수 정의
│   │
│   └── types/                       # TypeScript 타입 정의
│       ├── auth.ts                  # User, LoginRequest, SignupRequest, TokenResponse
│       └── todo.ts                  # Todo, TodoStatus, CreateTodoInput, UpdateTodoInput
│
├── .env.example                     # 필수 환경변수 목록 (실제 값 미포함)
├── .env.development                 # 개발 환경 환경변수 (gitignore)
├── .eslintrc.cjs                    # ESLint 설정 (strict 모드)
├── .prettierrc                      # Prettier 설정
├── tsconfig.json                    # TypeScript 설정 (strict: true)
├── vite.config.ts                   # Vite 빌드 설정
└── package.json
```

---

## 7. 백엔드 디렉토리 구조

Node.js + Express + pg (Prisma 미사용) + bcryptjs + jsonwebtoken 기반.

```
backend/
├── src/
│   ├── index.ts                     # 서버 진입점: 환경변수 검증 후 app 시작
│   ├── app.ts                       # Express 앱 생성, 미들웨어·라우터 등록
│   │
│   ├── config/                      # 설정 모듈
│   │   ├── env.ts                   # 환경변수 로드 및 필수값 검증 (시작 시 실행)
│   │   └── database.ts              # pg Pool 인스턴스 생성 및 연결 설정
│   │
│   ├── routes/                      # Express 라우터 (URL 매핑만 담당)
│   │   ├── index.ts                 # 전체 라우터 통합 등록
│   │   ├── authRouter.ts            # /auth/* 엔드포인트 (EP-01~03)
│   │   └── todoRouter.ts            # /todos/* 엔드포인트 (EP-04~09)
│   │
│   ├── middlewares/                 # Express 미들웨어
│   │   ├── authenticateToken.ts     # JWT Access Token 검증, req.user 주입
│   │   ├── rateLimiter.ts           # Rate Limiting (로그인 5회/분, API 60회/분)
│   │   ├── requestLogger.ts         # HTTP 요청·응답 로깅 (메서드, 경로, 상태코드, 응답시간)
│   │   ├── errorHandler.ts          # 글로벌 에러 핸들러 (AppError → HTTP 응답 변환)
│   │   └── validateBody.ts          # 요청 body 스키마 검증 미들웨어 (joi/zod 기반)
│   │
│   ├── controllers/                 # 요청 파싱, 응답 구성 (HTTP 레이어)
│   │   ├── authController.ts        # 회원가입·로그인·토큰 갱신 핸들러
│   │   └── todoController.ts        # 할일 CRUD·완료처리·삭제 핸들러
│   │
│   ├── services/                    # 비즈니스 로직 레이어 (HTTP 개념 없음)
│   │   ├── authService.ts           # 회원가입 처리, 비밀번호 검증, 토큰 발급
│   │   ├── todoService.ts           # 할일 생성·수정·삭제·완료처리, 소유권 검증
│   │   └── todoStatusService.ts     # calculateTodoStatus(): 5가지 상태 런타임 계산
│   │
│   ├── repositories/                # DB 접근 레이어 (SQL 쿼리 전담)
│   │   ├── userRepository.ts        # users 테이블 CRUD (findByEmail, insert 등)
│   │   └── todoRepository.ts        # todos 테이블 CRUD (user_id 필터 필수)
│   │
│   ├── validators/                  # 입력값 검증 스키마 정의
│   │   ├── authValidator.ts         # 회원가입·로그인 입력값 스키마 (비밀번호 정책 포함)
│   │   └── todoValidator.ts         # 할일 생성·수정 입력값 스키마 (날짜 형식, 길이 제한)
│   │
│   ├── errors/                      # 도메인 에러 클래스
│   │   ├── AppError.ts              # 기본 에러 클래스 (statusCode, errorCode 포함)
│   │   ├── ValidationError.ts       # 입력값 검증 실패 → 400/422
│   │   ├── AuthError.ts             # 인증 실패 → 401
│   │   ├── ForbiddenError.ts        # 소유권 검증 실패 → 403
│   │   └── NotFoundError.ts         # 리소스 없음 → 404
│   │
│   ├── constants/                   # 서버 전역 상수
│   │   ├── httpStatus.ts            # HTTP 상태코드 상수 (200, 201, 400, 401 등)
│   │   ├── errorCodes.ts            # 클라이언트 에러코드 문자열 (INVALID_TOKEN 등)
│   │   └── todoStatus.ts            # TodoStatus enum (NOT_STARTED, IN_PROGRESS 등)
│   │
│   └── types/                       # TypeScript 타입 정의
│       ├── express.d.ts             # req.user 타입 확장 (JwtPayload 주입)
│       ├── auth.ts                  # JwtPayload, TokenPair, SignupInput, LoginInput
│       └── todo.ts                  # Todo, TodoRow, CreateTodoInput, UpdateTodoInput, TodoStatus
│
├── tests/                           # 테스트 파일 (소스 구조 미러링)
│   ├── unit/
│   │   ├── todoStatusService.test.ts  # calculateTodoStatus 5가지 상태 단위 테스트
│   │   ├── authService.test.ts        # 비밀번호 암호화, 토큰 발급 단위 테스트
│   │   └── todoService.test.ts        # 소유권 검증, 비즈니스 규칙 단위 테스트
│   └── integration/
│       ├── auth.test.ts               # 회원가입 → 로그인 → 토큰 갱신 전체 흐름
│       └── todos.test.ts              # 할일 CRUD + 완료처리 전체 흐름, 권한 차단 검증
│
├── .env.example                     # 필수 환경변수 목록 (실제 값 미포함)
├── .env.development                 # 개발 환경 환경변수 (gitignore)
├── .eslintrc.cjs                    # ESLint 설정
├── .prettierrc                      # Prettier 설정
├── tsconfig.json                    # TypeScript 설정 (strict: true)
└── package.json
```

---

## 변경 이력 (Revision History)

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v0.1 | 2026-04-01 | Yongwoo | 최초 작성: 공통 원칙, 레이어 원칙, 네이밍 원칙, 테스트 원칙, 보안/운영 원칙, 프론트엔드·백엔드 디렉토리 구조 정의 |
| v0.2 | 2026-04-01 | Yongwoo | §5.1 환경변수 목록을 Tier별(프론트엔드/백엔드/DB)로 상세화, 개발·프로덕션 예시값 및 설명 추가 |
| v0.3 | 2026-04-01 | Yongwoo | §5.3 로깅 원칙에 콘솔 로그(`console`) 사용 명시, 레벨별 메서드 및 프로덕션 억제 규칙 추가 |
