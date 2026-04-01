# 종합 실행 계획서

**프로젝트명:** todolist-app
**문서 버전:** v1.0
**작성일:** 2026-04-01
**작성자:** Yongwoo

---

## 1. 프로젝트 개요

### 1.1 제품 비전
**"할일 관리의 모든 것을 한 곳에서, 간단하고 명확하게"**

개인별 할일 관리 웹 애플리케이션으로, 시작일과 종료일 기반의 자동 상태 산출을 통해 사용자가 우선순위를 명확히 파악할 수 있도록 지원합니다.

### 1.2 핵심 기능 범위

| 영역 | 포함 기능 | 제외 기능 |
|------|----------|----------|
| **인증** | 회원가입, 로그인, JWT 토큰 갱신 | 소셜 로그인, 2FA |
| **할일 관리** | CRUD, 상태 필터링, 정렬, 완료 처리 | 팀 공유, 알림, 파일 첨부 |
| **플랫폼** | 모바일 웹 + 데스크탑 반응형 | 네이티브 모바일 앱 |

### 1.3 기술 스택

| 계층 | 기술 | 버전 |
|------|------|------|
| **프론트엔드** | React + TypeScript + Zustand + TanStack Query + Vite | 19 + 최신 |
| **백엔드** | Node.js + Express + pg + bcryptjs + jsonwebtoken | v18+ |
| **데이터베이스** | PostgreSQL | 12+ |

### 1.4 개발 기간 (MVP)

| 마일스톤 | 기간 | 주요 산출물 |
|---------|------|------------|
| **설계 완료** | 2026-04-01 (1 일) | 본 문서 포함 7 종 문서 |
| **개발 완료** | 2026-04-02 (1 일) | 모든 UC 구현, 통합 테스트 |
| **QA 및 배포** | 2026-04-03 (1 일) | 회귀 테스트, 프로덕션 배포 |

---

## 2. 작업 분해 구조

### 2.1 전체 작업 요약

| 레이어 | 작업 수 | 선행 작업 | 후행 작업 |
|--------|--------|----------|----------|
| **데이터베이스** | 8 개 | - | 백엔드 |
| **백엔드** | 24 개 | 데이터베이스 | 프론트엔드 |
| **프론트엔드** | 23 개 | 백엔드 API | - |
| **총계** | **55 개** | - | - |

---

## 3. 데이터베이스 작업 (Database)

### DB-01. PostgreSQL 서버 환경 설정

**설명:** PostgreSQL 12+ 서버를 설치하고 개발 환경 접속 설정을 완료한다.

**완료 조건:**
- [x] PostgreSQL 12+ 버전 설치 완료
- [x] 개발용 데이터베이스 사용자 생성
- [x] 접속 권한 및 방화벽 설정 완료
- [x] `psql` CLI 로 접속 테스트 성공

**의존성:**
- [x] 선행 작업: 없음

---

### DB-02. 데이터베이스 생성

**설명:** todolist_dev(개발용) 및 todolist_prod(프로덕션용) 데이터베이스를 생성한다.

**완료 조건:**
- [x] `todolist_dev` 데이터베이스 생성
- [ ] `todolist_prod` 데이터베이스 생성 (배포 시)
- [x] 문자 인코딩 UTF-8 설정
- [x] 타임존 KST(UTC+9) 설정 확인

**의존성:**
- [x] 선행 작업: DB-01
- [x] 후행 작업: DB-03

---

### DB-03. users 테이블 생성

**설명:** 사용자 정보를 저장하는 `users` 테이블을 생성한다.

**스키마:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**완료 조건:**
- [x] `users` 테이블 DDL 실행 완료
- [x] `email` 컬럼에 UNIQUE 제약조건 설정
- [x] `id` 컬럼에 PRIMARY KEY 설정
- [x] 인덱스 자동 생성 확인

**의존성:**
- [x] 선행 작업: DB-02
- [x] 후행 작업: DB-05, BE-01

---

### DB-04. todos 테이블 생성

**설명:** 할일 정보를 저장하는 `todos` 테이블을 생성한다.

**스키마:**
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_success BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**완료 조건:**
- [x] `todos` 테이블 DDL 실행 완료
- [x] `user_id` 에 FOREIGN KEY 제약조건 설정 (ON DELETE CASCADE)
- [x] `CHECK` 제약조건: `due_date >= start_date`
- [x] `status` 컬럼 제외 (런타임 계산)

**의존성:**
- [x] 선행 작업: DB-02
- [x] 후행 작업: DB-05, BE-07

---

### DB-05. 인덱스 생성

**설명:** 조회 성능 최적화를 위한 인덱스를 생성한다.

**완료 조건:**
- [x] `idx_users_email`: `users(email)` 생성
- [x] `idx_todos_user_id`: `todos(user_id)` 생성
- [x] `idx_todos_start_date`: `todos(start_date)` 생성
- [x] `idx_todos_due_date`: `todos(due_date)` 생성
- [x] 복합 인덱스 `idx_todos_user_status`: `todos(user_id, is_completed, start_date, due_date)` 생성

