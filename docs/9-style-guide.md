# 프론트엔드 스타일 가이드

**문서 버전:** v1.1  
**작성일:** 2026-04-01  
**작성자:** Yongwoo

> 참조 디자인: 네이버 뉴스 포털 UI 분석 기반

---

## 1. 색상 시스템 (Color System)

### 1.1 Primary Colors

| 이름 | Light Mode | Dark Mode | 용도 |
|------|-----------|-----------|------|
| Primary Blue | `#0068C4` | `#4DA3FF` | 상단 GNB 배경, 주요 액션 버튼, 링크 hover |
| Primary Dark | `#003D7A` | `#2980E8` | Primary Blue hover/active 상태 |
| Primary Light | `#E8F2FF` | `#1A2E47` | 선택된 탭 배경, 포커스 상태 |

### 1.2 Neutral Colors

| 이름 | Light Mode | Dark Mode | 용도 |
|------|-----------|-----------|------|
| Surface 0 (Page BG) | `#FFFFFF` | `#121212` | 기본 페이지 배경 |
| Surface 1 (Card BG) | `#FFFFFF` | `#1E1E1E` | 카드, 모달 배경 |
| Surface 2 (Subtle BG) | `#F5F5F5` | `#2A2A2A` | 사이드바, 필터 바 배경 |
| Border | `#E0E0E0` | `#3A3A3A` | 구분선, 보더 |
| Border Strong | `#C4C4C4` | `#555555` | 강조 구분선, 비활성 아이콘 |
| Text Primary | `#1A1A1A` | `#E8E8E8` | 헤드라인, 주요 본문 텍스트 |
| Text Secondary | `#404040` | `#AAAAAA` | 부제목, 설명 텍스트 |
| Text Muted | `#767676` | `#6E6E6E` | 날짜, 메타 정보, 비활성 텍스트 |

### 1.3 Semantic Colors

| 이름 | Light Mode | Dark Mode | 용도 |
|------|-----------|-----------|------|
| Success Green | `#03C75A` | `#1FD67A` | 완료 상태, 긍정 액션 |
| Danger Red | `#FF3838` | `#FF6B6B` | 긴급 뱃지(속보), 삭제 액션, 경고 |
| Warning Orange | `#FF6B35` | `#FF8C5A` | 주의 상태, 기한 임박 |
| Info Blue | `#0068C4` | `#4DA3FF` | 정보성 메시지 |
| Overdue Red | `#D93025` | `#F05A50` | 기한 초과 상태 표시 |

### 1.4 Status Colors (Todo 전용)

#### Light Mode

| 상태 | 배경색 | 텍스트색 | 좌측 보더색 | 용도 |
|------|--------|----------|------------|------|
| NOT_STARTED | `#F5F5F5` | `#767676` | `#C4C4C4` | 시작 전 |
| IN_PROGRESS | `#E8F2FF` | `#0068C4` | `#0068C4` | 진행 중 |
| OVERDUE | `#FFF0F0` | `#D93025` | `#D93025` | 기한 초과 |
| COMPLETED_SUCCESS | `#F0FFF4` | `#03C75A` | `#03C75A` | 성공 완료 |
| COMPLETED_FAILURE | `#FFF5F5` | `#FF3838` | `#FF3838` | 실패 완료 |

#### Dark Mode

| 상태 | 배경색 | 텍스트색 | 좌측 보더색 | 용도 |
|------|--------|----------|------------|------|
| NOT_STARTED | `#2A2A2A` | `#6E6E6E` | `#555555` | 시작 전 |
| IN_PROGRESS | `#1A2E47` | `#4DA3FF` | `#4DA3FF` | 진행 중 |
| OVERDUE | `#2E1A1A` | `#F05A50` | `#F05A50` | 기한 초과 |
| COMPLETED_SUCCESS | `#1A2E22` | `#1FD67A` | `#1FD67A` | 성공 완료 |
| COMPLETED_FAILURE | `#2E1A1A` | `#FF6B6B` | `#FF6B6B` | 실패 완료 |

