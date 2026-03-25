import { useCommandFilterState } from '@domains/commands/hooks/use-command-filter-state';
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
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index')
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

describe('useCommandFilterState', () => {
  beforeEach(() => {
    mockSearchParams = {};
    mockNavigate.mockClear();
  });

  function renderFilterState() {
    return renderHook(() => useCommandFilterState(), {
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
      deviceId: 1,
      status: 'running',
      startDate: '2026-01-01',
      search: 'echo',
    };
    const { result } = renderFilterState();
    expect(result.current.activeFilterCount).toBe(4);
  });

  it('builds a status chip with known label', () => {
    mockSearchParams = { status: 'running' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'status', label: 'Status', value: 'Running' },
    ]);
  });

  it('falls back to raw status value for unknown status', () => {
    mockSearchParams = { status: 'unknown_status' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'status', label: 'Status', value: 'unknown_status' },
    ]);
  });

  it('builds a deviceId chip', () => {
    mockSearchParams = { deviceId: 42 };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'deviceId', label: 'Device', value: '42' },
    ]);
  });

  it('builds a startDate chip', () => {
    mockSearchParams = { startDate: '2026-01-01' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'startDate', label: 'Date', value: 'Custom range' },
    ]);
  });

  it('builds a search chip', () => {
    mockSearchParams = { search: 'echo hello' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'search', label: 'Search', value: 'echo hello' },
    ]);
  });

  it('exposes search value', () => {
    mockSearchParams = { search: 'ls' };
    const { result } = renderFilterState();
    expect(result.current.search).toBe('ls');
  });

  describe('navigateFilter', () => {
    it('navigates with updates and resets page to 1', () => {
      const { result } = renderFilterState();
      result.current.navigateFilter({ status: 'completed' });
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({ page: 3, size: 25, status: 'running' });
      expect(next).toEqual({ page: 1, size: 25, status: 'completed' });
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
        status: 'running',
        deviceId: 1,
      });
      expect(next).toEqual({ page: 1, size: 50 });
    });
  });

  describe('removeFilter', () => {
    it('clears startDate and endDate when removing startDate', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('startDate');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });
      expect(next).toEqual({
        page: 1,
        size: 25,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('clears a single filter key for non-startDate keys', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('status');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        status: 'running',
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
