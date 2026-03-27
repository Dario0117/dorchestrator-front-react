import { useTerminalSessionActiveFilterCount } from '@domains/terminal/hooks/use-terminal-session-active-filter-count';
import { renderHook } from '@testing-library/react';

const mockUseSearch = vi.fn();
vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index',
  () => ({
    Route: { useSearch: () => mockUseSearch() },
  }),
);

describe('useTerminalSessionActiveFilterCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 when no filters active', () => {
    mockUseSearch.mockReturnValue({
      status: undefined,
      deviceId: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(0);
  });

  it('counts status filter', () => {
    mockUseSearch.mockReturnValue({
      status: 'active',
      deviceId: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(1);
  });

  it('counts deviceId filter', () => {
    mockUseSearch.mockReturnValue({
      status: undefined,
      deviceId: 'device-1',
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(1);
  });

  it('counts userId filter', () => {
    mockUseSearch.mockReturnValue({
      status: undefined,
      deviceId: undefined,
      userId: 'user-1',
      dateFrom: undefined,
      dateTo: undefined,
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(1);
  });

  it('counts date range as single filter (dateFrom only)', () => {
    mockUseSearch.mockReturnValue({
      status: undefined,
      deviceId: undefined,
      userId: undefined,
      dateFrom: '2025-01-01',
      dateTo: undefined,
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(1);
  });

  it('counts date range as single filter (dateTo only)', () => {
    mockUseSearch.mockReturnValue({
      status: undefined,
      deviceId: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: '2025-12-31',
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(1);
  });

  it('counts multiple filters', () => {
    mockUseSearch.mockReturnValue({
      status: 'active',
      deviceId: 'device-1',
      userId: 'user-1',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    const { result } = renderHook(() => useTerminalSessionActiveFilterCount());

    expect(result.current).toBe(4);
  });
});