---

## 2. 타이포그래피 (Typography)

### 폰트 패밀리

```css
font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 폰트 스케일

| 이름 | 크기 | 두께 | 행간 | 용도 |
|------|------|------|------|------|
| Display | `24px` | 700 | 1.3 | 페이지 타이틀 |
| Heading 1 | `20px` | 700 | 1.4 | 섹션 헤더 |
| Heading 2 | `18px` | 600 | 1.4 | 카드 헤드라인 |
| Heading 3 | `16px` | 600 | 1.5 | 서브 헤드라인 |
| Body Large | `15px` | 400 | 1.6 | 주요 본문 |
| Body | `14px` | 400 | 1.6 | 기본 본문, 설명 |
| Body Small | `13px` | 400 | 1.5 | 부가 설명 |
| Caption | `12px` | 400 | 1.4 | 날짜, 메타 정보 |
| Label | `11px` | 500 | 1.3 | 뱃지, 태그 |

### 텍스트 스타일 사용 규칙

- **헤드라인** — 2줄 이상 시 말줄임(`text-overflow: ellipsis`) 처리
- **본문** — 최대 3줄 제한, 이후 말줄임
- **날짜/메타** — Gray 500으로 통일
- **링크** — 기본 Gray 900, hover 시 Primary Blue, underline 없음

---

## 3. 간격 시스템 (Spacing)

8px 베이스 그리드 시스템 사용.

| 토큰 | 값 | 용도 |
|------|-----|------|
| spacing-1 | `4px` | 아이콘-텍스트 내부 간격 |
| spacing-2 | `8px` | 요소 간 최소 간격, 뱃지 패딩 |
| spacing-3 | `12px` | 카드 내부 상하 패딩 |
| spacing-4 | `16px` | 카드 내부 좌우 패딩, 섹션 간격 |
| spacing-5 | `20px` | 컴포넌트 간 기본 간격 |
| spacing-6 | `24px` | 섹션 헤더 하단 마진 |
| spacing-8 | `32px` | 섹션 간 대간격 |
| spacing-10 | `40px` | 페이지 레벨 패딩 |

---

## 4. 레이아웃 (Layout)

### 그리드

```
전체 너비: 1080px (max-width)
컬럼 수: 12 column
거터: 16px
사이드 마진: 20px (모바일 16px)
```

### 3단 레이아웃 (데스크탑)

```
┌──────────────────────────────────────────────────┐
│                    GNB (전체 너비)                  │
├──────────────────────────────────────────────────┤
│              카테고리 탭 (전체 너비)                  │
├────────────┬──────────────────┬──────────────────┤
│  Left      │   Main Content   │  Right Sidebar   │
│  (240px)   │    (470px)       │   (230px)        │
│            │                  │                  │
└────────────┴──────────────────┴──────────────────┘
```

### 반응형 브레이크포인트

| 이름 | 범위 | 레이아웃 |
|------|------|----------|
| Mobile | `< 768px` | 1단 (전체 너비) |
| Tablet | `768px ~ 1023px` | 2단 |
| Desktop | `≥ 1024px` | 3단 |

---

## 5. 컴포넌트 (Components)

### 5.1 네비게이션 바 (GNB)

```
배경: Primary Blue (#0068C4)
텍스트: White
높이: 44px
폰트: 14px / 500
아이콘: 24x24px
```

**구조:**
- 좌측: 로고 (`todolist-app`)
- 우측: ThemeToggle(🌙/☀️) + LanguageSelector(🌐 ko▼) + [사용자명 + 로그아웃] *(로그인 후)*

**로그인 전:** 로고(좌) / ThemeToggle + LanguageSelector(우)
**로그인 후:** 로고(좌) / ThemeToggle + LanguageSelector + 사용자명 + 로그아웃(우)

### 5.2 카테고리 탭 (Sub Navigation)

```
배경: White
높이: 44px
폰트: 14px / 400
활성 탭: Primary Blue, 하단 보더 2px solid
비활성: Gray 700
호버: Primary Blue
```

- 좌측 하단 보더 2px로 활성 상태 표시
- 알림 닷(dot): Red 4px 원형, 탭 오른쪽 상단

### 5.3 카드 (Card)

#### 기본 카드
```
배경: White
보더: 없음 (구분은 배경색과 간격으로 처리)
보더 반경: 4px
패딩: 16px
섀도: 없음 (flat design)
```

#### 뉴스 카드 (리스트형)
```
레이아웃: 썸네일(좌, 80x80px) + 텍스트(우)
간격: 12px
헤드라인: 15px / 600 / Gray 900 (2줄 말줄임)
메타: 12px / Gray 500
```

#### 뉴스 카드 (그리드형)
```
썸네일: 전체 너비, 높이 120px, object-fit: cover
헤드라인: 14px / 600 / Gray 900
보더 반경: 4px
```

### 5.4 버튼 (Button)

#### Primary 버튼

| 속성 | Light Mode | Dark Mode |
|------|-----------|-----------|
| background | `#0068C4` | `#4DA3FF` |
| color | `#FFFFFF` | `#121212` |
| hover background | `#003D7A` | `#2980E8` |

```css
border: none;
border-radius: 4px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
```

#### Secondary (구독) 버튼

| 속성 | Light Mode | Dark Mode |
|------|-----------|-----------|
| background | `#FFFFFF` | `#1E1E1E` |
| color | `#0068C4` | `#4DA3FF` |
| border | `1px solid #0068C4` | `1px solid #4DA3FF` |
| hover background | `#E8F2FF` | `#1A2E47` |

```css
border-radius: 20px;
padding: 4px 10px;
font-size: 12px;
font-weight: 500;
```

#### Ghost 버튼

| 속성 | Light Mode | Dark Mode |
|------|-----------|-----------|
| background | `transparent` | `transparent` |
| color | `#404040` | `#AAAAAA` |
| border | `1px solid #C4C4C4` | `1px solid #3A3A3A` |
| hover background | `#F5F5F5` | `#2A2A2A` |

```css
border-radius: 4px;
padding: 6px 12px;
font-size: 13px;
```

#### 더 알아보기 버튼 (Dark CTA)

| 속성 | Light Mode | Dark Mode |
|------|-----------|-----------|
| background | `#404040` | `#E8E8E8` |
| color | `#FFFFFF` | `#121212` |
| hover background | `#1A1A1A` | `#AAAAAA` |

```css
border-radius: 4px;
padding: 10px 20px;
font-size: 14px;
font-weight: 500;
```

#### 테마 토글 버튼

| 속성 | Light Mode | Dark Mode |
|------|-----------|-----------|
| background | `transparent` | `transparent` |
| color | `#1A1A1A` | `#E8E8E8` |
| hover background | `#F5F5F5` | `#2A2A2A` |
| 아이콘 크기 | 20x20px | 20x20px |
| 클릭 영역 | 44x44px | 44x44px |

```css
border: none;
border-radius: 50%;
padding: 12px;
cursor: pointer;
transition: background-color 0.15s ease;
display: flex;
align-items: center;
justify-content: center;
```

**호버 상태:**
```css
&:hover {
  background-color: var(--color-surface-2);
}
```

**포커스 상태:**
```css
&:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**접근성:**
```html
<button 
  aria-label="테마 전환" 
  aria-pressed="false"
  title="다크모드 토글"
>
  ☀️ 또는 🌙
</button>
```

### 5.5 뱃지 (Badge)

#### 긴급 뱃지 (속보/단독)
```css
background: #FF3838;
color: #FFFFFF;
border-radius: 3px;
padding: 2px 6px;
font-size: 11px;
font-weight: 700;
```

#### 상태 뱃지 (Todo)
```css
border-radius: 20px;
padding: 3px 10px;
font-size: 12px;
font-weight: 500;
/* 색상은 Status Colors 참조 */
```

### 5.6 태그 (Tag / Chip)

```css
background: #F5F5F5;
color: #404040;
border-radius: 20px;
padding: 4px 10px;
font-size: 12px;
border: 1px solid #E0E0E0;
```

해시태그(#이재명정부):
```css
background: #E8F2FF;
color: #0068C4;
border: none;
```

### 5.7 구분선 (Divider)

```css
/* 수평 구분선 */
border: none;
border-top: 1px solid #F0F0F0;
margin: 12px 0;

/* 섹션 구분 */
border-top: 2px solid #0068C4;
```

### 5.8 아바타 / 언론사 아이콘

```
크기: 20x20px (소), 32x32px (중), 48x48px (대)
모양: circle (border-radius: 50%)
보더: 1px solid #E0E0E0
```

---

## 6. 아이콘 (Icons)

- **라이브러리**: Material Icons 또는 커스텀 SVG
- **기본 크기**: 16px, 20px, 24px
- **색상**: 맥락에 따라 Gray 700 (일반) / Primary Blue (활성) / White (GNB)
- **클릭 영역**: 최소 44x44px 보장 (모바일 접근성)

### 테마 토글 아이콘

| 상태 | 아이콘 | 설명 |
|------|--------|------|
| Light Mode | ☀️ (sun) | 해 아이콘, 라이트모드 표시 |
| Dark Mode | 🌙 (moon) | 달 아이콘, 다크모드 표시 |
| 크기 | 20x20px | Header 에서 사용 |
| 색상 | 현재 텍스트 색상 상속 | `color: currentColor` |
| 호버 | 배경색 `--color-surface-2` | 원형 배경 표시 |

---

## 7. 섀도 & 엘리베이션 (Shadow & Elevation)

```css
/* Level 0 - Flat (기본 카드) */
box-shadow: none;

/* Level 1 - 드롭다운, 툴팁 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

/* Level 2 - 모달, 팝업 */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);

