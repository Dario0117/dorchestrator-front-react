import { CreateTerminalSessionDialog } from '@domains/terminal/modals/create-terminal-session-dialog';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type CreateSessionErrorResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['400']['content']['application/json'];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  organizationId: 'org-123',
  teamId: 'team-1',
  deviceId: 1,
  deviceName: 'Test Device',
  terminalAuthToken: 'auth-token-123',
  onSessionCreated: vi.fn(),
};

// Validation, preset filtering, ceiling logic, and custom input behavior are
// tested in use-create-terminal-session-dialog.test.ts. These tests focus on
// the dialog wrapper: open/close, loading, cancel, and end-to-end flow.

describe('CreateTerminalSessionDialog', () => {
  beforeEach(() => {
    defaultProps.onOpenChange.mockClear();
    defaultProps.onSessionCreated.mockClear();
  });

  it('should render dialog when open is true', () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
    expect(
      screen.getByText(/Configure session timeout for Test Device/),
    ).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    renderWithProviders(
      <CreateTerminalSessionDialog
        {...defaultProps}
        open={false}
      />,
    );

    expect(screen.queryByText('New Terminal Session')).not.toBeInTheDocument();
  });

  it('should show loading skeletons while data is loading', () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
        ),
        () => {
          return new Promise(() => {
            // intentionally never resolves to simulate loading
          });
        },
      ),
    );

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    expect(
      screen.queryByLabelText('Inactivity Timeout'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Start Session')).toBeDisabled();
  });

  it('should render form fields after data loads', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    expect(screen.getByText('Working Directory')).toBeInTheDocument();
  });

  it('should call onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onSessionCreated on successful submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(defaultProps.onSessionCreated).toHaveBeenCalledWith(1);
    });
  });

  it('should show API error message on mutation failure', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: {
                nonFieldErrors: ['Session limit reached'],
              },
            } as CreateSessionErrorResponse,
            { status: 400 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Session limit reached')).toBeInTheDocument();
    });
  });
});
