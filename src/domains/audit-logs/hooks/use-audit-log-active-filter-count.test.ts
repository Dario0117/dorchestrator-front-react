import { useAuditLogActiveFilterCount } from '@domains/audit-logs/hooks/use-audit-log-active-filter-count';
import { renderHook } from '@testing-library/react';

let mockSearchParams: Record<string, unknown> = { page: 1, size: 25 };

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

describe('useAuditLogActiveFilterCount', () => {
  beforeEach(() => {
    mockSearchParams = { page: 1, size: 25 };
  });

  it('should return 0 when no filters are active', () => {
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(0);
  });

  it('should count action filter', () => {
    mockSearchParams = { page: 1, size: 25, action: 'created' };
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(1);
  });

  it('should count resourceType filter', () => {
    mockSearchParams = { page: 1, size: 25, resourceType: 'device' };
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(1);
  });

  it('should count date range as one filter when fromDate is set', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      fromDate: '2026-01-01T00:00:00.000Z',
    };
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(1);
  });

  it('should count date range as one filter when toDate is set', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      toDate: '2026-01-31T23:59:59.999Z',
    };
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(1);
  });

  it('should count all filters when all are active', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      action: 'deleted',
      resourceType: 'command',
      fromDate: '2026-01-01T00:00:00.000Z',
      toDate: '2026-01-31T23:59:59.999Z',
    };
    const { result } = renderHook(() => useAuditLogActiveFilterCount());
    expect(result.current).toBe(3);
  });
});