**의존성:**
- [x] 선행 작업: DB-03, DB-04
- [x] 후행 작업: DB-06

---

### DB-06. 데이터베이스 연결 테스트

**설명:** 백엔드에서 데이터베이스 접속이 정상적인지 테스트한다.

**완료 조건:**
- [x] `pg` Pool 연결 테스트 성공
- [x] 환경변수 (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) 설정
- [x] 연결 풀링 설정: `max=10`, `idleTimeoutMillis=30000`
- [x] 연결 타임아웃 설정: `connectionTimeoutMillis=2000`

**의존성:**
- [x] 선행 작업: DB-05
- [x] 후행 작업: BE-01

---

### DB-07. 스키마 문서화

**설명:** `database/schema.sql` 파일에 최종 스키마를 기록한다.

**완료 조건:**
- [x] `users` 테이블 DDL 기록
- [x] `todos` 테이블 DDL 기록
- [x] 인덱스 DDL 기록
- [x] 제약조건 주석 추가

**의존성:**
- [x] 선행 작업: DB-05

---

### DB-08. 백업 정책 설정

**설명:** 데이터베이스 자동 백업 정책을 수립한다.

**완료 조건:**
- [x] 일일 자동 백업 스크립트 작성
- [x] 백업 보관 기간: 7 일 설정
- [x] 백업 복구 테스트 1 회 수행

**의존성:**
- [x] 선행 작업: DB-06

---

## 4. 백엔드 작업 (Backend)

### 4.1 프로젝트 설정

#### BE-01. 백엔드 프로젝트 초기화

**설명:** Node.js + Express + TypeScript 백엔드 프로젝트를 설정한다.

**완료 조건:**
- [ ] `package.json` 생성 및 의존성 설치
- [ ] `tsconfig.json` 설정 (strict: true)
- [ ] `vite.config.ts` 또는 `ts-node` 설정
- [ ] `.eslintrc.cjs`, `.prettierrc` 설정
- [ ] `.env.example` 템플릿 생성

**의존성:**
- [x] 선행 작업: 없음
- [ ] 후행 작업: BE-02, BE-03

---

#### BE-02. 환경변수 설정

**설명:** 서버 구동에 필요한 환경변수를 정의하고 검증 로직을 구현한다.

**환경변수 목록:**
- `NODE_ENV`, `PORT`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `CORS_ORIGIN`
- `RATE_LIMIT_LOGIN_MAX`, `RATE_LIMIT_API_MAX`, `RATE_LIMIT_WINDOW_MS`
- `BCRYPT_SALT_ROUNDS`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_POOL_MAX`

**완료 조건:**
- [ ] `.env.development` 파일 작성
- [ ] `src/config/env.ts` 에서 필수 환경변수 검증 로직 구현
- [ ] 누락 시 서버 시작 차단 로직 구현
- [ ] JWT Secret 최소 32 자 길이 검증

**의존성:**
- [ ] 선행 작업: BE-01
- [ ] 후행 작업: BE-05, BE-06

---

#### BE-03. 디렉토리 구조 생성

**설명:** 프로젝트 구조 설계 원칙 (§6) 에 따라 디렉토리를 생성한다.

**완료 조건:**
- [ ] `src/config/`, `src/routes/`, `src/controllers/`, `src/services/`, `src/repositories/` 생성
- [ ] `src/middlewares/`, `src/validators/`, `src/errors/`, `src/constants/`, `src/types/` 생성
- [ ] `tests/unit/`, `tests/integration/` 생성
- [ ] 진입점 `src/index.ts`, `src/app.ts` 생성

**의존성:**
- [ ] 선행 작업: BE-01

---

### 4.2 공통 인프라

#### BE-04. 데이터베이스 연결 설정

**설명:** PostgreSQL 연결 Pool 을 설정한다.

**완료 조건:**
- [ ] `src/config/database.ts` 에 `Pool` 인스턴스 생성
- [ ] 환경변수로 Pool 설정 읽기
- [ ] 연결 테스트 코드 작성
- [ ] graceful shutdown 시 Pool 정리 로직 구현

**의존성:**
- [ ] 선행 작업: BE-03, DB-06

---

#### BE-05. JWT 인증 미들웨어 구현

**설명:** Access Token 검증을 위한 미들웨어를 구현한다.

**완료 조건:**
- [ ] `src/middlewares/authenticateToken.ts` 구현
- [ ] `Authorization: Bearer <token>` 헤더 파싱
- [ ] `jsonwebtoken.verify()` 로 토큰 검증
- [ ] 검증 성공 시 `req.user` 에 사용자 정보 주입
- [ ] 실패 시 401 Unauthorized 응답

**의존성:**
- [ ] 선행 작업: BE-02

---

#### BE-06. Rate Limiting 미들웨어 구현

**설명:** API 남용 방지를 위한 Rate Limiting 을 구현한다.

**완료 조건:**
- [ ] `src/middlewares/rateLimiter.ts` 구현
- [ ] 로그인 엔드포인트: 5 회/분 (IP 기준)
- [ ] 일반 API: 60 회/분 (IP 기준)
- [ ] 초과 시 429 Too Many Requests 응답
- [ ] `RateLimit-Reset` 헤더 포함

**의존성:**
- [ ] 선행 작업: BE-02

---

#### BE-07. 글로벌 에러 핸들러 구현

**설명:** 모든 에러를 표준화된 형식으로 처리하는 핸들러를 구현한다.

**에러 응답 형식:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "유효하지 않은 토큰입니다"
  }
}
```

