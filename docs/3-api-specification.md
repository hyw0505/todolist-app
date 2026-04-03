# API 명세서 (API Specification)

**프로젝트명:** todolist-app  
**버전:** v1.0  
**작성일:** 2026-04-01  
**작성자:** Yongwoo

---

## 1. 개요

### 1.1 베이스 URL

| 환경 | URL |
|------|-----|
| **개발** | `http://localhost:3000/api/v1` |
| **프로덕션** | `https://api.example.com/api/v1` |

### 1.2 인증 방식

- **Access Token**: `Authorization: Bearer <token>` 헤더 (유효기간 15 분)
- **Refresh Token**: HTTP-only 쿠키 자동 전송 (유효기간 7 일)

### 1.3 공통 요청 헤더

| 헤더 | 필수 | 설명 |
|------|:----:|------|
| `Authorization` | 인증 필요 엔드포인트 | `Bearer <accessToken>` |
| `Content-Type` | 본문 있는 요청 | `application/json` |
| `Accept-Language` | 선택 | 응답 메시지 언어 (`ko`, `en`, `jp`). 미설정 시 사용자 프로필 언어 → 기본값 `ko` 순으로 적용 |

### 1.3 공통 응답 형식

**성공 응답:**
```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { "field": ["에러 상세"] }
  }
}
```

---

## 2. 인증 API (Auth)

### 2.1 회원가입 (Signup)

**엔드포인트:** `POST /api/v1/auth/signup`

**인증:** 불필요

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "language": "ko"
}
```

> `language`: 선택 필드. `ko`(한국어), `en`(영어), `jp`(일본어) 중 하나. 미입력 시 `Accept-Language` 헤더 → 기본값 `ko` 순으로 적용.

**응답 (201 Created):**
```json
{
  "success": true,
  "message": "회원가입 완료",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `CONFLICT_ERROR` | 409 | 중복 이메일 |

---

### 2.2 로그인 (Login)

**엔드포인트:** `POST /api/v1/auth/login`

**인증:** 불필요

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**응답 (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "language": "ko"
  }
}
```

**헤더:**
```
Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `AUTH_ERROR` | 401 | 이메일 미존재 또는 비밀번호 불일치 |

**Rate Limiting:**
- 5 회/분 (IP 기준)

---

### 2.3 토큰 갱신 (Refresh Token)

**엔드포인트:** `POST /api/v1/auth/refresh`

**인증:** 불필요 (Refresh Token 은 쿠키로 자동 전송)

**요청:**
```
POST /api/v1/auth/refresh
Cookie: refreshToken=eyJ...
```

