import { CommandDetailsPage } from '@components/commands/pages/command-details.page';
import { queryClient } from '@context/query.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: () => ({ organizationSlug: 'test-org', commandId: '1' }),
  };
});

vi.mock(
  '@routes/(authenticated)/$organizationSlug/commands/$commandId',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/commands/$commandId')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useParams: vi.fn(() => ({
          organizationSlug: 'test-org',
          commandId: '1',
        })),
      },
    };
  },
);

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

describe('CommandDetailsPage', () => {
  beforeEach(() => {
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  });

  it('should render command detail heading', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Command Detail')).toBeInTheDocument();
    });
  });

  it('should render command data from query', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Server/)).toBeInTheDocument();
    });
  });

  it('should render command results', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(/completed/)).toBeInTheDocument();
    });
  });
});