/* Level 3 - 오버레이 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.20);
```

---

## 8. 인터랙션 & 애니메이션 (Interaction)

### 전환 (Transition)

```css
/* 기본 */
transition: all 0.15s ease;

/* 색상 변경 */
transition: color 0.1s ease, background-color 0.1s ease;

/* 카드 호버 */
transition: box-shadow 0.2s ease;
```

### 호버 상태

| 요소 | Light 기본 | Light 호버 | Dark 기본 | Dark 호버 |
|------|-----------|-----------|----------|----------|
| 링크 텍스트 | `#1A1A1A` | `#0068C4` | `#E8E8E8` | `#4DA3FF` |
| 카드 | 섀도 없음 | `--shadow-1` | 섀도 없음 | `--shadow-1` |
| 버튼 Primary | `#0068C4` | `#003D7A` | `#4DA3FF` | `#2980E8` |
| 구독 버튼 | `#FFFFFF` | `#E8F2FF` | `#1E1E1E` | `#1A2E47` |
| 탭 | `#404040` | `#0068C4` | `#AAAAAA` | `#4DA3FF` |

### 포커스 상태 (접근성)

```css
outline: 2px solid #0068C4;
outline-offset: 2px;
```

---

## 9. 폼 요소 (Form Elements)

### 입력 필드 (Input)

