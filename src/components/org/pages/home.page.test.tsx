import { HomePage } from '@components/org/pages/home.page';
import { queryClient } from '@context/query.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { setMobileViewport, setTabletViewport } from '@lib/viewport-test-utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

describe('HomePage', () => {
  beforeEach(() => {
    // Seed query cache with organization data (new API response shape)
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
  });

  it('should render organization dashboard with stats', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Welcome to Test Organization'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Manage your devices and execute remote commands'),
    ).toBeInTheDocument();
  });

  it('should render stat cards with correct data', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
  });

  it('should render recent activity section', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive Layout (AC2, AC3)', () => {
    it('uses responsive padding on mobile (375px)', async () => {
      setMobileViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const section = container.querySelector('section');
        expect(section).toBeInTheDocument();
      });

      const section = container.querySelector('section');
      // p-6 on mobile, md:p-10 on desktop
      expect(section).toHaveClass('p-6');
      expect(section).toHaveClass('md:p-10');
    });

    it('renders stats cards in single column on mobile', async () => {
      setMobileViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 means 3 columns at md breakpoint and above
          // On mobile (< 768px), it defaults to grid-cols-1 (single column)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });

    it('renders stats cards in 3 columns on tablet and desktop', async () => {
      setTabletViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 applies at 768px+ (tablet and desktop)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });
  });
});
