import { AppSidebar } from '@components/layout/app-sidebar';
import { SidebarProvider } from '@components/ui/sidebar';
import { LayoutProvider } from '@context/layout.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

const mockNavigate = vi.fn();

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

let mockCurrentOrganization: typeof mockOrganization | null = mockOrganization;

vi.mock('@/app', () => ({
  _getNullableCurrentOrganizationFromSlug: () => mockCurrentOrganization,
}));

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
});
