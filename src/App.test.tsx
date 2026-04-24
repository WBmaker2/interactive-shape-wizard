import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the shape wizard title and controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '요리조리 도형 변신 마법사' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '도형 변신 알림' })).not.toHaveTextContent('앗!');
    expect(screen.getByRole('button', { name: '삼각형' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '사각형' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /처음 모양/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /자석 도움 켜짐/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /정삼각형 맞추기/ })).toBeInTheDocument();
  });

  it('switches between triangle and quadrilateral modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: '삼각형' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /사각형/ }));

    expect(screen.getByRole('heading', { name: '사각형' })).toBeInTheDocument();
    expect(screen.getByText(/꼭짓점 A, B, C, D/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /정사각형 맞추기/ })).toBeInTheDocument();
  });

  it('shows the celebration only while the current shape still matches', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '사각형' }));
    await user.click(screen.getByRole('button', { name: /정사각형 맞추기/ }));

    expect(screen.getByText('앗! 정사각형으로 변신 완료!')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /처음 모양/ }));

    expect(screen.getByRole('status', { name: '도형 변신 알림' })).toBeInTheDocument();
    expect(screen.queryByText('앗! 정사각형으로 변신 완료!')).not.toBeInTheDocument();
  });

  it('keeps the celebration visible while the exact shape remains matched', async () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '사각형' }));
    fireEvent.click(screen.getByRole('button', { name: /정사각형 맞추기/ }));

    expect(screen.getByText('앗! 정사각형으로 변신 완료!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('앗! 정사각형으로 변신 완료!')).toBeInTheDocument();
  });
});
