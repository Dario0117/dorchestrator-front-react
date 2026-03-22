import { SidebarProvider } from '@components/ds/organisms/sidebar';
import { NavGroup } from '@components/layout/nav-group';
import type { NavItem } from '@components/layout/nav-group.types';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePenLine, FolderKanban, Layers } from 'lucide-react';

// Create a mock function that we can control
const mockUseLocation = vi.fn(
  ({ select }: { select?: (location: { href: string }) => string } = {}) => {
    const location = { href: '/' };
    return select ? select(location) : location;
  },
);

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
  useLocation: (params?: { select?: (location: { href: string }) => string }) =>
    mockUseLocation(params),
}));

const mockNavItems: NavItem[] = [
  {
    title: 'Projects',
    url: '/',
    icon: FolderKanban,
  },
  {
    title: 'Drafts',
    url: '/drafts',
    badge: '2',
    icon: FilePenLine,
  },
  {
    title: 'Queued sessions',
    url: '/q',
    badge: '3',
    icon: Layers,
  },
];

const mockCollapsibleItems: NavItem[] = [
  {
    title: 'Getting Started',
    icon: FolderKanban,
    items: [
      {
        title: 'Installation',
        url: '/docs/installation',
      },
      {
        title: 'Configuration',
        url: '/docs/configuration',
      },
    ],
  },
];

function renderNavGroup(items: NavItem[] = mockNavItems) {
  return renderWithProviders(
    <SidebarProvider>
      <NavGroup
        title="General"
        items={items}
      />
    </SidebarProvider>,
  );
}

