import { useAuditLogFilterState } from '@domains/audit-logs/hooks/use-audit-log-filter-state';
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
  '@routes/(authenticated)/$organizationSlug/audit-logs/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/audit-logs/index')
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

describe('useAuditLogFilterState', () => {
  beforeEach(() => {
    mockSearchParams = {};
    mockNavigate.mockClear();
  });

  function renderFilterState() {
    return renderHook(() => useAuditLogFilterState(), {
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
      action: 'create',
      resourceType: 'device',
      fromDate: '2026-01-01',
    };
    const { result } = renderFilterState();
    expect(result.current.activeFilterCount).toBe(3);
  });

  it('builds an action chip with capitalized label', () => {
    mockSearchParams = { action: 'create' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'action', label: 'Action', value: 'Create' },
    ]);
  });

  it('builds a resourceType chip with known label', () => {
    mockSearchParams = { resourceType: 'device' };
    const { result } = renderFilterState();
    expect(result.current.chips).toContainEqual(
      expect.objectContaining({ key: 'resourceType', label: 'Resource' }),
    );
  });

  it('falls back to raw resourceType value for unknown type', () => {
    mockSearchParams = { resourceType: 'unknown_resource_type' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      {
        key: 'resourceType',
        label: 'Resource',
        value: 'unknown_resource_type',
      },
    ]);
  });

  it('builds a fromDate chip', () => {
    mockSearchParams = { fromDate: '2026-01-01' };
    const { result } = renderFilterState();
    expect(result.current.chips).toEqual([
      { key: 'fromDate', label: 'Date', value: 'Custom range' },
    ]);
  });

  describe('navigateFilter', () => {
    it('navigates with updates and resets page to 1', () => {
      const { result } = renderFilterState();
      result.current.navigateFilter({ action: 'delete' });
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({ page: 3, size: 25, action: 'create' });
      expect(next).toEqual({ page: 1, size: 25, action: 'delete' });
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
        action: 'create',
        resourceType: 'device',
      });
      expect(next).toEqual({ page: 1, size: 50 });
    });
  });

  describe('removeFilter', () => {
    it('clears fromDate and toDate when removing fromDate', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('fromDate');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        fromDate: '2026-01-01',
        toDate: '2026-02-01',
      });
      expect(next).toEqual({
        page: 1,
        size: 25,
        fromDate: undefined,
        toDate: undefined,
      });
    });

    it('clears a single filter key for non-fromDate keys', () => {
      const { result } = renderFilterState();
      result.current.removeFilter('action');
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      });
      const searchFn = getLastNavigateSearchFn();
      const next = searchFn({
        page: 2,
        size: 25,
        action: 'create',
        resourceType: 'device',
      });
      expect(next).toEqual({
        page: 1,
        size: 25,
        action: undefined,
        resourceType: 'device',
      });
    });
  });
});