```css
/* 기본 */
border: 1px solid #C4C4C4;
border-radius: 4px;
padding: 10px 12px;
font-size: 14px;
background: #FFFFFF;

/* 포커스 */
border-color: #0068C4;
box-shadow: 0 0 0 3px rgba(0, 104, 196, 0.15);

/* 에러 */
border-color: #FF3838;
box-shadow: 0 0 0 3px rgba(255, 56, 56, 0.15);

/* 비활성 */
background: #F5F5F5;
color: #767676;
```

### 셀렉트 (Select)

```css
동일한 Input 스타일 적용
우측에 chevron-down 아이콘 (16px)
appearance: none;
```

### 체크박스 & 라디오

```css
/* 완료 체크박스 */
width: 20px;
height: 20px;
border: 2px solid #C4C4C4;
border-radius: 4px; /* 체크박스 */
/* border-radius: 50%; /* 라디오 */

/* 체크 상태 */
background: #0068C4;
border-color: #0068C4;
```

---

## 10. 접근성 (Accessibility)

- **색상 대비**: WCAG AA 기준 최소 4.5:1 (텍스트), 3:1 (UI 컴포넌트)
- **최소 클릭 영역**: 44x44px
- **포커스 표시**: 모든 인터랙티브 요소에 visible focus ring
- **스크린리더**: ARIA label, role 적절히 사용
- **글자 크기**: 최소 12px, 기본 14px

