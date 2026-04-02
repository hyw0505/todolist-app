import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('primary variant를 렌더링한다', () => {
    render(<Button variant="primary">확인</Button>);
    const btn = screen.getByRole('button', { name: '확인' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveStyle({ backgroundColor: '#0068C4' });
  });

  it('disabled 상태에서 클릭해도 onClick이 호출되지 않는다', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>버튼</Button>);
    const btn = screen.getByRole('button', { name: '버튼' });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading 상태일 때 스피너가 표시된다', () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loading 상태일 때 버튼이 비활성화된다', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>로딩</Button>);
    const btn = screen.getByRole('button', { name: /로딩/ });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fullWidth 스타일이 적용된다', () => {
    render(<Button fullWidth>전체 너비</Button>);
    const btn = screen.getByRole('button', { name: '전체 너비' });
    expect(btn).toHaveStyle({ width: '100%' });
  });
});
