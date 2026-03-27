import { SidebarProvider } from '@components/ds/organisms/sidebar';
import type { NavCollapsible } from '@domains/shared/components/nav-group.types';
import { SidebarMenuCollapsedDropdown } from '@domains/shared/components/sidebar-menu-collapsed-dropdown';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
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
  title: 'Documents',
  icon: FolderKanban,
  badge: '4',
  items: [
    { title: 'Recent', url: '/docs/recent' },
    { title: 'Archived', url: '/docs/archived', badge: '2' },
  ],
};

function renderDropdown(item = mockItem, href = '/') {
  return renderWithProviders(
    <SidebarProvider>
      <SidebarMenuCollapsedDropdown
        item={item}
        href={href}
      />
    </SidebarProvider>,
  );
}

describe('SidebarMenuCollapsedDropdown', () => {
  it('renders the trigger button with item title', () => {
    renderDropdown();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('renders badge on trigger', () => {
    renderDropdown();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows dropdown content with sub-items on click', async () => {
    renderDropdown();
    await clickTrigger(screen.getByText('Documents'));
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders sub-items with correct URLs', async () => {
    renderDropdown();
    await clickTrigger(screen.getByText('Documents'));
    const recentLink = screen.getByText('Recent').closest('a');
    expect(recentLink).toHaveAttribute('href', '/docs/recent');
  });

  it('renders dropdown label with badge', async () => {
    renderDropdown();
    await clickTrigger(screen.getByText('Documents'));
    expect(screen.getByText('Documents (4)')).toBeInTheDocument();
  });
});
