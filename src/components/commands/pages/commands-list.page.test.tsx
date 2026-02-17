import { CommandsListPage } from '@components/commands/pages/commands-list.page';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

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
  '@routes/(authenticated)/$organizationSlug/commands/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/commands/index')
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
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

type ListCommandsSuccessResponse =
  operations['getApiV1ByOrganizationIdCommands']['responses']['200']['content']['application/json'];

describe('CommandsListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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

  it('should render commands page with command cards', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Commands')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('should render execute command button', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Execute Command')).toBeInTheDocument();
    });
  });

  it('should show empty state when no commands exist', async () => {
    server.use(
      http.get<never, never, ListCommandsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/commands'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
              hasNext: false,
              hasPrevious: false,
              totalResults: 0,
              totalPages: 0,
              page: 1,
              size: 10,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No commands submitted yet/)).toBeInTheDocument();
    });
  });

  it('should open execute command modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Execute Command')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Execute Command'));

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });
  });

  it('should display command status badges', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('should display device names on command cards', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Server').length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      expect(screen.getByText('Build Agent')).toBeInTheDocument();
    });
  });
});
