import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// i18n 모킹 (테스트 환경에서 실제 초기화 생략)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'languageSelector.label': '언어 선택',
        'languageSelector.ko': '한국어',
        'languageSelector.en': 'English',
        'languageSelector.jp': '日本語',
      };
      return translations[key] ?? key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// useLanguageStore 모킹
const mockSetLanguage = vi.fn();
let mockLanguage = 'ko';

vi.mock('@/shared/stores/useLanguageStore', () => ({
  useLanguageStore: () => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
  }),
}));

// useTheme 모킹
vi.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0068C4',
      surface1: '#FFFFFF',
      surface2: '#F5F5F5',
      border: '#E0E0E0',
      textPrimary: '#1A1A1A',
      textSecondary: '#767676',
    },
  }),
}));

import { LanguageSelector } from '../LanguageSelector';

describe('LanguageSelector', () => {
  beforeEach(() => {
    mockLanguage = 'ko';
    mockSetLanguage.mockClear();
  });

  it('현재 언어(ko)와 지구 아이콘을 표시한다', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('ko')).toBeInTheDocument();
  });

  it('aria-label이 언어 선택으로 설정된다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    expect(button).toBeInTheDocument();
  });

  it('초기 상태에서 드롭다운이 닫혀 있다', () => {
    render(<LanguageSelector />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('버튼 클릭 시 드롭다운이 열린다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('드롭다운에 한국어, English, 日本語 옵션이 표시된다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('언어 옵션 선택 시 setLanguage가 호출된다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    fireEvent.click(screen.getByText('English'));
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('언어 선택 후 드롭다운이 닫힌다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    fireEvent.click(screen.getByText('English'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('일본어(jp) 선택 시 setLanguage("jp")가 호출된다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    fireEvent.click(screen.getByText('日本語'));
    expect(mockSetLanguage).toHaveBeenCalledWith('jp');
  });

  it('현재 선택된 언어 옵션이 aria-selected="true"로 표시된다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    const options = screen.getAllByRole('option');
    const koOption = options.find((opt) => opt.getAttribute('aria-selected') === 'true');
    expect(koOption).toBeInTheDocument();
    expect(koOption?.textContent).toBe('한국어');
  });

  it('버튼을 다시 클릭하면 드롭다운이 닫힌다', () => {
    render(<LanguageSelector />);
    const button = screen.getByRole('button', { name: '언어 선택' });
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