**완료 조건:**
- [ ] `src/errors/AppError.ts` 기본 에러 클래스 정의
- [ ] `ValidationError`, `AuthError`, `ForbiddenError`, `NotFoundError` 도메인 에러 클래스 정의
- [ ] `src/middlewares/errorHandler.ts` 글로벌 핸들러 구현
- [ ] 프로덕션에서 스택 트레이스 숨김 처리

**의존성:**
- [ ] 선행 작업: BE-03

---

#### BE-08. 요청 로깅 미들웨어 구현

**설명:** 모든 HTTP 요청/응답을 로깅한다.

**완료 조건:**
- [ ] `src/middlewares/requestLogger.ts` 구현
- [ ] 메서드, 경로, 상태코드, 응답시간 기록
- [ ] `console.info()` 사용 (구조화 출력)
- [ ] 프로덕션에서 `console.log()` 억제

**의존성:**
- [ ] 선행 작업: BE-03

---

#### BE-09. 입력값 검증 미들웨어 구현

**설명:** 요청 body 스키마 검증을 위한 미들웨어를 구현한다.

**완료 조건:**
- [ ] `src/middlewares/validateBody.ts` 구현
- [ ] `zod` 또는 `joi` 기반 스키마 검증
- [ ] 검증 실패 시 400 Bad Request 응답
- [ ] 에러 메시지 상세화

**의존성:**
- [ ] 선행 작업: BE-03

---

### 4.3 인증 기능

#### BE-10. 회원가입 기능 구현 (UC-01)

**설명:** 이메일/비밀번호로 사용자 계정을 생성한다.

**API:** `POST /auth/signup`

**완료 조건:**
- [ ] `src/validators/authValidator.ts` 에 회원가입 스키마 정의
- [ ] 비밀번호 정책 검증: 8-64 자, 대소문자, 숫자, 특수문자 포함
- [ ] `src/services/authService.ts` 에 회원가입 로직 구현
- [ ] 이메일 중복 확인 (409 Conflict)
- [ ] 비밀번호 bcrypt 암호화 (salt rounds: 10)
- [ ] `src/repositories/userRepository.ts` 에 `insertUser` 구현
- [ ] 응답: `{ success: true, userId: "UUID" }` (HTTP 201)

**의존성:**
- [ ] 선행 작업: BE-07, BE-09, DB-03

---

#### BE-11. 로그인 기능 구현 (UC-02)

**설명:** 이메일/비밀번호 인증 후 JWT 토큰을 발급한다.

**API:** `POST /auth/login`

**완료 조건:**
- [ ] 로그인 스키마 정의 (이메일, 비밀번호)
- [ ] `authService.login()` 구현
- [ ] 사용자 조회 및 비밀번호 검증
- [ ] Access Token 발급 (HS256, 15 분 유효)
- [ ] Refresh Token 발급 (HS256, 7 일 유효, httpOnly 쿠키)
- [ ] 응답: `{ success: true, accessToken, refreshToken, user }` (HTTP 200)
- [ ] 실패 시 401 Unauthorized

**의존성:**
- [ ] 선행 작업: BE-05, BE-10, DB-03

---

#### BE-12. 토큰 갱신 기능 구현

**설명:** Refresh Token 으로 새 Access Token 을 발급한다.

**API:** `POST /auth/refresh`

**완료 조건:**
- [ ] Refresh Token 검증 (쿠키 또는 body)
- [ ] 만료 여부 확인
- [ ] 새 Access Token 발급 (15 분)
- [ ] 응답: `{ success: true, accessToken }` (HTTP 200)
- [ ] Refresh Token 만료 시 401 응답

**의존성:**
- [ ] 선행 작업: BE-05, BE-11

---

### 4.4 할일 관리 기능

#### BE-13. 할일 상태 계산 서비스 구현

**설명:** 5 가지 할일 상태를 런타임으로 계산한다.

**상태 정의:**
- `NOT_STARTED`: 오늘 < 시작일, 미완료
- `IN_PROGRESS`: 시작일 ≤ 오늘 ≤ 종료일, 미완료
- `OVERDUE`: 오늘 > 종료일, 미완료
- `COMPLETED_SUCCESS`: 완료=true, 성공=true
- `COMPLETED_FAILURE`: 완료=true, 성공=false

