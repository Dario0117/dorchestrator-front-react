import { BottomNav } from '@components/ds/organisms/bottom-nav';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useRouterState: () => ({
      location: { pathname: '/test-org/t/test-team/devices' },
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

  it('opens more sheet when More button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BottomNav basePath="/test-org/t/test-team" />);

    await user.click(screen.getByLabelText('More navigation options'));

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
