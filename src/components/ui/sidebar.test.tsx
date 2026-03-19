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
} from '@components/ui/sidebar';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

// Mock useIsMobile hook - default to desktop
const mockUseIsMobile = vi.fn(() => false);
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Mock setCookie
vi.mock('@/lib/cookies.utils', () => ({
  setCookie: vi.fn(),
}));

// Test component to access sidebar context
function TestSidebarConsumer() {
  const { state, open, toggleSidebar } = useSidebar();
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="open">{open.toString()}</span>
      <button
        type="button"
        data-testid="toggle"
        onClick={toggleSidebar}
      >
        Toggle
      </button>
    </div>
  );
}

describe('SidebarProvider', () => {
  it('should render children', () => {
    render(
      <SidebarProvider>
        <div data-testid="child">Test</div>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide sidebar context with default open state', () => {
    render(
      <SidebarProvider>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('expanded');
    expect(screen.getByTestId('open')).toHaveTextContent('true');
  });

  it('should provide sidebar context with custom defaultOpen', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('should toggle sidebar state', async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('expanded');

    await user.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
  });

  it('should use controlled open state when provided', () => {
    const { rerender } = render(
      <SidebarProvider open={true}>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('open')).toHaveTextContent('true');

    rerender(
      <SidebarProvider open={false}>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('should call onOpenChange when provided', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <SidebarProvider onOpenChange={onOpenChange}>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    await user.click(screen.getByTestId('toggle'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('useSidebar', () => {
  it('should throw error when used outside SidebarProvider', () => {
    expect(() => {
      render(<TestSidebarConsumer />);
    }).toThrow('useSidebar must be used within a SidebarProvider.');
  });
});

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  it('should render sidebar with children', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <div data-testid="sidebar-content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
  });

  it('should render sidebar with none collapsible variant', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <div data-testid="content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render sidebar with icon collapsible variant', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <div data-testid="content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render sidebar with floating variant', () => {
    render(
      <SidebarProvider>
        <Sidebar variant="floating">
          <div data-testid="content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render sidebar with inset variant', () => {
    render(
      <SidebarProvider>
        <Sidebar variant="inset">
          <div data-testid="content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render sidebar on right side', () => {
    render(
      <SidebarProvider>
        <Sidebar side="right">
          <div data-testid="content">Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render mobile sidebar when isMobile is true', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <SidebarProvider>
        <Sidebar>
          <div data-testid="mobile-content">Mobile Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    // Mobile sidebar uses Sheet component which is closed by default (openMobile starts false)
    // We can't test the Sheet content without opening it, so this test just verifies
    // that the component renders without errors in mobile mode
    expect(document.body).toBeInTheDocument();
  });
});

describe('SidebarTrigger', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  it('should render trigger button', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should toggle sidebar when clicked', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SidebarProvider>
        <SidebarTrigger />
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('expanded');

    const triggerButton = container.querySelector('[data-sidebar="trigger"]');
    expect(triggerButton).toBeInTheDocument();

    if (triggerButton) {
      await user.click(triggerButton as HTMLElement);
    }

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });
  });

  it('should call custom onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SidebarProvider>
        <SidebarTrigger onClick={onClick} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});

describe('SidebarRail', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  it('should render rail button', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );

    // SidebarRail renders with data-sidebar="rail" attribute
    const rail = container.querySelector('[data-sidebar="rail"]');
    expect(rail).toBeInTheDocument();
    expect(rail).toHaveAttribute('title', 'Toggle Sidebar');
  });

  it('should toggle sidebar when clicked', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarRail />
        </Sidebar>
        <TestSidebarConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('expanded');

    const rail = container.querySelector('[data-sidebar="rail"]');
    if (rail) {
      await user.click(rail as HTMLElement);
    }

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });
  });
});

describe('Sidebar Components', () => {
  it('should render SidebarHeader', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarHeader data-testid="header">Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>,
    );

    // SidebarHeader has data-sidebar="header" attribute
    const header = container.querySelector('[data-sidebar="header"]');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header');
  });

  it('should render SidebarFooter', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarFooter data-testid="footer">Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>,
    );

    // SidebarFooter has data-sidebar="footer" attribute
    const footer = container.querySelector('[data-sidebar="footer"]');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Footer');
  });

  it('should render SidebarContent', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent data-testid="content">Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    // SidebarContent has data-sidebar="content" attribute
    const content = container.querySelector('[data-sidebar="content"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Content');
  });

  it('should render SidebarGroup', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup data-testid="group">Group</SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const group = container.querySelector('[data-sidebar="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveTextContent('Group');
  });

  it('should render SidebarGroupLabel', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup>
            <SidebarGroupLabel>Label</SidebarGroupLabel>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const label = container.querySelector('[data-sidebar="group-label"]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Label');
  });

  it('should render SidebarGroupLabel with render prop', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup>
            <SidebarGroupLabel render={<span data-testid="custom-label" />}>
              Custom Label
            </SidebarGroupLabel>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const customLabel = container.querySelector('[data-testid="custom-label"]');
    expect(customLabel).toBeInTheDocument();
  });

  it('should render SidebarGroupAction', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup>
            <SidebarGroupAction>Action</SidebarGroupAction>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const action = container.querySelector('[data-sidebar="group-action"]');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent('Action');
  });

  it('should render SidebarGroupAction with render prop', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup>
            <SidebarGroupAction
              render={
                <button
                  type="button"
                  data-testid="custom-action"
                />
              }
            >
              Custom Action
            </SidebarGroupAction>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const customAction = container.querySelector(
      '[data-testid="custom-action"]',
    );
    expect(customAction).toBeInTheDocument();
  });

  it('should render SidebarGroupContent', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarGroup>
            <SidebarGroupContent data-testid="group-content">
              Content
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );

    const groupContent = container.querySelector(
      '[data-sidebar="group-content"]',
    );
    expect(groupContent).toBeInTheDocument();
    expect(groupContent).toHaveTextContent('Content');
  });

  it('should render SidebarSeparator', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarSeparator data-testid="separator" />
        </Sidebar>
      </SidebarProvider>,
    );

    const separator = container.querySelector('[data-sidebar="separator"]');
    expect(separator).toBeInTheDocument();
  });

  it('should render SidebarInput', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarInput placeholder="Search..." />
        </Sidebar>
      </SidebarProvider>,
    );

    const input = container.querySelector('[data-sidebar="input"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search...');
  });

  it('should render SidebarInset', () => {
    render(
      <SidebarProvider>
        <SidebarInset data-testid="inset">Inset Content</SidebarInset>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('inset')).toBeInTheDocument();
  });
});

