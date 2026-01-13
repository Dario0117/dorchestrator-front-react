import { DevicesPage } from '@components/org/pages/devices.page';
import { queryClient } from '@context/query.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

vi.mock(
  '@routes/(authenticated)/$organizationSlug/devices',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/devices')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => ({ page: 1, size: 10 })),
      },
    };
  },
);

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  createdAt: new Date('2025-12-21T10:00:00.000Z'),
  logo: null,
  metadata: {},
};

describe('DevicesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Seed query cache with organization data
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, [
      mockOrganization,
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
