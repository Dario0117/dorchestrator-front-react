import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@components/ds/organisms/sidebar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';

describe('SidebarProvider', () => {
  it('renders children within the provider', () => {
    renderWithProviders(
      <SidebarProvider>
        <div>Sidebar child</div>
      </SidebarProvider>,
    );

    expect(screen.getByText('Sidebar child')).toBeInTheDocument();
  });

  it('passes through defaultOpen prop', () => {
    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarEl = document.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toBeInTheDocument();
  });
});

describe('Sidebar', () => {
  it('renders with side prop', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar side="right">
          <SidebarContent>Right sidebar</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarEl = document.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toHaveAttribute('data-side', 'right');
  });

  it('renders with variant prop', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar variant="floating">
          <SidebarContent>Floating sidebar</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarEl = document.querySelector('[data-slot="sidebar"]');
    expect(sidebarEl).toHaveAttribute('data-variant', 'floating');
  });

  it('renders with collapsible none', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>Non-collapsible</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('Non-collapsible')).toBeInTheDocument();
  });
});

describe('SidebarHeader and SidebarFooter', () => {
  it('renders header and footer sections', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarHeader>Header content</SidebarHeader>
          <SidebarContent>Main</SidebarContent>
          <SidebarFooter>Footer content</SidebarFooter>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('Header content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});

describe('SidebarMenu', () => {
  it('renders menu items', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});

describe('SidebarMenuButton', () => {
  it('renders with isActive state', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Active item</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = screen.getByText('Active item').closest('button');
    expect(button).toHaveAttribute('data-active');
  });

  it('renders with size variant', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg">Large item</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = screen.getByText('Large item').closest('button');
    expect(button).toHaveAttribute('data-size', 'lg');
  });
});

describe('SidebarMenuBadge', () => {
  it('renders badge content', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Item</SidebarMenuButton>
                    <SidebarMenuBadge>5</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('SidebarMenuSkeleton', () => {
  it('renders skeleton placeholder', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const skeleton = document.querySelector(
      '[data-slot="sidebar-menu-skeleton"]',
    );
    expect(skeleton).toBeInTheDocument();
  });
});

describe('SidebarMenuSub', () => {
  it('renders sub menu items', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Parent</SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>Child</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});

describe('SidebarInset', () => {
  it('renders main content area', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>Nav</SidebarContent>
        </Sidebar>
        <SidebarInset>Main content</SidebarInset>
      </SidebarProvider>,
    );

    expect(screen.getByText('Main content')).toBeInTheDocument();
  });
});

describe('SidebarSeparator', () => {
  it('renders a separator', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarSeparator data-testid="sep" />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });
});

describe('SidebarRail', () => {
  it('renders the rail toggle button', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTitle('Toggle Sidebar')).toBeInTheDocument();
  });
});

describe('SidebarTrigger', () => {
  it('renders the trigger button', () => {
    renderWithProviders(
      <SidebarProvider>
        <SidebarTrigger data-testid="trigger" />
        <Sidebar collapsible="none">
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument();
  });
});

describe('SidebarInput', () => {
  it('renders an input element', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarInput data-testid="sidebar-input" />
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('sidebar-input')).toBeInTheDocument();
  });
});

describe('SidebarGroupAction', () => {
  it('renders an action within a sidebar group', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Group</SidebarGroupLabel>
              <SidebarGroupAction data-testid="group-action">
                Add
              </SidebarGroupAction>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('group-action')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});

describe('SidebarMenuAction', () => {
  it('renders an action within a menu item', () => {
    renderWithProviders(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Item</SidebarMenuButton>
                    <SidebarMenuAction data-testid="menu-action">
                      Delete
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('menu-action')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});

describe('useSidebar', () => {
  function SidebarState() {
    const { state } = useSidebar();
    return <div data-testid="state">{state}</div>;
  }

  it('provides expanded state when defaultOpen is true', () => {
    renderWithProviders(
      <SidebarProvider defaultOpen>
        <SidebarState />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('expanded');
  });

  it('provides collapsed state when defaultOpen is false', () => {
    renderWithProviders(
      <SidebarProvider defaultOpen={false}>
        <SidebarState />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
  });

  it('throws when used outside SidebarProvider', () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: suppress React error boundary noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<SidebarState />)).toThrow(
      'useSidebar must be used within a SidebarProvider.',
    );

    consoleSpy.mockRestore();
  });
});