**완료 조건:**
- [ ] `src/services/todoStatusService.ts` 에 `calculateTodoStatus()` 구현
- [ ] 날짜 비교는 KST(UTC+9) 기준
- [ ] 5 가지 상태 모두 단위 테스트 작성
- [ ] 테스트 커버리지 100%

**의존성:**
- [ ] 선행 작업: BE-03

---

#### BE-14. 할일 생성 기능 구현 (UC-03)

**설명:** 새로운 할일을 생성한다.

**API:** `POST /todos` (인증 필요)

**완료 조건:**
- [ ] `src/validators/todoValidator.ts` 에 생성 스키마 정의
- [ ] title: 1-100 자, description: 0-1000 자
- [ ] `due_date >= start_date` 검증
- [ ] `todoService.createTodo()` 구현
- [ ] `todoRepository.insertTodo()` 구현
- [ ] 응답에 `status` 필드 포함 (런타임 계산)
- [ ] 응답: `{ success: true, todo }` (HTTP 201)

**의존성:**
- [ ] 선행 작업: BE-05, BE-13, DB-04

---

#### BE-15. 할일 목록 조회 기능 구현 (UC-04)

**설명:** 필터링 및 정렬 조건으로 할일 목록을 조회한다.

**API:** `GET /todos?status=&sort_by=&sort_order=&page=&limit=` (인증 필요)

**완료 조건:**
- [ ] 쿼리 파라미터 검증
- [ ] `WHERE user_id = $userId` 소유권 필터 필수 적용
- [ ] `status` 필터: 런타임 계산된 상태 기반
- [ ] 정렬: `start_date` 또는 `due_date`, asc/desc
- [ ] 페이지네이션: `LIMIT/OFFSET` 적용
- [ ] 응답: `{ success: true, todos, total, page, limit }` (HTTP 200)

**의존성:**
- [ ] 선행 작업: BE-05, BE-13, BE-14

---

#### BE-16. 할일 상세 조회 기능 구현

**설명:** 단일 할일 상세 정보를 조회한다.

**API:** `GET /todos/:id` (인증 필요)

**완료 조건:**
- [ ] `todoRepository.findById()` 구현
- [ ] 소유권 검증 (`WHERE id = $id AND user_id = $userId`)
- [ ] 없음: 404 Not Found
- [ ] 권한 없음: 403 Forbidden
- [ ] 응답에 `status` 필드 포함

**의존성:**
- [ ] 선행 작업: BE-05, BE-13, BE-14

---

#### BE-17. 할일 수정 기능 구현 (UC-05)

**설명:** 할일 정보를 수정한다.

**API:** `PUT /todos/:id` (인증 필요)

**완료 조건:**
- [ ] 수정 입력값 검증 (title, description, start_date, due_date)
- [ ] 소유권 검증
- [ ] `due_date >= start_date` 재검증 (변경 시)
- [ ] `todoRepository.updateTodoById()` 구현
- [ ] `updated_at` 자동 갱신
- [ ] 응답에 `status` 필드 포함 (재산출)
- [ ] 응답: `{ success: true, todo }` (HTTP 200)

**의존성:**
- [ ] 선행 작업: BE-05, BE-13, BE-14

---

#### BE-18. 할일 완료 처리 기능 구현 (UC-06)

**설명:** 할일을 완료 상태로 전환하고 성공/실패를 기록한다.

**API:** `POST /todos/:id/complete` (인증 필요)

**완료 조건:**
- [ ] 입력값: `is_success` (boolean, 필수)
- [ ] 소유권 검증
- [ ] 이미 완료된 할일 재완료 차단 (409 Conflict)
- [ ] OVERDUE 상태 할일도 완료 처리 가능 (BR-09)
- [ ] `is_completed=true`, `is_success` 설정
- [ ] `status` 자동 계산 (COMPLETED_SUCCESS 또는 COMPLETED_FAILURE)
- [ ] 응답: `{ success: true, todo }` (HTTP 200)

**의존성:**
- [ ] 선행 작업: BE-05, BE-13, BE-14

---

#### BE-19. 할일 삭제 기능 구현 (UC-07)

**설명:** 할일을 삭제한다.

**API:** `DELETE /todos/:id` (인증 필요)

**완료 조건:**
- [ ] 소유권 검증
- [ ] `todoRepository.deleteById()` 구현
- [ ] 소프트 삭제 또는 물리 삭제 결정 (PRD 에 따름)
- [ ] 응답: `{ success: true, message, todoId }` (HTTP 204)
- [ ] 권한 없음: 403 Forbidden

**의존성:**
- [ ] 선행 작업: BE-05, BE-14

---

### 4.5 라우터 및 통합

#### BE-20. 인증 라우터 통합

**설명:** 인증 관련 엔드포인트를 라우터로 통합한다.

**완료 조건:**
- [ ] `src/routes/authRouter.ts` 생성
- [ ] `POST /auth/signup` 매핑
- [ ] `POST /auth/login` 매핑
- [ ] `POST /auth/refresh` 매핑
- [ ] Rate Limiting 미들웨어 적용 (로그인 5 회/분)

