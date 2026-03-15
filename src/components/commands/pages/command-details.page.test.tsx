import { CommandDetailsPage } from '@components/commands/pages/command-details.page';
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
    useParams: () => ({ organizationSlug: 'test-org', commandId: '1' }),
  };
});

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/$commandId',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/$commandId')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useParams: vi.fn(() => ({
          organizationSlug: 'test-org',
          teamSlug: 'default',
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

type GetCommandSuccessResponse =
  operations['getApiV1ByOrganizationIdCommandsByCommandId']['responses']['200']['content']['application/json'];

const completedCommandResponse: GetCommandSuccessResponse = {
  responseData: {
    results: {
      id: 1,
      command: 'echo "hello world"',
      status: 'completed',
      deviceName: 'Test Server',
      submittedBy: 'test@example.com',
      createdAt: '2025-12-28T10:00:00.000Z',
      startedAt: '2025-12-28T10:01:00.000Z',
      completedAt: '2025-12-28T10:01:30.000Z',
      results: [
        {
          id: 1,
          stdout: 'hello world\n',
          stderr: null,
          exitCode: 0,
          createdAt: '2025-12-28T10:01:30.000Z',
        },
      ],
    },
  },
  responseErrors: null,
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

  it('should render command page title with command id', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Command #1')).toBeInTheDocument();
    });
  });

  it('should render back button', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Back to commands' }),
      ).toBeInTheDocument();
    });
  });

  it('should render command metadata', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Command Details')).toBeInTheDocument();
    });
  });

  it('should render results section for completed command', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Execution Results')).toBeInTheDocument();
      expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
      expect(screen.getByText('Exit code: 0')).toBeInTheDocument();
    });
  });

  it('should show pending status message', async () => {
    server.use(
      http.get<
        { organizationId: string; commandId: string },
        never,
        GetCommandSuccessResponse
      >(buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'), () =>
        HttpResponse.json({
          responseData: {
            results: {
              ...completedCommandResponse.responseData.results,
              status: 'pending',
              startedAt: null,
              completedAt: null,
              results: [],
            },
          },
          responseErrors: null,
        }),
      ),
    );

    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Command is queued and waiting for device to poll'),
      ).toBeInTheDocument();
    });
  });

  it('should show running status message with spinner', async () => {
    server.use(
      http.get<
        { organizationId: string; commandId: string },
        never,
        GetCommandSuccessResponse
      >(buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'), () =>
        HttpResponse.json({
          responseData: {
            results: {
              ...completedCommandResponse.responseData.results,
              status: 'running',
              completedAt: null,
              results: [],
            },
          },
          responseErrors: null,
        }),
      ),
    );

    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Command is executing on device...'),
      ).toBeInTheDocument();
    });
  });

  it('should show failed status message and results', async () => {
    server.use(
      http.get<
        { organizationId: string; commandId: string },
        never,
        GetCommandSuccessResponse
      >(buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'), () =>
        HttpResponse.json({
          responseData: {
            results: {
              ...completedCommandResponse.responseData.results,
              status: 'failed',
              results: [
                {
                  id: 1,
                  stdout: null,
                  stderr: 'Permission denied\n',
                  exitCode: 1,
                  createdAt: '2025-12-28T10:01:30.000Z',
                },
              ],
            },
          },
          responseErrors: null,
        }),
      ),
    );

    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Command failed. See error output below.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Execution Results')).toBeInTheDocument();
    });
  });

  it('should not show results section for pending command', async () => {
    server.use(
      http.get<
        { organizationId: string; commandId: string },
        never,
        GetCommandSuccessResponse
      >(buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'), () =>
        HttpResponse.json({
          responseData: {
            results: {
              ...completedCommandResponse.responseData.results,
              status: 'pending',
              startedAt: null,
              completedAt: null,
              results: [],
            },
          },
          responseErrors: null,
        }),
      ),
    );

    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Command #1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Execution Results')).not.toBeInTheDocument();
  });

  it('should display status badge', async () => {
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('should navigate back when clicking back button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Back to commands' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Back to commands' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/commands',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      }),
    );
  });

  it('should render nothing when command data is null', async () => {
    server.use(
      http.get<
        { organizationId: string; commandId: string },
        never,
        GetCommandSuccessResponse
      >(buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'), () =>
        HttpResponse.json({
          responseData: {
            results:
              null as unknown as GetCommandSuccessResponse['responseData']['results'],
          },
          responseErrors: null,
        }),
      ),
    );

    const { container } = renderWithProviders(<CommandDetailsPage />);

    await waitFor(() => {
      expect(container.querySelector('section')).not.toBeInTheDocument();
    });
  });
});
