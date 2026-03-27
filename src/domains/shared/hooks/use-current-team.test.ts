import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import {
  useActiveTeam,
  useCurrentTeam,
} from '@domains/shared/hooks/use-current-team';
import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { renderHook } from '@testing-library/react';

const mockTeam = {
  id: 'team-1',
  name: 'Default Team',
  slug: 'default',
  organizationId: 'org-1',
};

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
  teams: [mockTeam],
};

const mockUseParams = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

function seedQueryCache() {
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
}

describe('useCurrentTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedQueryCache();
    mockUseParams.mockReturnValue({
      organizationSlug: 'test-org',
      teamSlug: 'default',
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('returns the current team from URL params', () => {
    const { result } = renderHook(() => useCurrentTeam());
    expect(result.current).toEqual(mockTeam);
  });

  it('throws when teamSlug is not in params', () => {
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
    expect(() => renderHook(() => useCurrentTeam())).toThrow(
      'useCurrentTeam must be used within a route with teamSlug param',
    );
  });
});

describe('useActiveTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedQueryCache();
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
    useNavigationStore.getState().setActiveTeam('test-org', 'default');
  });

  afterEach(() => {
    useNavigationStore.getState().clear();
    queryClient.clear();
  });

  it('returns the active team from the navigation store', () => {
    const { result, unmount } = renderHook(() => useActiveTeam());
    expect(result.current).toEqual(mockTeam);
    unmount();
  });

  it('throws when no active team is set for the org', () => {
    useNavigationStore.setState({ teamByOrg: {} });
    expect(() => renderHook(() => useActiveTeam())).toThrow(
      'useActiveTeam: no active team found in navigation store',
    );
  });
});
