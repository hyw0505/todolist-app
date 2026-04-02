export interface ThemeColors {
  // Surface
  surface0: string;   // 페이지 배경
  surface1: string;   // 카드/모달 배경
  surface2: string;   // 서브 배경 (필터 바, 사이드바)

  // Border
  border: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Semantic
  success: string;
  danger: string;
  warning: string;
  overdue: string;

  // Shadows
  shadow1: string;
  shadow2: string;

  // Special
  gnbBg: string;
  overlayBg: string;

  // Status badge colors
  statusNotStartedBg: string;
  statusNotStartedText: string;
  statusNotStartedBorder: string;
  statusInProgressBg: string;
  statusInProgressText: string;
  statusInProgressBorder: string;
  statusOverdueBg: string;
  statusOverdueText: string;
  statusOverdueBorder: string;
  statusCompletedSuccessBg: string;
  statusCompletedSuccessText: string;
  statusCompletedSuccessBorder: string;
  statusCompletedFailureBg: string;
  statusCompletedFailureText: string;
  statusCompletedFailureBorder: string;

  // Input shadows
  inputFocusShadow: string;
  inputErrorShadow: string;

  // Card background per status
  cardBgNotStarted: string;
  cardBgInProgress: string;
  cardBgOverdue: string;
  cardBgCompletedSuccess: string;
  cardBgCompletedFailure: string;
}

export const LIGHT_COLORS: ThemeColors = {
  surface0: '#FFFFFF',
  surface1: '#FFFFFF',
  surface2: '#F5F5F5',
  border: '#E0E0E0',
  borderStrong: '#C4C4C4',
  textPrimary: '#1A1A1A',
  textSecondary: '#404040',
  textMuted: '#767676',
  primary: '#0068C4',
  primaryDark: '#003D7A',
  primaryLight: '#E8F2FF',
  success: '#03C75A',
  danger: '#FF3838',
  warning: '#FF6B35',
  overdue: '#D93025',
  shadow1: '0 2px 8px rgba(0, 0, 0, 0.12)',
  shadow2: '0 4px 16px rgba(0, 0, 0, 0.16)',
  gnbBg: '#0068C4',
  overlayBg: 'rgba(0, 0, 0, 0.50)',

  statusNotStartedBg: '#F5F5F5',
  statusNotStartedText: '#767676',
  statusNotStartedBorder: '#C4C4C4',
  statusInProgressBg: '#E8F2FF',
  statusInProgressText: '#0068C4',
  statusInProgressBorder: '#0068C4',
  statusOverdueBg: '#FFF0F0',
  statusOverdueText: '#D93025',
  statusOverdueBorder: '#D93025',
  statusCompletedSuccessBg: '#F0FFF4',
  statusCompletedSuccessText: '#03C75A',
  statusCompletedSuccessBorder: '#03C75A',
  statusCompletedFailureBg: '#FFF5F5',
  statusCompletedFailureText: '#FF3838',
  statusCompletedFailureBorder: '#FF3838',

  inputFocusShadow: '0 0 0 3px rgba(0,104,196,0.15)',
  inputErrorShadow: '0 0 0 3px rgba(255,56,56,0.15)',

  cardBgNotStarted: '#FFFFFF',
  cardBgInProgress: '#FFFFFF',
  cardBgOverdue: '#FFF8F8',
  cardBgCompletedSuccess: '#F8FFF8',
  cardBgCompletedFailure: '#FFFFFF',
};

export const DARK_COLORS: ThemeColors = {
  surface0: '#121212',
  surface1: '#1E1E1E',
  surface2: '#2A2A2A',
  border: '#3A3A3A',
  borderStrong: '#555555',
  textPrimary: '#E8E8E8',
  textSecondary: '#AAAAAA',
  textMuted: '#6E6E6E',
  primary: '#4DA3FF',
  primaryDark: '#2980E8',
  primaryLight: '#1A2E47',
  success: '#1FD67A',
  danger: '#FF6B6B',
  warning: '#FF8C5A',
  overdue: '#F05A50',
  shadow1: '0 2px 8px rgba(0, 0, 0, 0.40)',
  shadow2: '0 4px 16px rgba(0, 0, 0, 0.50)',
  gnbBg: '#1A2E47',
  overlayBg: 'rgba(0, 0, 0, 0.70)',

  statusNotStartedBg: '#2A2A2A',
  statusNotStartedText: '#6E6E6E',
  statusNotStartedBorder: '#555555',
  statusInProgressBg: '#1A2E47',
  statusInProgressText: '#4DA3FF',
  statusInProgressBorder: '#4DA3FF',
  statusOverdueBg: '#2E1A1A',
  statusOverdueText: '#F05A50',
  statusOverdueBorder: '#F05A50',
  statusCompletedSuccessBg: '#1A2E22',
  statusCompletedSuccessText: '#1FD67A',
  statusCompletedSuccessBorder: '#1FD67A',
  statusCompletedFailureBg: '#2E1A1A',
  statusCompletedFailureText: '#FF6B6B',
  statusCompletedFailureBorder: '#FF6B6B',

  inputFocusShadow: '0 0 0 3px rgba(77, 163, 255, 0.25)',
  inputErrorShadow: '0 0 0 3px rgba(255, 107, 107, 0.25)',

  cardBgNotStarted: '#1E1E1E',
  cardBgInProgress: '#1E1E1E',
  cardBgOverdue: '#2E1A1A',
  cardBgCompletedSuccess: '#1A2E22',
  cardBgCompletedFailure: '#2E1A1A',
};
