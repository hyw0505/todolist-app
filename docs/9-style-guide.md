# 프론트엔드 스타일 가이드

> 참조 디자인: 네이버 뉴스 포털 UI 분석 기반

---

## 1. 색상 시스템 (Color System)

### Primary Colors

| 이름 | HEX | 용도 |
|------|-----|------|
| Primary Blue | `#0068C4` | 상단 GNB 배경, 주요 액션 버튼, 링크 hover |
| Primary Dark | `#003D7A` | Primary Blue hover/active 상태 |
| Primary Light | `#E8F2FF` | 선택된 탭 배경, 포커스 상태 |

### Neutral Colors

| 이름 | HEX | 용도 |
|------|-----|------|
| Gray 900 | `#1A1A1A` | 헤드라인, 주요 본문 텍스트 |
| Gray 700 | `#404040` | 부제목, 설명 텍스트 |
| Gray 500 | `#767676` | 날짜, 메타 정보, 비활성 텍스트 |
| Gray 300 | `#C4C4C4` | 구분선, 비활성 아이콘 |
| Gray 100 | `#F5F5F5` | 카드 배경, 사이드바 배경 |
| White | `#FFFFFF` | 기본 페이지 배경, 카드 배경 |

### Semantic Colors

| 이름 | HEX | 용도 |
|------|-----|------|
| Success Green | `#03C75A` | 완료 상태, 긍정 액션 |
| Danger Red | `#FF3838` | 긴급 뱃지(속보), 삭제 액션, 경고 |
| Warning Orange | `#FF6B35` | 주의 상태, 기한 임박 |
| Info Blue | `#0068C4` | 정보성 메시지 |
| Overdue Red | `#D93025` | 기한 초과 상태 표시 |

### Status Colors (Todo 전용)

| 상태 | 배경색 | 텍스트색 | 용도 |
|------|--------|----------|------|
| NOT_STARTED | `#F5F5F5` | `#767676` | 시작 전 |
| IN_PROGRESS | `#E8F2FF` | `#0068C4` | 진행 중 |
| OVERDUE | `#FFF0F0` | `#D93025` | 기한 초과 |
| COMPLETED_SUCCESS | `#F0FFF4` | `#03C75A` | 성공 완료 |
| COMPLETED_FAILURE | `#FFF5F5` | `#FF3838` | 실패 완료 |

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
- 좌측: 로고
- 중앙: 주요 메뉴 (엔터, 스포츠, 날씨, 프리미엄)
- 우측: 로그인, 앱 아이콘, 검색

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
```css
background: #0068C4;
color: #FFFFFF;
border: none;
border-radius: 4px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
```

#### Secondary (구독) 버튼
```css
background: #FFFFFF;
color: #0068C4;
border: 1px solid #0068C4;
border-radius: 20px;  /* pill shape */
padding: 4px 10px;
font-size: 12px;
font-weight: 500;
```

호버 시: `background: #E8F2FF`

#### Ghost 버튼
```css
background: transparent;
color: #404040;
border: 1px solid #C4C4C4;
border-radius: 4px;
padding: 6px 12px;
font-size: 13px;
```

#### 더 알아보기 버튼 (Dark CTA)
```css
background: #404040;
color: #FFFFFF;
border-radius: 4px;
padding: 10px 20px;
font-size: 14px;
font-weight: 500;
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

| 요소 | 기본 | 호버 |
|------|------|------|
| 링크 텍스트 | Gray 900 | Primary Blue |
| 카드 | 섀도 없음 | Level 1 섀도 |
| 버튼 Primary | `#0068C4` | `#003D7A` |
| 구독 버튼 | White | `#E8F2FF` |
| 탭 | Gray 700 | Primary Blue |

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

## 12. 다크모드 고려사항

| 라이트 | 다크 |
|--------|------|
| White `#FFFFFF` | `#1A1A2E` |
| Gray 100 `#F5F5F5` | `#16213E` |
| Gray 900 `#1A1A1A` | `#E0E0E0` |
| Primary Blue `#0068C4` | `#4DA3FF` |
| 보더 `#E0E0E0` | `#2A2A3E` |

> 초기 릴리즈는 라이트모드만 구현, 추후 `prefers-color-scheme` 미디어 쿼리로 확장

---

## 13. CSS 커스텀 프로퍼티 (Design Tokens)

```css
:root {
  /* Colors */
  --color-primary: #0068C4;
  --color-primary-dark: #003D7A;
  --color-primary-light: #E8F2FF;
  --color-success: #03C75A;
  --color-danger: #FF3838;
  --color-warning: #FF6B35;
  --color-overdue: #D93025;

  --color-gray-900: #1A1A1A;
  --color-gray-700: #404040;
  --color-gray-500: #767676;
  --color-gray-300: #C4C4C4;
  --color-gray-100: #F5F5F5;
  --color-white: #FFFFFF;

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
