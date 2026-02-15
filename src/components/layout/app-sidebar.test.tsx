import { AppSidebar } from '@components/layout/app-sidebar';
import { SidebarProvider } from '@components/ui/sidebar';
import { LayoutProvider } from '@context/layout.provider';
import { queryClient } from '@context/query.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen } from '@testing-library/react';

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
function renderAppSidebar() {
  return renderWithProviders(
    <LayoutProvider>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </LayoutProvider>,
  );
}

describe('AppSidebar', () => {
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
  it('should render sidebar', () => {
    const { container } = renderAppSidebar();

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();
  });

  it('should render team switcher', () => {
    renderAppSidebar();

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should render navigation groups', () => {
    renderAppSidebar();

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render navigation items from General group', () => {
    renderAppSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('should render navigation items from Settings group', () => {
    renderAppSidebar();

    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
  });

  it('should render sidebar rail', () => {
    const { container } = renderAppSidebar();

    const rail = container.querySelector('[data-slot="sidebar-rail"]');
    expect(rail).toBeInTheDocument();
  });

  it('should render all team options', () => {
    renderAppSidebar();

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should have correct sidebar structure', () => {
    const { container } = renderAppSidebar();

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    const header = sidebar?.querySelector('[data-slot="sidebar-header"]');
    const content = sidebar?.querySelector('[data-slot="sidebar-content"]');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('should render navigation group icons', () => {
    renderAppSidebar();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
