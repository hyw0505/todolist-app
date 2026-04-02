import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * 
 * 문서: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  // 테스트 실행 결과 리포트 폴더
  outputDir: './results',
  
  // 테스트 실패 시 스크린샷 저장
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  
  // 모든 테스트에 대한 기본 타임아웃 (30 초)
  timeout: 30 * 1000,
  
  // 각 테스트의 기대 시간 (5 초)
  expect: {
    timeout: 5000,
  },
  
  // 테스트 파일 병렬 실행
  fullyParallel: false,
  
  // 테스트 실패 시 재시도 횟수
  retries: 1,
  
  // 워커 수 (CI 환경에서는 1, 로컬에서는 CPU 코어 수)
  workers: 1,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: './results/html' }],
    ['json', { outputFile: './results/results.json' }],
    ['junit', { outputFile: './results/junit.xml' }],
    ['list'],
  ],
  
  // 공유 설정
  use: {
    // 테스트 실패 시 트레이스 기록
    trace: 'on-first-retry',
    
    // 테스트 실패 시 스크린샷 촬영
    screenshot: 'only-on-failure',
    
    // 비디오 기록 (실패 시만)
    video: 'retain-on-failure',
    
    // 브라우저 액션 기본 타임아웃
    actionTimeout: 10000,
    
    // 기본 baseURL
    baseURL: 'http://localhost:5173',
    
    // 브라우저 컨텍스트 옵션
    viewport: { width: 1280, height: 720 },
  },
  
  // 프로젝트별 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // 웹 서버 설정 (선택사항)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