**의존성:**
- [ ] 선행 작업: BE-10, BE-11, BE-12

---

#### BE-21. 할일 라우터 통합

**설명:** 할일 관련 엔드포인트를 라우터로 통합한다.

**완료 조건:**
- [ ] `src/routes/todoRouter.ts` 생성
- [ ] `POST /todos` 매핑 (인증 필요)
- [ ] `GET /todos` 매핑 (인증 필요)
- [ ] `GET /todos/:id` 매핑 (인증 필요)
- [ ] `PUT /todos/:id` 매핑 (인증 필요)
- [ ] `POST /todos/:id/complete` 매핑 (인증 필요)
- [ ] `DELETE /todos/:id` 매핑 (인증 필요)
- [ ] `authenticateToken` 미들웨어 적용

**의존성:**
- [ ] 선행 작업: BE-14, BE-15, BE-16, BE-17, BE-18, BE-19

---

#### BE-22. Express 앱 통합

**설명:** 모든 라우터와 미들웨어를 Express 앱에 등록한다.

**완료 조건:**
- [ ] `src/app.ts` 에 Express 앱 생성
- [ ] CORS 설정 (`CORS_ORIGIN` 환경변수 기반)
- [ ] `requestLogger`, `errorHandler` 미들웨어 등록
- [ ] `/auth/*`, `/todos/*` 라우터 등록
- [ ] 404 핸들러 등록

**의존성:**
- [ ] 선행 작업: BE-20, BE-21

---

#### BE-23. 백엔드 통합 테스트

**설명:** 인증 흐름과 할일 CRUD 전 주기를 테스트한다.

**완료 조건:**
- [ ] `tests/integration/auth.test.ts` 작성
- [ ] 회원가입 → 로그인 → 토큰 갱신 흐름 테스트
- [ ] `tests/integration/todos.test.ts` 작성
- [ ] 할일 CRUD + 완료처리 전체 흐름 테스트
- [ ] 타인 할일 접근 차단 (403) 테스트
- [ ] SQL Injection 방어 확인 (parameterized query)

**의존성:**
- [ ] 선행 작업: BE-22

---

#### BE-24. 백엔드 API 문서화

**설명:** API 명세를 문서화한다.

**완료 조건:**
- [ ] 엔드포인트 목록 정리 (메서드, 경로, 설명, 인증 필요 여부)
- [ ] 요청/응답 스키마 정의
- [ ] 에러 코드 목록 정리
- [ ] `docs/` 디렉토리에 API 명세 추가 (선택)

**의존성:**
- [ ] 선행 작업: BE-22

---

## 5. 프론트엔드 작업 (Frontend)

### 5.1 프로젝트 설정

#### FE-01. 프론트엔드 프로젝트 초기화

**설명:** React 19 + TypeScript + Vite 프로젝트를 설정한다.

**완료 조건:**
- [ ] `npm create vite@latest` 로 프로젝트 생성
- [ ] `package.json` 의존성 설치: React, TypeScript, Zustand, TanStack Query, Axios
- [ ] `tsconfig.json` 설정 (strict: true, `any` 금지)
- [ ] `.eslintrc.cjs`, `.prettierrc` 설정
- [ ] `.env.example` 템플릿 생성

**의존성:**
- [x] 선행 작업: 없음
- [ ] 후행 작업: FE-02, FE-03

---

#### FE-02. 환경변수 설정

**설명:** 클라이언트 환경변수를 정의한다.

**환경변수 목록:**
- `VITE_API_BASE_URL`: 백엔드 API 서버 URL
- `VITE_APP_ENV`: `development` / `production`

**완료 조건:**
- [ ] `.env.development` 파일 작성
- [ ] `VITE_` 접두사 확인 (Vite 요구사항)
- [ ] 환경별 API URL 설정

**의존성:**
- [ ] 선행 작업: FE-01

---

#### FE-03. 디렉토리 구조 생성

**설명:** 프로젝트 구조 설계 원칙 (§6) 에 따라 디렉토리를 생성한다.

**완료 조건:**
- [ ] `src/api/`, `src/features/`, `src/pages/`, `src/shared/` 생성
- [ ] `src/constants/`, `src/types/` 생성
- [ ] `src/features/auth/`, `src/features/todos/` 기능 모듈 생성
- [ ] 진입점 `src/main.tsx`, `src/App.tsx` 생성

**의존성:**
- [ ] 선행 작업: FE-01

---

### 5.2 공통 인프라

#### FE-04. Axios 인스턴스 설정

**설명:** 서버 API 통신을 위한 Axios 인스턴스를 설정한다.

**완료 조건:**
- [ ] `src/api/axiosInstance.ts` 생성
- [ ] `baseURL` 환경변수로 설정
- [ ] 요청 인터셉터: `Authorization` 헤더 자동 첨부
- [ ] 응답 인터셉터: 401 감지 시 토큰 갱신 또는 재로그인
- [ ] 에러 핸들링 표준화