---

## 11. Todo 앱 전용 패턴

### 투두 카드 레이아웃

```
┌─────────────────────────────────────────┐
│ [체크박스] 제목 (Heading 3)        [상태뱃지] │
│           설명 (Body Small, Gray 500)    │
│           시작일 ~ 마감일 (Caption)       │
└─────────────────────────────────────────┘
```

### 상태별 카드 스타일

| 상태 | 좌측 보더 색상 | 배경 | 제목 색상 |
|------|--------------|------|----------|
| NOT_STARTED | `#C4C4C4` | White | Gray 900 |
| IN_PROGRESS | `#0068C4` | White | Gray 900 |
| OVERDUE | `#D93025` | `#FFF8F8` | `#D93025` |
| COMPLETED_SUCCESS | `#03C75A` | `#F8FFF8` | Gray 500 (취소선) |
| COMPLETED_FAILURE | `#FF3838` | White | Gray 500 (취소선) |

### 필터/정렬 바

```
배경: #F5F5F5
높이: 40px
패딩: 0 16px
폰트: 13px / 500
활성 필터: Primary Blue, 하단 보더 2px
```

### 빈 상태 (Empty State)

```
아이콘: 48px, Gray 300
제목: 16px / 600 / Gray 700
설명: 14px / Gray 500
버튼: Primary 버튼 (+ 할일 추가)
```

### 페이지네이션

```
버튼 크기: 32x32px
현재 페이지: Primary Blue 배경, White 텍스트
비활성: Gray 300
화살표: 16px 아이콘
```

---

## 12. 언어 선택 UI (Language Selector)

### 12.1 언어 선택 컴포넌트

GNB(상단 바) 우측에 ThemeToggle 다음에 배치하는 언어 선택 드롭다운.

| 속성 | 값 |
|------|---|
| **지원 언어** | 한국어 (ko), English (en), 日本語 (jp) |
| **기본값** | `ko` (미설정 시) |
| **저장 위치** | `localStorage` (`i18nextLng` 키) — 서버 전송 없음 |
| **GNB 배치** | 우측 영역, ThemeToggle 오른쪽 / 사용자명 왼쪽 |

### 12.2 언어 선택 버튼 스타일

GNB 내에서는 헤더 배경(Primary Blue) 위에 흰색 텍스트로 표시된다.

```css
/* GNB 내 언어 선택 버튼 */
.language-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #FFFFFF;
  background: transparent;
  border: none;
}

.language-selector:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

| 상태 | 스타일 |
|------|--------|
| 기본 | 흰색 텍스트 (`#FFFFFF`), 배경 없음 |
| hover | 배경 `rgba(255,255,255,0.1)` |
| focus | outline `2px solid var(--primary-blue)` |

### 12.3 언어 드롭다운 옵션

```
┌─────────────────┐
│ 🌐 한국어  ✓   │  ← 현재 선택 (체크 표시)
│    English      │
│    日本語       │
└─────────────────┘
```

