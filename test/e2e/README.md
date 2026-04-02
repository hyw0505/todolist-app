# E2E 통합테스트

본 디렉토리는 todolist-app 의 End-to-End (E2E) 통합테스트를 포함합니다.

## 📋 테스트 시나리오

| 시나리오 ID | 제목 | 관련 UC | 상태 |
|------------|------|---------|------|
| SC-01 | 신규 사용자 회원가입 및 첫 할일 등록 | UC-01, UC-02, UC-03 | 🟡 개발 중 |
| SC-02 | 진행 중인 할일 목록 확인 및 정렬/필터링 | UC-04 | ⚪ 대기 |
| SC-03 | 할일 수정 및 완료 처리 - 성공 | UC-05, UC-06 | ⚪ 대기 |
| SC-04 | 기한이 지난 할일 (OVERDUE) 완료 처리 - 실패 | UC-06, BR-09 | ⚪ 대기 |
| SC-05 | 할일 삭제 | UC-07 | ⚪ 대기 |
| SC-06 | 예외 시나리오 모음 | UC-01, UC-02, UC-03, UC-05, UC-07 | ⚪ 대기 |

## 🚀 빠른 시작

### 1. prerequisites

- Node.js 18+
- Playwright
- 실행 중인 프론트엔드 개발 서버 (`npm run dev`)
- 실행 중인 백엔드 개발 서버 (`npm run dev`)

### 2. Playwright 설치

```bash
cd test/e2e
npx playwright install
```

### 3. 테스트 실행

```bash
# 모든 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test sc-01.spec.ts

# 특정 브라우저에서만 실행
npx playwright test --project=chromium

# UI 모드로 실행 (디버깅)
npx playwright test --ui

# 헤드리스 모드 없이 실행 (브라우저 창 표시)
npx playwright test --headed
```

### 4. 결과 확인

테스트 실행 후 `test/e2e/results` 디렉토리에서 결과를 확인합니다:

```bash
test/e2e/results/
├── html/          # HTML 리포트 (browser 에서 열기)
├── results.json   # JSON 리포트
└── junit.xml      # JUnit XML 리포트
```

HTML 리포트를 보려면:

```bash
npx playwright show-report results/html
```

## 📁 디렉토리 구조

```
test/e2e/
├── sc-01.spec.ts           # SC-01 테스트 스크립트
├── playwright.config.ts    # Playwright 설정
├── test-results.md         # 테스트 실행 결과 보고서
├── results/                # 테스트 실행 결과 (자동 생성)
│   ├── html/
│   ├── results.json
│   └── junit.xml
└── __screenshots__/        # 스크린샷 (실패 시 자동 생성)
```

## 🔧 설정

### 환경 변수

테스트 실행 전 다음 환경 변수를 설정합니다:

```bash
# 프론트엔드 서버 URL (기본값: http://localhost:5173)
export FRONTEND_URL=http://localhost:5173

# 백엔드 서버 URL (기본값: http://localhost:3000)
export BACKEND_URL=http://localhost:3000
```

### Playwright 설정 (`playwright.config.ts`)

주요 설정 항목:

- `timeout`: 테스트 기본 타임아웃 (30 초)
- `retries`: 테스트 실패 시 재시도 횟수 (1 회)
- `workers`: 병렬 실행 워커 수 (1)
- `reporter`: HTML, JSON, JUnit 리포트 생성

## 📊 테스트 시나리오 상세

### SC-01: 신규 사용자 회원가입 및 첫 할일 등록

**테스트 목표:**
- 새 사용자가 계정을 생성할 수 있어야 한다
- 생성한 계정으로 로그인할 수 있어야 한다
- 할일을 생성할 수 있어야 한다
- 할일 상태가 자동으로 산출되어야 한다

**테스트 케이스:**

1. ✅ 회원가입을 통해 새 계정을 생성할 수 있어야 한다
2. ✅ 로그인 후 할일 목록 페이지로 이동할 수 있어야 한다
3. ⚠️ 새 할일을 생성할 수 있어야 한다 (백엔드 토큰 문제)
4. ⚠️ 여러 개의 할일을 생성할 수 있어야 한다 (백엔드 토큰 문제)
5. ⚠️ 할일 상태가 자동으로 산출되어야 한다 (백엔드 토큰 문제)

**현재 상태:** 🟡 일시 중단 (백엔드 JWT 토큰 처리 문제 해결 필요)

## 🐛 알려진 문제

### 문제 1: Access Token 만료 및 Refresh Token 오류

**증상:**
- 로그인 후 15 분이 지나지 않아도 Access Token 이 만료됨
- Refresh Token 요청도 401 Unauthorized 반환

**에러 로그:**
```
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized)
  @ http://localhost:3000/api/v1/todos
  @ http://localhost:3000/api/v1/auth/refresh
```

**해결 방안:**
1. 백엔드 JWT secret 키 설정 확인
2. Token 만료 시간 설정 확인
3. Refresh Token 처리 로직 디버깅

## 📈 다음 단계

1. **백엔드 토큰 문제 해결**
   - JWT secret 키 환경 변수 확인
   - Token 발급/검증 로직 검토

2. **나머지 시나리오 테스트 작성**
   - SC-02: 할일 목록 필터링 및 정렬
   - SC-03: 할일 수정 및 완료 처리
   - SC-04: OVERDUE 할일 처리
   - SC-05: 할일 삭제

3. **CI/CD 통합**
   - GitHub Actions 워크플로우 작성
   - PR 시 자동 E2E 테스트 실행

## 📚 참조 문서

- [사용자 시나리오 문서](../../docs/3-user-scenario.md)
- [Playwright 테스트 문서](https://playwright.dev/docs/test-intro)
- [테스트 결과 보고서](./test-results.md)

## 🤝 기여 가이드

### 테스트 추가 방법

1. `test/e2e` 디렉토리에 새 스크립트 생성 (예: `sc-02.spec.ts`)
2. Playwright 테스트 패턴 따르기
3. `test-results.md` 에 결과 기록
4. PR 제출

### 테스트 작성 팁

- `test.describe()` 으로 시나리오 그룹화
- `test.beforeEach()` 로 공통 전처리 로직 작성
- `expect()` 로 명확한 검증 로직 작성
- `page.waitForLoadState('networkidle')` 로 비동기 처리 대기

---

**최종 업데이트:** 2026-04-02  
**버전:** v0.1  
**담당:** Yongwoo
