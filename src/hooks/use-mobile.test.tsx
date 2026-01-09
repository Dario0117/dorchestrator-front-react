import { useIsMobile } from '@hooks/use-mobile';
import { act, renderHook } from '@testing-library/react';

describe('useIsMobile', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    mockMatchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false for desktop width initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('should return true for mobile width initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return true for width exactly at breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767, // 768 - 1
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false for width just above breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should update when window width changes via media query listener', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate window resize to mobile width
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      });

      // Get the change listener that was registered
      const changeListener = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'change',
      )?.[1];

      if (changeListener) {
        changeListener();
      }
    });

    expect(result.current).toBe(true);
  });

  it('should update when window width changes from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    // Simulate window resize to desktop width
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      // Get the change listener that was registered
      const changeListener = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'change',
      )?.[1];

      if (changeListener) {
        changeListener();
      }
    });

    expect(result.current).toBe(false);
  });

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('should handle multiple renders correctly', () => {
    const { result, rerender } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);

    rerender();

    // Should not register additional event listeners
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  it('should work with edge case window sizes', () => {
    // Test with very small window
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 320,
    });

    const { result: smallResult } = renderHook(() => useIsMobile());
    expect(smallResult.current).toBe(true);

    // Test with very large window
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 2560,
    });

    const { result: largeResult } = renderHook(() => useIsMobile());
    expect(largeResult.current).toBe(false);
  });

  it('should handle undefined initial state correctly', () => {
    // Test initial undefined state behavior
    const { result } = renderHook(() => useIsMobile());

    // Hook should return false initially (based on !!isMobile where isMobile could be undefined)
    expect(typeof result.current).toBe('boolean');
  });
});
