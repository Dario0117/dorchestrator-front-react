import { useCopyToClipboard } from '@hooks/use-copy-to-clipboard';
import { act, renderHook } from '@testing-library/react';

describe('useCopyToClipboard', () => {
  const writeTextMock = vi.fn<(data: string) => Promise<void>>();

  beforeEach(() => {
    writeTextMock.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    writeTextMock.mockReset();
    vi.useRealTimers();
  });

  it('should start with hasCopied false and copiedKey null', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.copiedKey).toBeNull();
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello'));

    expect(writeTextMock).toHaveBeenCalledWith('hello');
  });

  it('should set hasCopied to true after copying', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello'));

    expect(result.current.hasCopied).toBe(true);
  });

  it('should use text as copiedKey when no key provided', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello'));

    expect(result.current.copiedKey).toBe('hello');
  });

  it('should use provided key as copiedKey', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello', 'myKey'));

    expect(result.current.copiedKey).toBe('myKey');
  });

  it('should reset after 2 seconds', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello'));
    expect(result.current.hasCopied).toBe(true);

    act(() => vi.advanceTimersByTime(2000));

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.copiedKey).toBeNull();
  });

  it('should debounce rapid successive copies', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('first', 'key1'));
    expect(result.current.copiedKey).toBe('key1');

    act(() => vi.advanceTimersByTime(1000));

    await act(() => result.current.copy('second', 'key2'));
    expect(result.current.copiedKey).toBe('key2');

    // After 1 more second (2s from first copy), key should NOT be cleared
    // because the second copy reset the timer
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copiedKey).toBe('key2');

    // After 2s from the second copy, it should clear
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copiedKey).toBeNull();
  });

  it('should not set state when clipboard API fails', async () => {
    writeTextMock.mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy('hello'));

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.copiedKey).toBeNull();
  });
});
