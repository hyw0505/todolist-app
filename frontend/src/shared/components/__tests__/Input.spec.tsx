import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('label을 렌더링한다', () => {
    render(<Input label="이메일" value="" onChange={vi.fn()} />);
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('error 메시지를 표시한다', () => {
    render(<Input value="" onChange={vi.fn()} error="필수 입력 항목입니다" />);
    expect(screen.getByText('필수 입력 항목입니다')).toBeInTheDocument();
  });

  it('onChange 콜백이 호출된다', () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '테스트' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('포커스 시 isFocused 상태가 반영된다 (box-shadow 변경)', () => {
    render(<Input value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input).toHaveStyle({ boxShadow: '0 0 0 3px rgba(0,104,196,0.15)' });
  });

  it('블러 시 포커스 스타일이 해제된다', () => {
    render(<Input value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input).toHaveStyle({ boxShadow: 'none' });
  });

  it('에러 상태일 때 에러 box-shadow가 적용된다', () => {
    render(<Input value="" onChange={vi.fn()} error="오류" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ boxShadow: '0 0 0 3px rgba(255,56,56,0.15)' });
  });
});