- 드롭다운 너비: `min-width: 120px`
- 배경: `var(--surface-1)`, 테두리: `var(--border)`
- 선택된 항목: `color: var(--primary-blue)`, 체크 아이콘 표시

---

## 13. 다크모드 (Dark Mode)

### 12.1 구현 전략

`data-theme` 어트리뷰트를 `<html>` 태그에 설정하여 CSS 커스텀 프로퍼티를 오버라이드하는 방식을 사용한다. `prefers-color-scheme` 미디어 쿼리로 OS 설정도 지원한다.

```css
/* OS 설정 기반 자동 적용 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* dark mode tokens */
  }
}

/* 수동 설정 기반 */
[data-theme="dark"] {
  /* dark mode tokens */
}
```

### 12.1.1 테마 토글 UI 구현

**HTML 구조:**
```html
<!-- Header 내 테마 토글 버튼 -->
<header class="gnb">
  <div class="gnb__logo">todolist-app</div>
  <button 
    class="theme-toggle" 
    aria-label="테마 전환"
    aria-pressed="false"
    title="다크모드 토글"
  >
    <span class="theme-toggle__icon">☀️</span>
  </button>
  <div class="gnb__user">사용자명</div>
</header>
```

**JavaScript 구현 (React + Zustand):**
```typescript
// stores/useThemeStore.ts
import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'todolist-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  
  setTheme: (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    set({ theme: newTheme });
    applyTheme(newTheme);
  },
  
  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  },
}));

// 테마 적용 함수
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const html = document.documentElement;
  
  if (theme === 'system') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', theme);
  }
}

// 초기 테마 설정
function initializeTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeState['theme'] | null;
  const theme = saved || 'system';
  applyTheme(theme);
  useThemeStore.setState({ theme });
}

// 컴포넌트 예시
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="테마 전환"
      aria-pressed={isDark}
      title={isDark ? '라이트모드로 전환' : '다크모드로 전환'}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}
```

**CSS 구현:**
```css
.theme-toggle {
  background: transparent;
  border: none;
  border-radius: 50%;
  padding: 12px;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background-color: var(--color-surface-2);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-toggle__icon {
  font-size: 20px;
  line-height: 1;
}
```

### 12.1.2 테마 우선순위

1. **사용자 수동 설정** (`data-theme` 어트리뷰트)
2. **OS 시스템 설정** (`prefers-color-scheme` 미디어 쿼리)
3. **기본값** (라이트모드)

```typescript
// 테마 결정 로직
function getEffectiveTheme(storedTheme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (storedTheme !== 'system') {
    return storedTheme;
  }
  
  // 시스템 설정 감지
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}
```

### 12.2 Dark Mode CSS 커스텀 프로퍼티

```css
[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root {
    /* Surface */
    --color-surface-0: #121212;
    --color-surface-1: #1E1E1E;
    --color-surface-2: #2A2A2A;

    /* Border */
    --color-border: #3A3A3A;
    --color-border-strong: #555555;

    /* Text */
    --color-text-primary: #E8E8E8;
    --color-text-secondary: #AAAAAA;
    --color-text-muted: #6E6E6E;

    /* Primary */
    --color-primary: #4DA3FF;
    --color-primary-dark: #2980E8;
    --color-primary-light: #1A2E47;

    /* Semantic */
    --color-success: #1FD67A;
    --color-danger: #FF6B6B;
    --color-warning: #FF8C5A;
    --color-overdue: #F05A50;

    /* Status Backgrounds */
    --status-not-started-bg: #2A2A2A;
    --status-not-started-text: #6E6E6E;
    --status-not-started-border: #555555;

    --status-in-progress-bg: #1A2E47;
    --status-in-progress-text: #4DA3FF;
    --status-in-progress-border: #4DA3FF;

    --status-overdue-bg: #2E1A1A;
    --status-overdue-text: #F05A50;
    --status-overdue-border: #F05A50;

    --status-completed-success-bg: #1A2E22;
    --status-completed-success-text: #1FD67A;
    --status-completed-success-border: #1FD67A;

    --status-completed-failure-bg: #2E1A1A;
    --status-completed-failure-text: #FF6B6B;
    --status-completed-failure-border: #FF6B6B;
  }
}
```