**의존성:**
- [ ] 선행 작업: FE-03

---

#### FE-05. 타입 정의

**설명:** TypeScript 타입을 정의한다.

**완료 조건:**
- [ ] `src/types/auth.ts`: `User`, `LoginRequest`, `SignupRequest`, `TokenResponse`
- [ ] `src/types/todo.ts`: `Todo`, `TodoStatus`, `CreateTodoInput`, `UpdateTodoInput`
- [ ] `src/types/api.ts`: `ApiResponse<T>` 공통 응답 타입
- [ ] `src/constants/todoStatus.ts`: `TodoStatus` enum 상수 정의

**의존성:**
- [ ] 선행 작업: FE-03

---

#### FE-06. 공통 컴포넌트 구현

**설명:** 재사용 가능한 UI 컴포넌트를 구현한다.

**완료 조건:**
- [ ] `src/shared/components/Button.tsx`: 공통 버튼
- [ ] `src/shared/components/Input.tsx`: 공통 입력 필드
- [ ] `src/shared/components/Modal.tsx`: 공통 모달 레이아웃
- [ ] `src/shared/components/Spinner.tsx`: 로딩 스피너
- [ ] `src/shared/components/ErrorMessage.tsx`: 에러 메시지 표시
- [ ] `src/shared/components/ProtectedRoute.tsx`: 인증 필요 라우트 가드

**의존성:**
- [ ] 선행 작업: FE-03

---

#### FE-07. 공통 유틸리티 구현

**설명:** 날짜 포맷, 상태 레이블 변환 유틸을 구현한다.

**완료 조건:**
- [ ] `src/shared/utils/formatDate.ts`: `YYYY-MM-DD` 포맷팅
- [ ] `src/shared/utils/todoStatusLabel.ts`: `TodoStatus` → 한국어 레이블 매핑
- [ ] `src/shared/hooks/useDebounce.ts`: 입력값 디바운스 훅

**의존성:**
- [ ] 선행 작업: FE-03

---

### 5.3 인증 기능

#### FE-08. 인증 API 함수 구현

**설명:** 인증 관련 API 호출 함수를 구현한다.

**완료 조건:**
- [ ] `src/api/authApi.ts` 생성
- [ ] `signup()`: `POST /auth/signup`
- [ ] `login()`: `POST /auth/login`
- [ ] `refreshToken()`: `POST /auth/refresh`
- [ ] 반환 타입 정의

**의존성:**
- [ ] 선행 작업: FE-04, FE-05

---

#### FE-09. 인증 Zustand 스토어 구현

**설명:** 클라이언트 인증 상태를 관리한다.

**완료 조건:**
- [ ] `src/features/auth/stores/useAuthStore.ts` 생성
- [ ] 상태: `accessToken`, `user`, `isAuthenticated`
- [ ] 액션: `setAuth()`, `clearAuth()`
- [ ] localStorage 또는 메모리 저장 결정

**의존성:**
- [ ] 선행 작업: FE-08

---

#### FE-10. 로그인 폼 구현 (UC-02)

**설명:** 로그인 UI 를 구현한다.

**완료 조건:**
- [ ] `src/features/auth/components/LoginForm.tsx` 생성
- [ ] 이메일, 비밀번호 입력 필드
- [ ] 입력값 유효성 검증 (UI 레벨)
- [ ] `useLogin()` 훅에서 TanStack Query `useMutation` 사용
- [ ] 성공 시 `/`(메인) 으로 리다이렉트
- [ ] 실패 시 에러 메시지 표시

**의존성:**
- [ ] 선행 작업: FE-08, FE-09

---

#### FE-11. 회원가입 폼 구현 (UC-01)

**설명:** 회원가입 UI 를 구현한다.

**완료 조건:**
- [ ] `src/features/auth/components/SignupForm.tsx` 생성
- [ ] 이름, 이메일, 비밀번호 입력 필드
- [ ] 비밀번호 정책 안내 UI
- [ ] 실시간 유효성 검증
- [ ] `useSignup()` 훅 구현
- [ ] 성공 시 로그인 페이지로 리다이렉트

**의존성:**
- [ ] 선행 작업: FE-08, FE-09

---

### 5.4 할일 관리 기능

#### FE-12. 할일 API 함수 구현

**설명:** 할일 CRUD API 호출 함수를 구현한다.

**완료 조건:**
- [ ] `src/api/todoApi.ts` 생성
- [ ] `getTodos()`: `GET /todos` (쿼리 파라미터 지원)
- [ ] `getTodoById()`: `GET /todos/:id`
- [ ] `createTodo()`: `POST /todos`
- [ ] `updateTodo()`: `PUT /todos/:id`
- [ ] `completeTodo()`: `POST /todos/:id/complete`
- [ ] `deleteTodo()`: `DELETE /todos/:id`

