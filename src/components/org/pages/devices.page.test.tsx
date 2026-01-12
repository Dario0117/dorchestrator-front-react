import { DevicesPage } from '@components/org/pages/devices.page';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useOrganizationStore } from '@stores/organization.store';
import { screen, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock('@routes/(authenticated)/$organizationSlug/devices', () => ({
  Route: {
    useSearch: vi.fn(() => ({ page: 1, size: 10 })),
    fullPath: '/org-123/devices',
  },
}));

describe('DevicesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    // Seed the organization store with test data
    useOrganizationStore.getState().setOrganizations([
      {
        id: 'org-123',
        name: 'Test Organization',
        slug: 'test-org',
        createdAt: new Date('2025-12-21T10:00:00.000Z'),
      },
    ]);
  });

  it('should render loading state initially', () => {
    renderWithProviders(<DevicesPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render devices page with device cards', async () => {
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    // MSW handler returns 5 devices, check for one of them
    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });
  });

  it('should render add device button', async () => {
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Device')).toBeInTheDocument();
    });
  });
});
