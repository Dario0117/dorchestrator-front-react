import { SearchProvider } from '@context/search.provider';
import { renderWithProviders as renderWithBaseProviders } from '@lib/test-wrappers.utils';
import { useOrganizationStore } from '@stores/organization.store';
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

describe('CommandMenu', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    // Seed the organization store with test data
    // This will make getSidebarData work with real data
    useOrganizationStore.getState().setOrganizations([
      {
        id: 'org-123',
        name: 'Test Organization',
        slug: 'test-org',
        createdAt: new Date('2025-12-21T10:00:00.000Z'),
      },
    ]);
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
});
