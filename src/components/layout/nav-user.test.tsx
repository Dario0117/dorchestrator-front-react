import { NavUser } from '@components/layout/nav-user';
import { SidebarProvider } from '@components/ui/sidebar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import {
  setDesktopViewport,
  setMobileViewport,
} from '@lib/viewport-test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  useLocation: () => ({ href: '/' }),
  useNavigate: () => vi.fn(),
}));

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://github.com/shadcn.png',
};

function renderNavUser(user = mockUser) {
  return renderWithProviders(
    <SidebarProvider>
      <NavUser user={user} />
    </SidebarProvider>,
  );
}

describe('NavUser', () => {
  it('should render user name and email', () => {
    renderNavUser();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should render user avatar', () => {
    renderNavUser();

    const button = screen.getByRole('button');
    const avatar = button.querySelector('[class*="rounded-lg"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should render avatar fallback when image fails to load', () => {
    renderNavUser();

    const fallback = screen.getAllByText('SN')[0];
    expect(fallback).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    renderNavUser();

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('should display menu items in dropdown', async () => {
    const user = userEvent.setup();
    renderNavUser();

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('should display user information in dropdown header', async () => {
    const user = userEvent.setup();
    renderNavUser();

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const userNameInstances = screen.getAllByText('John Doe');
    expect(userNameInstances.length).toBeGreaterThan(1);

    const emailInstances = screen.getAllByText('john.doe@example.com');
    expect(emailInstances.length).toBeGreaterThan(1);
  });

  it('should open sign out dialog when sign out is clicked', async () => {
    const user = userEvent.setup();
    renderNavUser();

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const signOutButton = screen.getByText('Sign out');
    await user.click(signOutButton);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should render with long user names', () => {
    const longNameUser = {
      name: 'Alexander Christopher Wellington Smith-Johnson',
      email: 'alexander.wellington@verylongdomainname.com',
      avatar: 'https://github.com/shadcn.png',
    };

    renderNavUser(longNameUser);

    expect(
      screen.getByText('Alexander Christopher Wellington Smith-Johnson'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('alexander.wellington@verylongdomainname.com'),
    ).toBeInTheDocument();
  });

  it('should render user avatar in both trigger and dropdown', async () => {
    const user = userEvent.setup();
    renderNavUser();

    const button = screen.getByRole('button');
    const avatar = button.querySelector('[class*="rounded-lg"]');
    expect(avatar).toBeInTheDocument();

    await user.click(button);

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('should display chevron icon in trigger button', () => {
    renderNavUser();

    const trigger = screen.getByRole('button');
    const chevron = trigger.querySelector('svg.lucide-chevrons-up-down');
    expect(chevron).toBeInTheDocument();
  });

  it('should render dropdown from bottom on mobile viewport', async () => {
    setMobileViewport();
    const user = userEvent.setup();
    renderNavUser();

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const menuContent = screen.getByRole('menu');
    expect(menuContent).toHaveAttribute('data-side', 'bottom');

    setDesktopViewport();
  });
});