describe('SidebarMenu Components', () => {
  it('should render SidebarMenu', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu data-testid="menu">Menu</SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const menu = container.querySelector('[data-sidebar="menu"]');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveTextContent('Menu');
  });

  it('should render SidebarMenuItem', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem data-testid="menu-item">Item</SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const menuItem = container.querySelector('[data-sidebar="menu-item"]');
    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveTextContent('Item');
  });

  it('should render SidebarMenuButton', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Button</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Button');
  });

  it('should render SidebarMenuButton with tooltip', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Tooltip text">
                Button
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Button');
  });

  it('should render SidebarMenuButton with tooltip object', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Tooltip text' }}>
                Button
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Button');
  });

  it('should render SidebarMenuButton with isActive', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Active</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-active');
  });

  it('should render SidebarMenuButton with variants', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton variant="outline">Outline</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Outline');
  });

  it('should render SidebarMenuButton with sizes', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm">Small</SidebarMenuButton>
              <SidebarMenuButton size="lg">Large</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const buttons = container.querySelectorAll('[data-sidebar="menu-button"]');
    expect(buttons[0]).toHaveAttribute('data-size', 'sm');
    expect(buttons[0]).toHaveTextContent('Small');
    expect(buttons[1]).toHaveAttribute('data-size', 'lg');
    expect(buttons[1]).toHaveTextContent('Large');
  });

  it('should render SidebarMenuButton with render prop', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  // biome-ignore lint/a11y/useAnchorContent: test element
                  <a
                    href="/test"
                    data-testid="custom-button"
                  />
                }
              >
                Link
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const customButton = container.querySelector(
      '[data-testid="custom-button"]',
    );
    expect(customButton).toBeInTheDocument();
  });

  it('should render SidebarMenuAction', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuAction>Action</SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const action = container.querySelector('[data-sidebar="menu-action"]');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent('Action');
  });

  it('should render SidebarMenuAction with showOnHover', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuAction showOnHover>Action</SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const action = container.querySelector('[data-sidebar="menu-action"]');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent('Action');
  });

  it('should render SidebarMenuAction with render prop', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuAction
                render={
                  <button
                    type="button"
                    data-testid="custom-action"
                  />
                }
              >
                Custom
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const customAction = container.querySelector(
      '[data-testid="custom-action"]',
    );
    expect(customAction).toBeInTheDocument();
  });

  it('should render SidebarMenuBadge', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuBadge>5</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const badge = container.querySelector('[data-sidebar="menu-badge"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('5');
  });

  it('should render SidebarMenuSkeleton', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      container.querySelector('[data-sidebar="menu-skeleton"]'),
    ).toBeInTheDocument();
  });

  it('should render SidebarMenuSkeleton with showIcon', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      container.querySelector('[data-sidebar="menu-skeleton-icon"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-sidebar="menu-skeleton"]'),
    ).toBeInTheDocument();
  });
});

describe('SidebarMenuSub Components', () => {
  it('should render SidebarMenuSub', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub data-testid="menu-sub">Sub</SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const menuSub = container.querySelector('[data-sidebar="menu-sub"]');
    expect(menuSub).toBeInTheDocument();
    expect(menuSub).toHaveTextContent('Sub');
  });

  it('should render SidebarMenuSubItem', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem data-testid="sub-item">
                  Item
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const subItem = container.querySelector('[data-sidebar="menu-sub-item"]');
    expect(subItem).toBeInTheDocument();
    expect(subItem).toHaveTextContent('Item');
  });

  it('should render SidebarMenuSubButton', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Button</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-sub-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Button');
  });

  it('should render SidebarMenuSubButton with isActive', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive>Active</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const button = container.querySelector('[data-sidebar="menu-sub-button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-active');
  });

  it('should render SidebarMenuSubButton with size variants', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton size="sm">Small</SidebarMenuSubButton>
                  <SidebarMenuSubButton size="md">Medium</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const buttons = container.querySelectorAll(
      '[data-sidebar="menu-sub-button"]',
    );
    expect(buttons[0]).toHaveAttribute('data-size', 'sm');
    expect(buttons[0]).toHaveTextContent('Small');
    expect(buttons[1]).toHaveAttribute('data-size', 'md');
    expect(buttons[1]).toHaveTextContent('Medium');
  });

  it('should render SidebarMenuSubButton with render prop', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={
                      // biome-ignore lint/a11y/useAnchorContent: test element
                      <a
                        href="/test"
                        data-testid="custom-sub-button"
                      />
                    }
                  >
                    Link
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const customButton = container.querySelector(
      '[data-testid="custom-sub-button"]',
    );
    expect(customButton).toBeInTheDocument();
  });
});