**의존성:**
- [ ] 선행 작업: FE-04, FE-05

---

#### FE-13. 할일 목록 TanStack Query 훅 구현

**설명:** 서버 상태 (할일 목록) 를 관리한다.

**완료 조건:**
- [ ] `src/features/todos/hooks/useTodos.ts` 생성
- [ ] `useQuery` 사용 (queryKey: `['todos', filters]`)
- [ ] 필터: `status`, `sort_by`, `sort_order`, `page`, `limit`
- [ ] `staleTime`, `cacheTime` 설정
- [ ] 로딩, 에러, 성공 상태 처리

**의존성:**
- [ ] 선행 작업: FE-12

---

#### FE-14. 할일 뮤테이션 훅 구현

**설명:** 할일 CRUD 뮤테이션을 관리한다.

**완료 조건:**
- [ ] `src/features/todos/hooks/useCreateTodo.ts`: `useMutation`
- [ ] `src/features/todos/hooks/useUpdateTodo.ts`: `useMutation`
- [ ] `src/features/todos/hooks/useCompleteTodo.ts`: `useMutation`
- [ ] `src/features/todos/hooks/useDeleteTodo.ts`: `useMutation`
- [ ] 성공 시 목록 자동 재검증 (`invalidateQueries`)

**의존성:**
- [ ] 선행 작업: FE-12, FE-13

---

#### FE-15. 할일 필터 Zustand 스토어 구현

**설명:** 필터, 정렬, 페이지 UI 상태를 관리한다.

**완료 조건:**
- [ ] `src/features/todos/stores/useTodoFilterStore.ts` 생성
- [ ] 상태: `status`, `sortBy`, `sortOrder`, `page`, `limit`
- [ ] 액션: 각 필터 변경 함수
- [ ] 초기값: `status=전체`, `sortBy=due_date`, `sortOrder=asc`, `page=1`, `limit=10`

**의존성:**
- [ ] 선행 작업: FE-12

---

#### FE-16. 할일 목록 페이지 구현 (UC-04)

**설명:** 할일 목록을 표시하는 메인 페이지를 구현한다.

**완료 조건:**
- [ ] `src/pages/TodosPage.tsx` 생성
- [ ] `useTodos()` 훅으로 데이터 조회
- [ ] `TodoList`, `TodoCard` 컴포넌트 렌더링
- [ ] 로딩 중: `Spinner` 표시
- [ ] 에러 시: `ErrorMessage` 표시
- [ ] 빈 목록: 안내 메시지 표시
- [ ] 페이지네이션 UI 구현

**의존성:**
- [ ] 선행 작업: FE-13, FE-16, FE-17

---

#### FE-17. 할일 카드 컴포넌트 구현

**설명:** 개별 할일 항목을 표시하는 카드를 구현한다.

**완료 조건:**
- [ ] `src/features/todos/components/TodoCard.tsx` 생성
- [ ] 제목, 설명, 시작일, 종료일 표시
- [ ] `status` 배지 표시 (색상 구분)
- [ ] 수정, 삭제, 완료 처리 버튼
- [ ] 반응형 디자인 (모바일/데스크탑)

**의존성:**
- [ ] 선행 작업: FE-06, FE-07

---

#### FE-18. 할일 필터 바 컴포넌트 구현

**설명:** 상태 필터 및 정렬 선택 UI 를 구현한다.

**완료 조건:**
- [ ] `src/features/todos/components/TodoFilterBar.tsx` 생성
- [ ] 상태 필터: 전체, NOT_STARTED, IN_PROGRESS, OVERDUE, COMPLETED_SUCCESS, COMPLETED_FAILURE
- [ ] 정렬 선택: 시작일/종료일, 오름차순/내림차순
- [ ] `useTodoFilterStore` 와 연동
- [ ] 변경 시 목록 자동 재조회

**의존성:**
- [ ] 선행 작업: FE-15

---

#### FE-19. 할일 생성 폼 구현 (UC-03)

**설명:** 할일 생성 모달/폼을 구현한다.

**완료 조건:**
- [ ] `src/features/todos/components/TodoCreateForm.tsx` 생성
- [ ] 제목, 설명, 시작일, 종료일 입력 필드
- [ ] 날짜 피커 또는 날짜 입력 UI
- [ ] `due_date >= start_date` 유효성 검증
- [ ] `useCreateTodo()` 훅으로 제출
- [ ] 성공 시 모달 닫기 및 목록 재조회

**의존성:**
- [ ] 선행 작업: FE-14

---

#### FE-20. 할일 수정 폼 구현 (UC-05)

**설명:** 할일 수정 모달/폼을 구현한다.

**완료 조건:**
- [ ] `src/features/todos/components/TodoEditForm.tsx` 생성
- [ ] 기존 값 자동 입력
- [ ] 제목, 설명, 시작일, 종료일 수정 가능
- [ ] `useUpdateTodo()` 훅으로 제출
- [ ] 성공 시 모달 닫기 및 목록 재조회

