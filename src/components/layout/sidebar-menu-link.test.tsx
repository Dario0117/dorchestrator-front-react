import { SidebarProvider } from '@components/ds/organisms/sidebar';
import { SidebarMenuLink } from '@components/layout/sidebar-menu-link';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { Home } from 'lucide-react';

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
  };
});

function renderSidebarMenuLink(
  item: Parameters<typeof SidebarMenuLink>[0]['item'],
  href = '/',
) {
  return renderWithProviders(
    <SidebarProvider>
      <SidebarMenuLink
        item={item}
        href={href}
      />
    </SidebarProvider>,
  );
}

describe('SidebarMenuLink', () => {
  it('should render a link with the item title', () => {
    renderSidebarMenuLink({ title: 'Dashboard', url: '/dashboard' });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render a link pointing to the item url', () => {
    renderSidebarMenuLink({ title: 'Dashboard', url: '/dashboard' });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('should render the icon when provided', () => {
    renderSidebarMenuLink({
      title: 'Home',
      url: '/home',
      icon: Home,
    });
    const link = screen.getByRole('link');
    const svg = link.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should not render an icon when not provided', () => {
    renderSidebarMenuLink({ title: 'Home', url: '/home' });
    const link = screen.getByRole('link');
    const svg = link.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('should render a badge when provided', () => {
    renderSidebarMenuLink({
      title: 'Notifications',
      url: '/notifications',
      badge: '3',
    });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not render a badge when not provided', () => {
    renderSidebarMenuLink({ title: 'Home', url: '/home' });
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });
});
