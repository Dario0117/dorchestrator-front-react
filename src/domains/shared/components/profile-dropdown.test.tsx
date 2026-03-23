import { ProfileDropdown } from '@domains/shared/components/profile-dropdown';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Suspense } from 'react';

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
  }) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ href: '/' }),
  useRouter: () => ({
    navigate: vi.fn(),
  }),
}));

describe('ProfileDropdown', () => {
  // No beforeEach needed - using real profile query with MSW handler

  it('should render profile avatar button', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('should render avatar fallback', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('should open dropdown menu when avatar is clicked', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    const button = screen.getByRole('button');
    await clickTrigger(button);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render menu items', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    const button = screen.getByRole('button');
    await clickTrigger(button);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('New Team')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('should open sign out dialog when sign out is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    const button = screen.getByRole('button');
    await clickTrigger(button);
    const signOutItem = screen.getByText('Sign out');
    await user.click(signOutItem);
    expect(
      await screen.findByText('Sign out', {
        selector: '[data-slot="alert-dialog-title"]',
      }),
    ).toBeInTheDocument();
  });

  it('should render profile links', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileDropdown />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    const button = screen.getByRole('button');
    await clickTrigger(button);
    const profileLink = screen.getByText('Profile').closest('a');
    const billingLink = screen.getByText('Billing').closest('a');
    const settingsLink = screen.getByText('Settings').closest('a');
    expect(profileLink).toBeInTheDocument();
    expect(billingLink).toBeInTheDocument();
    expect(settingsLink).toBeInTheDocument();
  });
});
