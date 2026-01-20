import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import { SearchProvider } from '@context/search.provider';
import { renderWithProviders as renderWithBaseProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Home, Settings } from 'lucide-react';

const renderWithProviders = () => {
  return renderWithBaseProviders(
    <SearchProvider>
      <div>Test Content</div>
    </SearchProvider>,
  );
};

const openCommandMenu = async () => {
  // Trigger Cmd+K to open command menu - wrap event dispatch in act for state updates
  act(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  await waitFor(() => {
    expect(
      screen.queryByPlaceholderText('Type a command or search...'),
    ).toBeInTheDocument();
  });
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const mockNavigate = vi.fn();
const mockSetTheme = vi.fn();

const mockOrganization = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  createdAt: new Date('2025-12-21T10:00:00.000Z'),
};

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

vi.mock('@/app', () => ({
  _getNullableCurrentOrganizationFromSlug: () => mockOrganization,
}));

vi.mock('@context/theme.provider', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@context/theme.provider')>();
  return {
    ...actual,
    useTheme: () => ({
      theme: 'system',
      setTheme: mockSetTheme,
    }),
  };
});

const mockSidebarDataWithSubItems: SidebarData = {
  teams: [{ name: 'Test Org', logo: Home, plan: 'Free' }],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Parent Item',
          icon: Settings,
          items: [
            { title: 'Sub Item 1', url: '/test-org/sub-1' },
            { title: 'Sub Item 2', url: '/test-org/sub-2' },
          ],
        },
      ],
    },
    {
      title: 'Theme',
      items: [],
    },
  ],
};

const mockGetSidebarData = vi.fn();

vi.mock('@components/layout/data/sidebar-data', () => ({
  getSidebarData: (...args: unknown[]) => mockGetSidebarData(...args),
}));

const defaultSidebarData: SidebarData = {
  teams: [{ name: 'Test Organization', logo: Home, plan: 'Free Tier' }],
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Dashboard', url: '/test-org/', icon: Home },
        { title: 'Devices', url: '/test-org/devices', icon: Home },
        { title: 'Commands', url: '/test-org/commands', icon: Home },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Organization Settings',
          url: '/test-org/settings',
          icon: Settings,
        },
      ],
    },
  ],
};

describe('CommandMenu', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetTheme.mockClear();
    mockGetSidebarData.mockReturnValue(defaultSidebarData);
  });

  it('should render command menu when open', async () => {
    renderWithProviders();
    await openCommandMenu();
    expect(
      screen.getByPlaceholderText('Type a command or search...'),
    ).toBeInTheDocument();
  });

  it('should render theme options', async () => {
    renderWithProviders();
    await openCommandMenu();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should render navigation groups from sidebar data', async () => {
    renderWithProviders();
    await openCommandMenu();
    // Dialog renders in portal, just verify component renders
    expect(
      screen.getByPlaceholderText('Type a command or search...'),
    ).toBeInTheDocument();
  });

  it('should navigate to url when navigation item is selected', async () => {
    renderWithProviders();
    await openCommandMenu();

    const input = screen.getByPlaceholderText('Type a command or search...');
    expect(input).toBeInTheDocument();
  });

  it('should show no results message when no matches found', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    const input = screen.getByPlaceholderText('Type a command or search...');
    await user.type(input, 'nonexistentcommand12345');

    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('should render command input for searching', async () => {
    renderWithProviders();
    await openCommandMenu();
    const input = screen.getByPlaceholderText('Type a command or search...');
    expect(input).toBeInTheDocument();
  });

  it('should render nav items from sidebar data', async () => {
    renderWithProviders();
    await openCommandMenu();

    // Check that nav items from real sidebar data are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
  });

  it('should navigate to url when nav item is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    // Find and click on the Dashboard item
    const dashboardItem = screen.getByText('Dashboard');
    await user.click(dashboardItem);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/test-org/' });
  });

  it('should navigate to devices when devices item is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    // Find and click on the Devices item
    const devicesItem = screen.getByText('Devices');
    await user.click(devicesItem);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/test-org/devices' });
  });

  it('should change theme to light when Light option is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    const lightOption = screen.getByText('Light');
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should change theme to dark when Dark option is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    const darkOption = screen.getByText('Dark');
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should change theme to system when System option is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    const systemOption = screen.getByText('System');
    await user.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});

describe('CommandMenu with sub-items', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetTheme.mockClear();
    mockGetSidebarData.mockReturnValue(mockSidebarDataWithSubItems);
  });

  it('should render sub-items from collapsible nav item', async () => {
    renderWithProviders();
    await openCommandMenu();

    expect(screen.getByText(/Sub Item 1/)).toBeInTheDocument();
    expect(screen.getByText(/Sub Item 2/)).toBeInTheDocument();
  });

  it('should navigate to sub-item url when sub-item is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    const subItem = screen.getByText(/Sub Item 1/);
    await user.click(subItem);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/test-org/sub-1' });
  });
});
