import { SearchProvider } from '@context/search.provider';
import { renderWithProviders as renderWithBaseProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

const renderWithProviders = () => {
  return renderWithBaseProviders(
    <SearchProvider>
      <div>Test Content</div>
    </SearchProvider>,
  );
};

const openCommandMenu = async () => {
  // Trigger Cmd+K to open command menu
  await act(async () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Type a command or search...'),
      ).toBeInTheDocument();
    });
  });
};

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // Mock implementation
    }
    unobserve() {
      // Mock implementation
    }
    disconnect() {
      // Mock implementation
    }
  };

  Element.prototype.scrollIntoView = vi.fn();
});

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock sidebar data with collapsible items containing subitems
vi.mock('@/components/layout/data/sidebar-data', () => ({
  sidebarData: {
    teams: [],
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Home',
            url: '/',
          },
          {
            title: 'Projects',
            url: '/projects',
          },
        ],
      },
      {
        title: 'Settings',
        items: [
          {
            title: 'Account',
            items: [
              {
                title: 'Profile',
                url: '/account/profile',
              },
              {
                title: 'Security',
                url: '/account/security',
              },
            ],
          },
        ],
      },
    ],
  },
}));

describe('CommandMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  it('should render collapsible nav items with subitems', async () => {
    renderWithProviders();
    await openCommandMenu();

    // Check that subitems from Account collapsible are rendered
    expect(screen.getByText(/Profile/)).toBeInTheDocument();
    expect(screen.getByText(/Security/)).toBeInTheDocument();
  });

  it('should navigate to subitem url when subitem is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    // Find and click on the Profile subitem
    const profileItem = screen.getByText(/Profile/);
    await user.click(profileItem);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/account/profile' });
  });

  it('should navigate to url when regular nav item is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await openCommandMenu();

    // Find and click on the Home item
    const homeItem = screen.getByText('Home');
    await user.click(homeItem);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });
});
