import { AppSidebar } from '@components/layout/app-sidebar';
import { SidebarProvider } from '@components/ui/sidebar';
import { LayoutProvider } from '@context/layout.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

vi.mock('@tanstack/react-router', () => ({
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
}));
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
  it('should render sidebar', () => {
    const { container } = renderAppSidebar();

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();
  });

  it('should render team switcher', () => {
    renderAppSidebar();

    expect(screen.getByText('Dorchestrator')).toBeInTheDocument();
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

    expect(screen.getByText('Dorchestrator')).toBeInTheDocument();
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
