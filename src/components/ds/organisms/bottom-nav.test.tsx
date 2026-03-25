import { BottomNav } from '@components/ds/organisms/bottom-nav';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let mockPathname = '/test-org/t/test-team/devices';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useRouterState: () => ({
      location: { pathname: mockPathname },
    }),
    Link: ({
      children,
      to,
      ...props
    }: { children: React.ReactNode; to: string } & Record<string, unknown>) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname = '/test-org/t/test-team/devices';
  });

  it('renders 5 navigation items including More', () => {
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('has aria-label Main on navigation', () => {
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    expect(screen.getByLabelText('Main')).toBeInTheDocument();
  });

  it('marks the active item with aria-current page', () => {
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    const devicesLink = screen.getByText('Devices').closest('a');
    expect(devicesLink).toHaveAttribute('aria-current', 'page');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });

  it('marks Dashboard as active when pathname has no page segment after team slug', () => {
    mockPathname = '/test-org/t/test-team';
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    const devicesLink = screen.getByText('Devices').closest('a');
    expect(devicesLink).not.toHaveAttribute('aria-current');
  });

  it('handles pathname without t segment gracefully', () => {
    mockPathname = '/test-org/settings';
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    // When there's no t segment, pageSegment resolves to empty string
    // so Dashboard (pathSegment '') is considered active
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    // Other items should not be active
    const devicesLink = screen.getByText('Devices').closest('a');
    expect(devicesLink).not.toHaveAttribute('aria-current');
  });

  it('opens more sheet when More button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    await user.click(screen.getByLabelText('More navigation options'));

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
