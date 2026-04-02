/**
 * Date 객체 또는 ISO 문자열을 YYYY-MM-DD 형식으로 반환
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 "YYYY년 MM월 DD일" 형식으로 반환
 */
export function formatDateKorean(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 두 날짜 문자열(YYYY-MM-DD) 사이의 D-day 계산
 * 오늘 기준 dueDate까지 남은 일수. 음수면 초과.
 */
export function getDaysUntil(dueDate: string): number {
  const today = getTodayString();
  const todayMs = new Date(today).getTime();
  const dueMs = new Date(dueDate).getTime();
  const diffMs = dueMs - todayMs;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayString(): string {
  return formatDate(new Date());
}
