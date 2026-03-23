import { useFontSize } from '@domains/terminal/hooks/use-font-size';
import { act, renderHook } from '@testing-library/react';

describe('useFontSize', () => {
  it('should initialize with default font size (14)', () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe(14);
  });

  it('should initialize with custom font size', () => {
    const { result } = renderHook(() => useFontSize(18));
    expect(result.current.fontSize).toBe(18);
  });

  it('should increase font size by 2', () => {
    const { result } = renderHook(() => useFontSize(14));
    act(() => result.current.increase());
    expect(result.current.fontSize).toBe(16);
  });

  it('should decrease font size by 2', () => {
    const { result } = renderHook(() => useFontSize(14));
    act(() => result.current.decrease());
    expect(result.current.fontSize).toBe(12);
  });

  it('should not exceed max font size (24)', () => {
    const { result } = renderHook(() => useFontSize(24));
    act(() => result.current.increase());
    expect(result.current.fontSize).toBe(24);
  });

  it('should not go below min font size (10)', () => {
    const { result } = renderHook(() => useFontSize(10));
    act(() => result.current.decrease());
    expect(result.current.fontSize).toBe(10);
  });
});