**응답 (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `AUTH_ERROR` | 401 | Refresh Token 만료 또는 유효하지 않음 |

---

### 2.4 로그아웃 (Logout)

**엔드포인트:** `POST /api/v1/auth/logout`

**인증:** 불필요

**요청:**
```
POST /api/v1/auth/logout
Cookie: refreshToken=eyJ...
```

**응답 (200 OK):**
```json
{
  "success": true,
  "message": "로그아웃 완료"
}
```

---

## 3. 할일 API (Todos)

### 3.1 할일 생성 (Create Todo)

**엔드포인트:** `POST /api/v1/todos`

**인증:** 필수 (Access Token)

**요청 본문:**
```json
{
  "title": "수학 수행평가 제출",
  "description": "교과서 5~7 단원 문제 풀이 포함",
  "start_date": "2026-04-01",
  "due_date": "2026-04-07"
}
```

**응답 (201 Created):**
```json
{
  "success": true,
  "todo": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "수학 수행평가 제출",
    "description": "교과서 5~7 단원 문제 풀이 포함",
    "start_date": "2026-04-01",
    "due_date": "2026-04-07",
    "is_completed": false,
    "is_success": null,
    "status": "IN_PROGRESS",
    "created_at": "2026-04-01T09:00:00.000Z",
    "updated_at": "2026-04-01T09:00:00.000Z"
  }
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 (제목 누락, 날짜 형식 오류 등) |
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |

---

### 3.2 할일 목록 조회 (Get Todos)

**엔드포인트:** `GET /api/v1/todos`

**인증:** 필수 (Access Token)

**쿼리 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `status` | string | - | 할일 상태 필터 (생략 시 전체) |
| `sort_by` | string | `due_date` | 정렬 기준 (`start_date`, `due_date`) |
| `sort_order` | string | `asc` | 정렬 방향 (`asc`, `desc`) |
| `page` | integer | `1` | 페이지 번호 (1 이상) |
| `limit` | integer | `10` | 페이지당 항목 수 (1~100) |

**상태 값:**
- `NOT_STARTED`: 시작 전
- `IN_PROGRESS`: 진행 중
- `OVERDUE`: 마감 초과
- `COMPLETED_SUCCESS`: 완료 (성공)
- `COMPLETED_FAILURE`: 완료 (실패)

**요청 예시:**
```
GET /api/v1/todos?status=IN_PROGRESS&sort_by=due_date&sort_order=desc&page=1&limit=10
```

**응답 (200 OK):**
```json
{
  "success": true,
  "todos": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "수학 수행평가 제출",
      "description": "교과서 5~7 단원 문제 풀이 포함",
      "start_date": "2026-04-01",
      "due_date": "2026-04-07",
      "is_completed": false,
      "is_success": null,
      "status": "IN_PROGRESS",
      "created_at": "2026-04-01T09:00:00.000Z",
      "updated_at": "2026-04-01T09:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 쿼리 파라미터 검증 실패 |
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |

---

### 3.3 할일 상세 조회 (Get Todo by ID)

**엔드포인트:** `GET /api/v1/todos/:id`

**인증:** 필수 (Access Token)

**응답 (200 OK):**
```json
{
  "success": true,
  "todo": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "수학 수행평가 제출",
    "description": "교과서 5~7 단원 문제 풀이 포함",
    "start_date": "2026-04-01",
    "due_date": "2026-04-07",
    "is_completed": false,
    "is_success": null,
    "status": "IN_PROGRESS",
    "created_at": "2026-04-01T09:00:00.000Z",
    "updated_at": "2026-04-01T09:00:00.000Z"
  }
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |
| `FORBIDDEN_ERROR` | 403 | 타인 할일 접근 |
| `NOT_FOUND_ERROR` | 404 | 할일이 존재하지 않음 |

---

### 3.4 할일 수정 (Update Todo)

**엔드포인트:** `PATCH /api/v1/todos/:id`

**인증:** 필수 (Access Token)

**요청 본문 (모든 필드 선택):**
```json
{
  "title": "수학 수행평가 제출 (수정)",
  "description": "교과서 5~7 단원 문제 풀이 포함",
  "start_date": "2026-04-02",
  "due_date": "2026-04-08"
}
```

**응답 (200 OK):**
```json
{
  "success": true,
  "todo": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "수학 수행평가 제출 (수정)",
    "description": "교과서 5~7 단원 문제 풀이 포함",
    "start_date": "2026-04-02",
    "due_date": "2026-04-08",
    "is_completed": false,
    "is_success": null,
    "status": "IN_PROGRESS",
    "created_at": "2026-04-01T09:00:00.000Z",
    "updated_at": "2026-04-01T10:30:00.000Z"
  }
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |
| `FORBIDDEN_ERROR` | 403 | 타인 할일 수정 시도 |
| `NOT_FOUND_ERROR` | 404 | 할일이 존재하지 않음 |

---

### 3.5 할일 완료 처리 (Complete Todo)

**엔드포인트:** `POST /api/v1/todos/:id/complete`

**인증:** 필수 (Access Token)

**요청 본문:**
```json
{
  "is_success": true
}
```

**응답 (200 OK):**
```json
{
  "success": true,
  "todo": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "수학 수행평가 제출",
    "is_completed": true,
    "is_success": true,
    "status": "COMPLETED_SUCCESS",
    "updated_at": "2026-04-01T18:00:00.000Z"
  }
}
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | `is_success` 필드 누락 또는 유효하지 않은 값 |
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |
| `FORBIDDEN_ERROR` | 403 | 타인 할일 완료 처리 시도 |
| `NOT_FOUND_ERROR` | 404 | 할일이 존재하지 않음 |
| `CONFLICT_ERROR` | 409 | 이미 완료된 할일 |

---

### 3.6 할일 삭제 (Delete Todo)

**엔드포인트:** `DELETE /api/v1/todos/:id`

**인증:** 필수 (Access Token)

**응답 (204 No Content):**
```
응답 본문 없음
```

**에러 코드:**
| 코드 | 상태 | 설명 |
|------|------|------|
| `AUTH_ERROR` | 401 | 인증되지 않은 요청 |
| `FORBIDDEN_ERROR` | 403 | 타인 할일 삭제 시도 |
| `NOT_FOUND_ERROR` | 404 | 할일이 존재하지 않음 |

---

## 4. 에러 코드 목록

### 4.1 공통 에러

| 코드 | 상태 | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `AUTH_ERROR` | 401 | 인증 오류 (토큰 만료, 유효하지 않음) |
| `FORBIDDEN_ERROR` | 403 | 권한 없음 (타인 리소스 접근) |
| `NOT_FOUND_ERROR` | 404 | 리소스를 찾을 수 없음 |
| `CONFLICT_ERROR` | 409 | 충돌 (중복 이메일, 이미 완료된 할일) |
| `RATE_LIMIT_ERROR` | 429 | 요청 제한 초과 |
| `DATABASE_ERROR` | 500 | 데이터베이스 오류 |
| `UNKNOWN_ERROR` | 500 | 알 수 없는 오류 |

---

## 5. 할일 상태 (Status) 계산 규칙

서버에서 현재 시간 (KST 기준) 을 사용하여 런타임 계산:

| 상태 | 조건 |
|------|------|
| `NOT_STARTED` | `is_completed=false` AND `오늘 < start_date` |
| `IN_PROGRESS` | `is_completed=false` AND `start_date ≤ 오늘 ≤ due_date` |
| `OVERDUE` | `is_completed=false` AND `오늘 > due_date` |
| `COMPLETED_SUCCESS` | `is_completed=true` AND `is_success=true` |
| `COMPLETED_FAILURE` | `is_completed=true` AND `is_success=false` |

---

## 6. 검증 규칙

### 6.1 비밀번호 정책

- **최소 길이:** 8 자
- **최대 길이:** 64 자
- **필수 포함:** 대문자 (A-Z), 소문자 (a-z), 숫자 (0-9), 특수문자 (`!@#$%^&*()_+-={}`)
- **공백:** 사용 불가

### 6.2 할일 제목

- **최소 길이:** 1 자
- **최대 길이:** 100 자
- **필수:** 입력 필수

### 6.3 할일 설명

- **최대 길이:** 1000 자
- **선택:** 입력 선택 (null 허용)

### 6.4 날짜 형식

- **형식:** `YYYY-MM-DD` (예: `2026-04-01`)
- **제약:** `due_date >= start_date`

---

## 7. 변경 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v1.0 | 2026-04-01 | Yongwoo | 초기 작성: 인증 (BE-10~12), 할일 CRUD (BE-14~19) API 명세 |
| v1.1 | 2026-04-02 | Yongwoo | **다국어 지원 추가**: §1.3 공통 요청 헤더(`Accept-Language`) 신설, §2.1 회원가입 `language` 필드 추가, §2.2 로그인 응답 `user.language` 포함 |

---

**문의:** tech@example.com