### 12.3 Light / Dark 토큰 대조표

| 역할 | Light Mode | Dark Mode |
|------|-----------|-----------|
| 페이지 배경 | `#FFFFFF` | `#121212` |
| 카드/모달 배경 | `#FFFFFF` | `#1E1E1E` |
| 서브 배경 (사이드바 등) | `#F5F5F5` | `#2A2A2A` |
| 구분선 | `#E0E0E0` | `#3A3A3A` |
| 강조 구분선 | `#C4C4C4` | `#555555` |
| 주요 텍스트 | `#1A1A1A` | `#E8E8E8` |
| 보조 텍스트 | `#404040` | `#AAAAAA` |
| 흐린 텍스트 | `#767676` | `#6E6E6E` |
| Primary 색상 | `#0068C4` | `#4DA3FF` |
| Primary hover | `#003D7A` | `#2980E8` |
| Primary 배경 (연) | `#E8F2FF` | `#1A2E47` |
| Success | `#03C75A` | `#1FD67A` |
| Danger | `#FF3838` | `#FF6B6B` |
| Warning | `#FF6B35` | `#FF8C5A` |
| Overdue | `#D93025` | `#F05A50` |

### 12.4 컴포넌트별 Dark Mode 고려사항

| 컴포넌트 | Light Mode | Dark Mode |
|---------|-----------|-----------|
| GNB 배경 | `#0068C4` | `#1A2E47` |
| 카드 배경 | `#FFFFFF` | `#1E1E1E` |
| 카드 hover 섀도 | `0 2px 8px rgba(0,0,0,0.12)` | `0 2px 8px rgba(0,0,0,0.40)` |
| 모달 오버레이 | `rgba(0,0,0,0.50)` | `rgba(0,0,0,0.70)` |
| Input 배경 | `#FFFFFF` | `#2A2A2A` |
| Input 비활성 배경 | `#F5F5F5` | `#1E1E1E` |
| Input 포커스 shadow | `0 0 0 3px rgba(0,104,196,0.15)` | `0 0 0 3px rgba(77,163,255,0.25)` |
| 스크롤바 track | `#F5F5F5` | `#2A2A2A` |
| 스크롤바 thumb | `#C4C4C4` | `#555555` |

---

## 13. CSS 커스텀 프로퍼티 (Design Tokens)

### Light Mode (기본값)

```css
:root {
  /* Surface */
  --color-surface-0: #FFFFFF;
  --color-surface-1: #FFFFFF;
  --color-surface-2: #F5F5F5;

  /* Border */
  --color-border: #E0E0E0;
  --color-border-strong: #C4C4C4;

  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #404040;
  --color-text-muted: #767676;

  /* Primary */
  --color-primary: #0068C4;
  --color-primary-dark: #003D7A;
  --color-primary-light: #E8F2FF;

  /* Semantic */
  --color-success: #03C75A;
  --color-danger: #FF3838;
  --color-warning: #FF6B35;
  --color-overdue: #D93025;

  /* Status — NOT_STARTED */
  --status-not-started-bg: #F5F5F5;
  --status-not-started-text: #767676;
  --status-not-started-border: #C4C4C4;

  /* Status — IN_PROGRESS */
  --status-in-progress-bg: #E8F2FF;
  --status-in-progress-text: #0068C4;
  --status-in-progress-border: #0068C4;

  /* Status — OVERDUE */
  --status-overdue-bg: #FFF0F0;
  --status-overdue-text: #D93025;
  --status-overdue-border: #D93025;

  /* Status — COMPLETED_SUCCESS */
  --status-completed-success-bg: #F0FFF4;
  --status-completed-success-text: #03C75A;
  --status-completed-success-border: #03C75A;

  /* Status — COMPLETED_FAILURE */
  --status-completed-failure-bg: #FFF5F5;
  --status-completed-failure-text: #FF3838;
  --status-completed-failure-border: #FF3838;

  /* Typography */
  --font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-display: 24px;
  --font-size-h1: 20px;
  --font-size-h2: 18px;
  --font-size-h3: 16px;
  --font-size-body-lg: 15px;
  --font-size-body: 14px;
  --font-size-body-sm: 13px;
  --font-size-caption: 12px;
  --font-size-label: 11px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Border Radius */
  --radius-sm: 3px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-pill: 20px;
  --radius-circle: 50%;

  /* Shadow */
  --shadow-1: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-2: 0 4px 16px rgba(0, 0, 0, 0.16);
  --shadow-3: 0 8px 24px rgba(0, 0, 0, 0.20);

  /* Transition */
  --transition-fast: 0.1s ease;
  --transition-base: 0.15s ease;
  --transition-slow: 0.2s ease;
}
```

