import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { renderHook } from '@testing-library/react';

const mockOrganization = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

const mockUseParams = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

describe('useCurrentOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Seed the query cache with organizations data (new API response shape)
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });

    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should return current organization from router context', () => {
    const { result } = renderHook(() => useCurrentOrganization());

    expect(result.current).toEqual(mockOrganization);
  });

  it('should return organization with correct properties', () => {
    const { result } = renderHook(() => useCurrentOrganization());

    expect(result.current).toHaveProperty('id');
    expect(result.current).toHaveProperty('name');
    expect(result.current).toHaveProperty('slug');
    expect(result.current).toHaveProperty('createdAt');
  });

  it('should return organization with correct id', () => {
    const { result } = renderHook(() => useCurrentOrganization());

    expect(result.current.id).toBe('org-123');
  });

  it('should return organization with correct name', () => {
    const { result } = renderHook(() => useCurrentOrganization());

    expect(result.current.name).toBe('Test Organization');
  });

  it('should return organization with correct slug', () => {
    const { result } = renderHook(() => useCurrentOrganization());

    expect(result.current.slug).toBe('test-org');
  });

  it('should throw error when organizationSlug is not in params', () => {
    mockUseParams.mockReturnValue({});

    expect(() => renderHook(() => useCurrentOrganization())).toThrow(
      'useCurrentOrganization must be used within a route with organizationSlug param',
    );
  });
});
