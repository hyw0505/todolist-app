/**
 * E2E Test: SC-01 - 신규 사용자 회원가입 및 첫 할일 등록
 * 
 * 관련 UC: UC-01(회원가입), UC-02(로그인), UC-03(할일 생성)
 * 페르소나: P-01 이지은 (17 세, 고등학생)
 * 테스트 유형: 정상 흐름 (Happy Path)
 */

import { test, expect } from '@playwright/test';

test.describe('SC-01: 신규 사용자 회원가입 및 첫 할일 등록', () => {
  const testUser = {
    name: '이지은',
    email: `jieun.${Date.now()}@example.com`,
    password: 'Jieun2026!',
  };

  const todo1 = {
    title: '수학 수행평가 제출',
    description: '3 단원까지',
    startDate: '2026-04-01',
    dueDate: '2026-04-07',
  };

  const todo2 = {
    title: '영어 에세이 제출',
    description: 'A Tale of Two Cities 독후감',
    startDate: '2026-04-05',
    dueDate: '2026-04-09',
  };

  test.beforeEach(async ({ page }) => {
    // 앱 초기 로드
    await page.goto('http://localhost:5173');
  });

  test('회원가입을 통해 새 계정을 생성할 수 있어야 한다', async ({ page }) => {
    // 1. 회원가입 페이지로 이동
    await page.getByRole('button', { name: '회원가입' }).click();
    await expect(page).toHaveURL('http://localhost:5173/signup');

    // 2. 회원가입 정보 입력
    await page.getByRole('textbox', { name: '이름*' }).fill(testUser.name);
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('textbox', { name: '비밀번호 확인*' }).fill(testUser.password);

    // 3. 가입하기 버튼 클릭
    await page.getByRole('button', { name: '회원가입' }).click();

    // 4. 로그인 페이지로 이동 확인
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('로그인 후 할일 목록 페이지로 이동할 수 있어야 한다', async ({ page }) => {
    // 회원가입 (테스트 데이터 준비)
    await page.goto('http://localhost:5173/signup');
    await page.getByRole('textbox', { name: '이름*' }).fill(testUser.name);
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('textbox', { name: '비밀번호 확인*' }).fill(testUser.password);
    await page.getByRole('button', { name: '회원가입' }).click();

    // 로그인
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // 할일 목록 페이지로 이동 확인
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: '할일 목록' })).toBeVisible();
  });

  test('새 할일을 생성할 수 있어야 한다', async ({ page }) => {
    // 로그인까지 수행
    await page.goto('http://localhost:5173/signup');
    await page.getByRole('textbox', { name: '이름*' }).fill(testUser.name);
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('textbox', { name: '비밀번호 확인*' }).fill(testUser.password);
    await page.getByRole('button', { name: '회원가입' }).click();

    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // 할일 추가 버튼 클릭
    await page.getByRole('button', { name: '+ 할일 추가' }).click();

    // 할일 정보 입력
    await page.getByRole('textbox', { name: '제목 *' }).fill(todo1.title);
    await page.getByRole('textbox', { name: '설명' }).fill(todo1.description);
    await page.getByRole('textbox', { name: '시작일 *' }).fill(todo1.startDate);
    await page.getByRole('textbox', { name: '종료일 *' }).fill(todo1.dueDate);

    // 추가 버튼 클릭
    await page.getByRole('button', { name: '추가', exact: true }).click();

    // 할일 목록에 표시되는지 확인 (로딩 완료 대기)
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(todo1.title)).toBeVisible();
  });

  test('여러 개의 할일을 생성할 수 있어야 한다', async ({ page }) => {
    // 로그인까지 수행
    await page.goto('http://localhost:5173/signup');
    await page.getByRole('textbox', { name: '이름*' }).fill(testUser.name);
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('textbox', { name: '비밀번호 확인*' }).fill(testUser.password);
    await page.getByRole('button', { name: '회원가입' }).click();

    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // 첫 번째 할일 추가
    await page.getByRole('button', { name: '+ 할일 추가' }).click();
    await page.getByRole('textbox', { name: '제목 *' }).fill(todo1.title);
    await page.getByRole('textbox', { name: '시작일 *' }).fill(todo1.startDate);
    await page.getByRole('textbox', { name: '종료일 *' }).fill(todo1.dueDate);
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // 두 번째 할일 추가
    await page.getByRole('button', { name: '+ 할일 추가' }).click();
    await page.getByRole('textbox', { name: '제목 *' }).fill(todo2.title);
    await page.getByRole('textbox', { name: '시작일 *' }).fill(todo2.startDate);
    await page.getByRole('textbox', { name: '종료일 *' }).fill(todo2.dueDate);
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // 두 할일이 모두 표시되는지 확인
    await expect(page.getByText(todo1.title)).toBeVisible();
    await expect(page.getByText(todo2.title)).toBeVisible();
  });

  test('할일 상태가 자동으로 산출되어야 한다', async ({ page }) => {
    // 로그인까지 수행
    await page.goto('http://localhost:5173/signup');
    await page.getByRole('textbox', { name: '이름*' }).fill(testUser.name);
    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('textbox', { name: '비밀번호 확인*' }).fill(testUser.password);
    await page.getByRole('button', { name: '회원가입' }).click();

    await page.getByRole('textbox', { name: '이메일*' }).fill(testUser.email);
    await page.getByRole('textbox', { name: '비밀번호*' }).fill(testUser.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // 시작일이 오늘인 할일 추가 (IN_PROGRESS 예상)
    await page.getByRole('button', { name: '+ 할일 추가' }).click();
    await page.getByRole('textbox', { name: '제목 *' }).fill(todo1.title);
    await page.getByRole('textbox', { name: '시작일 *' }).fill(todo1.startDate);
    await page.getByRole('textbox', { name: '종료일 *' }).fill(todo1.dueDate);
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // 시작일이 미래인 할일 추가 (NOT_STARTED 예상)
    await page.getByRole('button', { name: '+ 할일 추가' }).click();
    await page.getByRole('textbox', { name: '제목 *' }).fill(todo2.title);
    await page.getByRole('textbox', { name: '시작일 *' }).fill(todo2.startDate);
    await page.getByRole('textbox', { name: '종료일 *' }).fill(todo2.dueDate);
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // 상태 배지 확인
    // TODO: 상태 배지 텍스트 확인 (구현에 따라 "진행 중", "시작 전" 등)
  });
});
