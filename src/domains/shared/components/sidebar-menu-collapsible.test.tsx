import { SidebarProvider } from '@components/ds/organisms/sidebar';
import type { NavCollapsible } from '@domains/shared/components/nav-group.types';
import { SidebarMenuCollapsible } from '@domains/shared/components/sidebar-menu-collapsible';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderKanban } from 'lucide-react';

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
}));

const mockItem: NavCollapsible = {
  title: 'Getting Started',
  icon: FolderKanban,
  items: [
    { title: 'Installation', url: '/docs/installation' },
    { title: 'Configuration', url: '/docs/configuration' },
  ],
};

const mockItemWithBadge: NavCollapsible = {
  title: 'Reports',
  badge: '5',
  items: [
    { title: 'Monthly', url: '/reports/monthly', badge: '3' },
    { title: 'Annual', url: '/reports/annual' },
  ],
};

function renderCollapsible(item = mockItem, href = '/') {
  return renderWithProviders(
    <SidebarProvider>
      <SidebarMenuCollapsible
        item={item}
        href={href}
      />
    </SidebarProvider>,
  );
}

describe('SidebarMenuCollapsible', () => {
  it('renders the item title', () => {
    renderCollapsible();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders sub-items when expanded', async () => {
    const user = userEvent.setup();
    renderCollapsible();
    await user.click(screen.getByText('Getting Started'));
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('renders sub-items as links', async () => {
    const user = userEvent.setup();
    renderCollapsible();
    await user.click(screen.getByText('Getting Started'));
    expect(screen.getByRole('link', { name: /Installation/ })).toHaveAttribute(
      'href',
      '/docs/installation',
    );
  });

  it('renders badges on parent and sub-items', async () => {
    const user = userEvent.setup();
    renderCollapsible(mockItemWithBadge);
    expect(screen.getByText('5')).toBeInTheDocument();
    await user.click(screen.getByText('Reports'));
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('defaults to open when current href matches a sub-item', () => {
    renderCollapsible(mockItem, '/docs/installation');
    expect(screen.getByText('Installation')).toBeInTheDocument();
  });
});