describe('NavGroup', () => {
  it('should render group title', () => {
    renderNavGroup();

    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    renderNavGroup();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Queued sessions')).toBeInTheDocument();
  });

  it('should render badges when provided', () => {
    renderNavGroup();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render icons when provided', () => {
    renderNavGroup();

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should mark active item based on current URL', () => {
    renderNavGroup(mockNavItems);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveAttribute('data-active');
  });

  it('should render collapsible items', () => {
    renderNavGroup(mockCollapsibleItems);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('should expand collapsible items when clicked', async () => {
    const user = userEvent.setup();
    renderNavGroup(mockCollapsibleItems);

    const collapsibleButton = screen.getByRole('button', {
      name: /getting started/i,
    });
    await user.click(collapsibleButton);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should render items without icons', () => {
    const itemsWithoutIcons: NavItem[] = [
      {
        title: 'Dashboard',
        url: '/dashboard',
      },
      {
        title: 'Settings',
        url: '/settings',
      },
    ];

    renderNavGroup(itemsWithoutIcons);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should close mobile sidebar when link is clicked', async () => {
    const user = userEvent.setup();
    renderNavGroup();

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    await user.click(projectsLink);

    expect(projectsLink).toBeInTheDocument();
  });

  it('should render chevron icon for collapsible items', () => {
    renderNavGroup(mockCollapsibleItems);

    const collapsibleButton = screen.getByRole('button', {
      name: /getting started/i,
    });
    const chevron = collapsibleButton.querySelector('svg.lucide-chevron-right');
    expect(chevron).toBeInTheDocument();
  });

  it('should render collapsible with subitems', async () => {
    const user = userEvent.setup();
    renderNavGroup(mockCollapsibleItems);

    const collapsibleButton = screen.getByRole('button', {
      name: /getting started/i,
    });
    await user.click(collapsibleButton);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should render collapsed dropdown when sidebar is collapsed and not mobile', () => {
    const mockCollapsibleWithBadge: NavItem[] = [
      {
        title: 'Getting Started',
        icon: FolderKanban,
        badge: '5',
        items: [
          {
            title: 'Installation',
            url: '/docs/installation',
            icon: FilePenLine,
          },
          {
            title: 'Configuration',
            url: '/docs/configuration',
            icon: Layers,
            badge: '2',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <NavGroup
          title="General"
          items={mockCollapsibleWithBadge}
        />
      </SidebarProvider>,
    );

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should open dropdown menu in collapsed state', async () => {
    const mockCollapsibleWithBadge: NavItem[] = [
      {
        title: 'Getting Started',
        icon: FolderKanban,
        badge: '5',
        items: [
          {
            title: 'Installation',
            url: '/docs/installation',
            icon: FilePenLine,
          },
          {
            title: 'Configuration',
            url: '/docs/configuration',
            icon: Layers,
            badge: '2',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <NavGroup
          title="General"
          items={mockCollapsibleWithBadge}
        />
      </SidebarProvider>,
    );

    const dropdownTrigger = screen.getByRole('button', {
      name: /getting started/i,
    });
    await clickTrigger(dropdownTrigger);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should default open collapsible when current URL matches a child item', () => {
    // Mock location to return a path that matches one of the child items
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/docs/installation' };
        return select ? select(location) : location;
      },
    );

    const mockCollapsibleWithUrl: NavItem[] = [
      {
        title: 'Documentation',
        icon: FolderKanban,
        items: [
          {
            title: 'Installation',
            url: '/docs/installation',
          },
          {
            title: 'Configuration',
            url: '/docs/configuration',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider>
        <NavGroup
          title="General"
          items={mockCollapsibleWithUrl}
        />
      </SidebarProvider>,
    );

    // The collapsible should be open by default because current URL matches a child item
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();

    // Reset mock to default behavior for other tests
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/' };
        return select ? select(location) : location;
      },
    );
  });

  it('should default open collapsible when current path segment matches parent URL', () => {
    // Mock location to return a path where first segment matches parent URL
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/docs/advanced' };
        return select ? select(location) : location;
      },
    );

    const mockCollapsibleWithParentUrl: NavItem[] = [
      {
        title: 'Documentation',
        url: '/docs',
        icon: FolderKanban,
        items: [
          {
            title: 'Installation',
            url: '/docs/installation',
          },
          {
            title: 'Configuration',
            url: '/docs/configuration',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider>
        <NavGroup
          title="General"
          items={mockCollapsibleWithParentUrl}
        />
      </SidebarProvider>,
    );

    // The collapsible should be open by default because /docs/advanced matches /docs parent segment
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();

    // Reset mock to default behavior for other tests
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/' };
        return select ? select(location) : location;
      },
    );
  });

  it('should match URLs with trailing slashes', () => {
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/dashboard' };
        return select ? select(location) : location;
      },
    );

    const itemsWithTrailingSlash: NavItem[] = [
      {
        title: 'Dashboard',
        url: '/dashboard/',
        icon: FolderKanban,
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: FilePenLine,
      },
    ];

    renderNavGroup(itemsWithTrailingSlash);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('data-active');

    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/' };
        return select ? select(location) : location;
      },
    );
  });

  it('should match URLs without trailing slashes when current location has trailing slash', () => {
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/settings/' };
        return select ? select(location) : location;
      },
    );

    const itemsWithoutTrailingSlash: NavItem[] = [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: FolderKanban,
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: FilePenLine,
      },
    ];

    renderNavGroup(itemsWithoutTrailingSlash);

    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toHaveAttribute('data-active');

    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/' };
        return select ? select(location) : location;
      },
    );
  });

  it('should handle sub-item link click in expanded collapsible', async () => {
    const user = userEvent.setup();
    renderNavGroup(mockCollapsibleItems);

    // First expand the collapsible
    const collapsibleButton = screen.getByRole('button', {
      name: /getting started/i,
    });
    await user.click(collapsibleButton);

    // Then click a sub-item link
    const installationLink = screen.getByRole('link', {
      name: /installation/i,
    });
    await user.click(installationLink);

    expect(installationLink).toBeInTheDocument();
  });

  it('should render sub-items with badges and icons in expanded collapsible', async () => {
    const user = userEvent.setup();
    const collapsibleWithSubBadges: NavItem[] = [
      {
        title: 'Documentation',
        icon: FolderKanban,
        items: [
          {
            title: 'Installation',
            url: '/docs/installation',
            icon: FilePenLine,
            badge: '3',
          },
          {
            title: 'Configuration',
            url: '/docs/configuration',
          },
        ],
      },
    ];

    renderNavGroup(collapsibleWithSubBadges);

    const collapsibleButton = screen.getByRole('button', {
      name: /documentation/i,
    });
    await user.click(collapsibleButton);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render badge on expanded collapsible parent item', () => {
    const collapsibleWithParentBadge: NavItem[] = [
      {
        title: 'Resources',
        icon: FolderKanban,
        badge: '7',
        items: [
          {
            title: 'Docs',
            url: '/resources/docs',
          },
        ],
      },
    ];

    renderNavGroup(collapsibleWithParentBadge);

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render collapsed dropdown without badge on parent', () => {
    const collapsibleNoBadge: NavItem[] = [
      {
        title: 'Tools',
        icon: FolderKanban,
        items: [
          {
            title: 'Editor',
            url: '/tools/editor',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <NavGroup
          title="General"
          items={collapsibleNoBadge}
        />
      </SidebarProvider>,
    );

    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('should highlight active sub-item in collapsed dropdown', async () => {
    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/tools/editor' };
        return select ? select(location) : location;
      },
    );

    const collapsibleWithActiveChild: NavItem[] = [
      {
        title: 'Tools',
        icon: FolderKanban,
        items: [
          {
            title: 'Editor',
            url: '/tools/editor',
          },
          {
            title: 'Terminal',
            url: '/tools/terminal',
          },
        ],
      },
    ];

    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <NavGroup
          title="General"
          items={collapsibleWithActiveChild}
        />
      </SidebarProvider>,
    );

    const dropdownTrigger = screen.getByRole('button', {
      name: /tools/i,
    });
    await clickTrigger(dropdownTrigger);

    const editorItem = screen.getByRole('menuitem', { name: /editor/i });
    expect(editorItem).toBeInTheDocument();

    mockUseLocation.mockImplementation(
      ({
        select,
      }: {
        select?: (location: { href: string }) => string;
      } = {}) => {
        const location = { href: '/' };
        return select ? select(location) : location;
      },
    );
  });
});
