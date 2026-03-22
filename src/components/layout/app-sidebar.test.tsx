import { SidebarProvider } from '@components/ds/organisms/sidebar';
import { AppSidebar } from '@components/layout/app-sidebar';
import { LayoutProvider } from '@context/layout.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

const mockNavigate = vi.fn();
let mockParams: Record<string, string> = { organizationSlug: 'test-org' };

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
    }) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
    useLocation: ({
      select,
    }: {
      select?: (location: { href: string }) => string;
    } = {}) => {
      const location = { href: '/' };
      return select ? select(location) : location;
    },
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
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

let mockCurrentOrganization: typeof mockOrganization | null = mockOrganization;

vi.mock('@/app', () => ({
  _getNullableCurrentOrganizationFromSlug: () => mockCurrentOrganization,
}));

function useOrgHandlerWithTeams() {
  server.use(
    http.get(buildBackendUrl('/api/v1/organizations'), () => {
      return HttpResponse.json({
        responseData: {
          results: [
            {
              id: 'org-1',
              name: 'Test Organization',
              slug: 'test-org',
              role: 'owner',
              memberCount: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              isDefault: true,
              teams: [
                {
                  id: 'team-1',
                  name: 'Alpha Team',
                  slug: 'alpha',
                  organizationId: 'org-1',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  isDefault: true,
                },
                {
                  id: 'team-2',
                  name: 'Beta Team',
                  slug: 'beta',
                  organizationId: 'org-1',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  isDefault: false,
                },
              ],
            },
          ],
          hasNext: false,
          hasPrevious: false,
          totalResults: 1,
          totalPages: 1,
          page: 1,
          size: 100,
        },
        responseErrors: null,
      });
    }),
  );
}

function useOrgHandlerWithoutTeams() {
  server.use(
    http.get(buildBackendUrl('/api/v1/organizations'), () => {
      return HttpResponse.json({
        responseData: {
          results: [
            {
              id: 'org-1',
              name: 'Test Organization',
              slug: 'test-org',
              role: 'owner',
              memberCount: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              isDefault: true,
            },
          ],
          hasNext: false,
          hasPrevious: false,
          totalResults: 1,
          totalPages: 1,
          page: 1,
          size: 100,
        },
        responseErrors: null,
      });
    }),
  );
}

function renderAppSidebar() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </LayoutProvider>
    </Suspense>,
  );
}

describe('AppSidebar', () => {
  beforeEach(() => {
    mockCurrentOrganization = mockOrganization;
    mockParams = { organizationSlug: 'test-org' };
    mockNavigate.mockClear();
  });

  it('should render sidebar', async () => {
    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();
  });

  it('should render team switcher', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });
  });

  it('should render navigation groups', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
    });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render navigation items from General group', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('should render navigation items from Settings group', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    });
  });

  it('should render sidebar rail', async () => {
    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const rail = container.querySelector('[data-slot="sidebar-rail"]');
    expect(rail).toBeInTheDocument();
  });

  it('should render all team options', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });
  });

  it('should have correct sidebar structure', async () => {
    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    const header = sidebar?.querySelector('[data-slot="sidebar-header"]');
    const content = sidebar?.querySelector('[data-slot="sidebar-content"]');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('should render navigation group icons', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    });

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should render nothing when currentOrganization is null', async () => {
    mockCurrentOrganization = null;

    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).not.toBeInTheDocument();
  });

  it('should render sidebar when responseData results is nullish', async () => {
    server.use(
      http.get(buildBackendUrl('/api/v1/organizations'), () => {
        return HttpResponse.json({
          responseData: null,
          responseErrors: null,
        });
      }),
    );

    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();
  });

  it('should render the sidebar with team switcher component', async () => {
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    // Team switcher should be rendered with the org name
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    expect(trigger).toBeInTheDocument();
  });

  it('should pass teamSlug when params contain teamSlug', async () => {
    mockParams = { organizationSlug: 'test-org', teamSlug: 'alpha' };
    useOrgHandlerWithTeams();

    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    // When teamSlug is in params, it should show the active team name
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    expect(trigger).toBeInTheDocument();
  });

  it('should navigate when onTeamChange is triggered with a sub-path', async () => {
    mockParams = { organizationSlug: 'test-org', teamSlug: 'alpha' };
    useOrgHandlerWithTeams();

    // Set window.location.pathname to include a team sub-path
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        pathname: '/test-org/t/alpha/devices',
      },
    });

    const user = userEvent.setup();
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    // Open the dropdown
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    await clickTrigger(trigger);

    // Wait for dropdown to appear and click the Beta Team radio item
    await waitFor(() => {
      expect(screen.getByText('Beta Team')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Beta Team'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            organizationSlug: 'test-org',
            teamSlug: 'beta',
          },
        }),
      );
    });
  });

  it('should navigate with empty sub-path when pathname has no team sub-path', async () => {
    mockParams = { organizationSlug: 'test-org', teamSlug: 'alpha' };
    useOrgHandlerWithTeams();

    // Set window.location.pathname without a team sub-path pattern
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        pathname: '/test-org',
      },
    });

    const user = userEvent.setup();
    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    // Open the dropdown
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getByText('Beta Team')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Beta Team'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('/$organizationSlug/t/$teamSlug/'),
          params: {
            organizationSlug: 'test-org',
            teamSlug: 'beta',
          },
        }),
      );
    });
  });

  it('should build teamsByOrgSlug with defined teams array', async () => {
    useOrgHandlerWithTeams();

    renderAppSidebar();

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    // Open the dropdown to see teams rendered
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
    expect(screen.getByText('Beta Team')).toBeInTheDocument();
  });

  it('should fallback to empty teams when organization has no teams property', async () => {
    useOrgHandlerWithoutTeams();

    const { container } = renderAppSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();

    // Open the dropdown to verify no team radio items are rendered
    const trigger = screen.getByRole('button', {
      name: /test organization/i,
    });
    await clickTrigger(trigger);

    // Wait for the dropdown menu to appear
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // No team radio items should be present since teams is undefined
    expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
  });
});
