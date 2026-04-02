import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('isOpen=false 시 렌더링되지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>내용</p>
      </Modal>,
    );
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('isOpen=true 시 title과 children이 렌더링된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="모달 제목">
        <p>모달 내용</p>
      </Modal>,
    );
    expect(screen.getByText('모달 제목')).toBeInTheDocument();
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('backdrop 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="제목">
        <p>내용</p>
      </Modal>,
    );
    // backdrop은 고정된 포지션의 최상위 div
    const backdrop = screen.getByText('내용').closest('[style*="fixed"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키를 누르면 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="제목">
        <p>내용</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="제목">
        <p>내용</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