**의존성:**
- [ ] 선행 작업: FE-14, FE-17

---

#### FE-21. 할일 완료 처리 모달 구현 (UC-06)

**설명:** 완료 처리 시 성공/실패 선택 UI 를 구현한다.

**완료 조건:**
- [ ] `src/features/todos/components/TodoCompleteModal.tsx` 생성
- [ ] "성공적으로 완료" / "완료하지 못함" 선택 버튼
- [ ] `useCompleteTodo()` 훅으로 제출
- [ ] OVERDUE 상태 할일도 처리 가능 UI
- [ ] 이미 완료된 할일은 버튼 비활성화

**의존성:**
- [ ] 선행 작업: FE-14, FE-17

---

### 5.5 페이지 및 라우팅

#### FE-22. 페이지 컴포넌트 및 라우팅 설정

**설명:** 라우트별 페이지를 설정한다.

**완료 조건:**
- [ ] `src/pages/LoginPage.tsx`: `/login` 라우트
- [ ] `src/pages/SignupPage.tsx`: `/signup` 라우트
- [ ] `src/pages/TodosPage.tsx`: `/` (메인, 인증 필요)
- [ ] `react-router-dom` 또는 Vite 기반 라우팅 설정
- [ ] `ProtectedRoute` 로 인증 필요 페이지 보호

**의존성:**
- [ ] 선행 작업: FE-10, FE-11, FE-16

---

#### FE-23. 프론트엔드 통합 테스트

**설명:** 주요 사용자 시나리오를 테스트한다.

**완료 조건:**
- [ ] React Testing Library 설정
- [ ] 로그인 폼 테스트: 입력, 제출, 에러 처리
- [ ] 할일 생성 폼 테스트: 유효성 검증, 제출
- [ ] 완료 처리 테스트: 성공/실패 선택
- [ ] 컴포넌트 렌더링 스냅샷 테스트 (선택)

**의존성:**
- [ ] 선행 작업: FE-22

---

## 6. 종합 요약

### 6.1 작업 카운트

| 레이어 | 작업 수 | 완료 조건 항목 | 평균 의존성 |
|--------|--------|---------------|------------|
| **데이터베이스** | 8 개 | 32 개 | 1.5 개 |
| **백엔드** | 24 개 | 134 개 | 2.8 개 |
| **프론트엔드** | 23 개 | 115 개 | 2.1 개 |
| **총계** | **55 개** | **281 개** | **2.1 개** |

---

### 6.2 критический 경로 (Critical Path)

다음 작업들은 전체 프로젝트 일정에 직접적인 영향을 미치는 중요 경로입니다:

```
DB-01 → DB-02 → DB-03 → DB-04 → DB-05 → DB-06
                                      ↓
BE-01 → BE-03 → BE-04 → BE-07 → BE-13 → BE-14 → BE-15
                                              ↓
FE-01 → FE-03 → FE-04 → FE-05 → FE-12 → FE-13 → FE-16 → FE-22
```

**최단 개발 경로:**
1. 데이터베이스 스키마 확정 (DB-01~06)
2. 백엔드 핵심 인프라 (BE-01~09)
3. 할일 생성/조회 API (BE-13~15)
4. 프론트엔드 API 연동 (FE-04~05, FE-12~13)
5. 메인 페이지 구현 (FE-16)
6. 나머지 기능 병렬 개발

---

### 6.3 의존성 매트릭스

| 대상 | 의존하는 레이어 | 주요 의존 작업 |
|------|----------------|---------------|
| **백엔드** | 데이터베이스 | DB-03(users), DB-04(todos), DB-06(연결 테스트) |
| **프론트엔드** | 백엔드 API | BE-10(회원가입), BE-11(로그인), BE-14(할일 생성), BE-15(목록 조회) |
| **통합 테스트** | 백엔드 + 프론트엔드 | BE-23(백엔드 통합), FE-23(프론트 테스트) |

---

### 6.4 위험 요소 및 대응 방안

| 위험 | 영향도 | 발생 확률 | 대응 방안 |
|------|-------|----------|----------|
| JWT 토큰 갱신 로직 복잡 | 중 | 중 | BE-12, FE-04 에서 철저한 에러 처리 |
| 할일 상태 계산 버그 | 상 | 중 | BE-13 단위 테스트 100% 커버리지 |
| CORS 설정 오류 | 중 | 하 | BE-22 에서 환경변수 기반 화이트리스트 |
| 날짜 타임존 불일치 | 상 | 중 | 서버 KST 기준 명시, 프론트 변환 로직 검증 |
| 비밀번호 정책 미준수 | 상 | 하 | BE-10 정규식 검증 + FE-11 실시간 안내 |

---

## 7. 변경 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v1.0 | 2026-04-01 | Yongwoo | 최초 작성: 55 개 작업 분해, 완료 조건 281 개 항목, 의존성 매핑 |

---

**문서 승인자:** (예정)
**다음 단계:** 작업 할당 및 개발 착수