### Dark Mode 오버라이드

```css
[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Surface */
    --color-surface-0: #121212;
    --color-surface-1: #1E1E1E;
    --color-surface-2: #2A2A2A;

    /* Border */
    --color-border: #3A3A3A;
    --color-border-strong: #555555;

    /* Text */
    --color-text-primary: #E8E8E8;
    --color-text-secondary: #AAAAAA;
    --color-text-muted: #6E6E6E;

    /* Primary */
    --color-primary: #4DA3FF;
    --color-primary-dark: #2980E8;
    --color-primary-light: #1A2E47;

    /* Semantic */
    --color-success: #1FD67A;
    --color-danger: #FF6B6B;
    --color-warning: #FF8C5A;
    --color-overdue: #F05A50;

    /* Status — NOT_STARTED */
    --status-not-started-bg: #2A2A2A;
    --status-not-started-text: #6E6E6E;
    --status-not-started-border: #555555;

    /* Status — IN_PROGRESS */
    --status-in-progress-bg: #1A2E47;
    --status-in-progress-text: #4DA3FF;
    --status-in-progress-border: #4DA3FF;

    /* Status — OVERDUE */
    --status-overdue-bg: #2E1A1A;
    --status-overdue-text: #F05A50;
    --status-overdue-border: #F05A50;

    /* Status — COMPLETED_SUCCESS */
    --status-completed-success-bg: #1A2E22;
    --status-completed-success-text: #1FD67A;
    --status-completed-success-border: #1FD67A;

    /* Status — COMPLETED_FAILURE */
    --status-completed-failure-bg: #2E1A1A;
    --status-completed-failure-text: #FF6B6B;
    --status-completed-failure-border: #FF6B6B;

    /* Shadow (어두운 배경에서 더 진한 그림자) */
    --shadow-1: 0 2px 8px rgba(0, 0, 0, 0.40);
    --shadow-2: 0 4px 16px rgba(0, 0, 0, 0.50);
    --shadow-3: 0 8px 24px rgba(0, 0, 0, 0.60);
  }
}
```

---

## 14. 변경 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|-----------|
| v1.0 | 2026-04-01 | Yongwoo | 최초 작성: 색상 시스템, 타이포그래피, 컴포넌트, 다크모드 CSS 커스텀 프로퍼티 정의 |
| v1.1 | 2026-04-02 | Yongwoo | **라이트모드/다크모드 토글 버튼 추가**: (§5.4) 테마 토글 버튼 명세 추가, (§6) 테마 토글 아이콘 명세 추가, (§12.1.1) 테마 토글 UI 구현 가이드 추가, (§12.1.2) 테마 우선순위 정의 |
| v1.2 | 2026-04-03 | Yongwoo | **다국어 지원 추가**: §12 언어 선택 UI 컴포넌트 스타일 신설 (버튼, 드롭다운, 상태별 색상) |
