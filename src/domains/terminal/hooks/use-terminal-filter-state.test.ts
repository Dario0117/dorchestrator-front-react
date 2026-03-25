import { useTerminalFilterState } from '@domains/terminal/hooks/use-terminal-filter-state';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { renderHook } from '@testing-library/react';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

let mockSearchParams: Record<string, unknown> = {};

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => mockSearchParams),
      },
    };
  },
);

describe('useTerminalFilterState', () => {
  beforeEach(() => {
    mockSearchParams = {};
    mockNavigate.mockClear();
  });

  function renderFilterState() {
    return renderHook(() => useTerminalFilterState(), {
      wrapper: createQueryThemeWrapper(),
    });
  }

  function getLastNavigateSearchFn() {
    const calls = mockNavigate.mock.calls;
    const lastCall = calls[calls.length - 1] as [
      { search: (...args: unknown[]) => unknown },
    ];
    return lastCall[0].search as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
  }

  it('returns zero active filters when no search params are set', () => {
    const { result } = renderFilterState();
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.chips).toEqual([]);
  });

  it('counts active filters correctly', () => {
    mockSearchParams = {
      status: 'active',
      deviceId: 42,
      userId: 'user-1',
      dateFrom: '2026-01-01',
    };
    const { result } = renderFilterState();
    expect(result.current.activeFilterCount).toBe(4);
  });

  it('builds a status chip with known label', () => {
    mockSearchParams = { status: 'active' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'status', label: 'Status', value: 'Active' },
    ]);
  });

  it('falls back to raw status value for unknown status', () => {
    mockSearchParams = { status: 'unknown-status' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'status', label: 'Status', value: 'unknown-status' },
    ]);
  });

  it('builds a deviceId chip', () => {
    mockSearchParams = { deviceId: 7 };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'deviceId', label: 'Device', value: '7' },
    ]);
  });

  it('builds a userId chip', () => {
    mockSearchParams = { userId: 'user-abc' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'userId', label: 'User', value: 'user-abc' },
    ]);
  });

  it('builds a dateFrom chip', () => {
    mockSearchParams = { dateFrom: '2026-01-01' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'dateFrom', label: 'Date', value: 'Custom range' },
    ]);
  });

  describe('navigateFilter', () => {
    it('navigates with updates and resets page to 1', () => {
      const { result } = renderFilterState();
      result.current.navigateFilter({ status: 'locked' });
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({ page: 3, size: 25, status: 'active' });
      expect(next).toEqual({ page: 1, size: 25, status: 'locked' });
    });
  });

  describe('clearFilters', () => {
    it('navigates keeping only page and size', () => {
      const { result } = renderFilterState();
      result.current.clearFilters();
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 5,
        size: 50,
        status: 'active',
        deviceId: 1,
      });
      expect(next).toEqual({ page: 1, size: 50 });
    });
  });

  describe('removeFilter', () => {
    it('clears dateFrom and dateTo when removing dateFrom', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('dateFrom');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        dateFrom: '2026-01-01',
        dateTo: '2026-02-01',
      });
      expect(next).toEqual({
        page: 1,
        size: 25,
        dateFrom: undefined,
        dateTo: undefined,
      });
    });

    it('clears a single filter key for non-dateFrom keys', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('status');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        status: 'active',
        deviceId: 1,
      });
      expect(next).toEqual({
        page: 1,
        size: 25,
        status: undefined,
        deviceId: 1,
      });
    });
  });
});
