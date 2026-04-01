# 기술 아키텍처 다이어그램

**프로젝트명:** todolist-app
**문서 버전:** v0.1
**작성일:** 2026-04-01
**작성자:** Yongwoo

---

## 1. 전체 시스템 구조 (3-Tier)

```mermaid
graph TD
    Client["브라우저\n(모바일 / 데스크탑)"]

    subgraph FE["Tier 1 · 프론트엔드"]
        Pages["Pages"]
        Features["Features\nauth / todos"]
        API["API Layer\nAxios"]
    end

    subgraph BE["Tier 2 · 백엔드"]
        Router["Router"]
        Controller["Controller"]
        Service["Service\n+ status 계산"]
        Repository["Repository"]
    end

    subgraph DB["Tier 3 · 데이터베이스"]
        PG["PostgreSQL\nusers / todos"]
    end

    Client -->|HTTPS| Pages
    Pages --> Features
    Features --> API
    API -->|REST API / JWT| Router
    Router --> Controller
    Controller --> Service
    Service --> Repository
    Repository -->|SQL| PG
```

---

## 2. 백엔드 레이어 및 미들웨어

```mermaid
graph LR
    REQ["HTTP 요청"]

    subgraph MW["미들웨어"]
        RL["RateLimiter"]
        AUTH["authenticateToken\nJWT 검증"]
        VAL["validateBody\n입력값 검증"]
    end

    CTRL["Controller\n요청 파싱·응답"]
    SVC["Service\n비즈니스 로직"]
    REPO["Repository\nSQL 쿼리"]
    DB["PostgreSQL"]
    ERR["errorHandler\n에러 응답 표준화"]

    REQ --> RL --> AUTH --> VAL --> CTRL
    CTRL --> SVC --> REPO --> DB
    CTRL -.에러.-> ERR
    SVC  -.에러.-> ERR
```

---

## 3. 인증 흐름 (JWT)

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant B as 백엔드
    participant D as DB

    Note over C,D: 로그인
    C->>B: POST /auth/login
    B->>D: 사용자 조회 + 비밀번호 검증
    D-->>B: User 반환
    B-->>C: Access Token(15분) + Refresh Token(7일, httpOnly 쿠키)

    Note over C,B: 인증 요청
    C->>B: API 요청 + Authorization: Bearer {accessToken}
    B-->>C: 응답

    Note over C,B: Access Token 만료 시
    C->>B: POST /auth/refresh (Refresh Token 쿠키 자동 전송)
    B-->>C: 새 Access Token 발급

    Note over C,B: Refresh Token 만료 시
    C->>B: POST /auth/refresh
    B-->>C: 401 → 재로그인 요청
```

---

## 4. 할일 상태 전이

```mermaid
stateDiagram-v2
    [*] --> NOT_STARTED : 생성\n(오늘 < 시작일)
    [*] --> IN_PROGRESS  : 생성\n(시작일 ≤ 오늘 ≤ 종료일)

    NOT_STARTED --> IN_PROGRESS  : 시작일 도래
    IN_PROGRESS  --> OVERDUE     : 종료일 초과\n(미완료)

    IN_PROGRESS  --> COMPLETED_SUCCESS : 완료 처리\n(is_success=true)
    IN_PROGRESS  --> COMPLETED_FAILURE : 완료 처리\n(is_success=false)
    OVERDUE      --> COMPLETED_SUCCESS : 완료 처리\n(is_success=true)
    OVERDUE      --> COMPLETED_FAILURE : 완료 처리\n(is_success=false)

    note right of COMPLETED_SUCCESS : status는 DB 저장 없이\n서버에서 런타임 계산
```

---

## 5. 프론트엔드 상태 관리

```mermaid
graph LR
    subgraph TQ["TanStack Query\n서버 상태"]
        TODOS["todos 목록\n캐시·재검증"]
        USER["user 정보"]
    end

    subgraph ZS["Zustand\nUI 상태"]
        FILTER["필터·정렬\n선택값"]
        MODAL["모달 열림 여부"]
        TOKEN["accessToken"]
    end

    COMP["컴포넌트"] --> TQ
    COMP --> ZS
    TQ -->|API 호출| AXIOS["Axios\n(토큰 자동 첨부\n+ 갱신 인터셉터)"]
```

---

## 6. 프론트엔드 레이어 구조

```mermaid
graph TD
    subgraph Pages["Pages (라우트 단위)"]
        LP["LoginPage"]
        SP["SignupPage"]
        TP["TodosPage"]
    end

    subgraph Features["Features (도메인 기능)"]
        subgraph AUTH["auth"]
            LC["LoginForm"]
            SC["SignupForm"]
            UL["useLogin"]
            US["useSignup"]
            AS["useAuthStore\n[Zustand]"]
        end
        subgraph TODOS["todos"]
            TL["TodoList / TodoCard"]
            TF["TodoFilterBar"]
            TCF["TodoCreateForm"]
            TEF["TodoEditForm"]
            TCM["TodoCompleteModal"]
            UT["useTodos\nuseCreateTodo\nuseUpdateTodo\nuseCompleteTodo\nuseDeleteTodo"]
            FS["useTodoFilterStore\n[Zustand]"]
        end
    end

    subgraph Shared["Shared (공통)"]
        UI["Button / Input\nModal / Spinner"]
        PR["ProtectedRoute"]
        UTIL["formatDate\ntodoStatusLabel"]
    end

    subgraph APILayer["API Layer"]
        AX["axiosInstance\n토큰 자동 첨부·갱신"]
        AA["authApi"]
        TA["todoApi"]
    end

    Pages --> Features
    Pages --> Shared
    Features --> Shared
    Features --> APILayer
    AX -->|REST / HTTPS| BE["백엔드 API"]
```

---

## 변경 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v0.1 | 2026-04-01 | Yongwoo | 최초 작성: 시스템 구조, 백엔드 레이어, 인증 흐름, 상태 전이, 프론트엔드 상태 관리 |
| v0.2 | 2026-04-01 | Yongwoo | ERD(§6), 프론트엔드 레이어 구조(§7) 추가 |
| v0.3 | 2026-04-01 | Yongwoo | ERD 항목 제거 (6-erd.md로 분리) |
