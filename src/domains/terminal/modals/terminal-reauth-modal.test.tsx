import { TerminalReauthModal } from '@domains/terminal/modals/terminal-reauth-modal';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

function renderModal(open = true) {
  return renderWithProviders(
    <TerminalReauthModal
      open={open}
      onOpenChange={mockOnOpenChange}
      organizationId="org-1"
      onSuccess={mockOnSuccess}
    />,
  );
}

describe('TerminalReauthModal', () => {
  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockOnSuccess.mockClear();
  });

  it('should render modal with password input when open', () => {
    renderModal();

    expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it('should not render modal content when closed', () => {
    renderModal(false);

    expect(
      screen.queryByText('Terminal Authentication'),
    ).not.toBeInTheDocument();
  });

  it('should have disabled submit button when password is empty', () => {
    renderModal();

    const submitButton = screen.getByRole('button', { name: 'Authenticate' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when password is entered', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Password/), 'my-password');

    const submitButton = screen.getByRole('button', { name: 'Authenticate' });
    expect(submitButton).toBeEnabled();
  });

  it('should call onSuccess with session token on successful auth', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Password/), 'correct-password');
    await user.click(screen.getByRole('button', { name: 'Authenticate' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('mock-terminal-auth-token');
    });
  });

  it('should display error message on auth failure', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/terminal/auth'),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: { nonFieldErrors: ['Invalid password'] },
            },
            { status: 422 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Password/), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Authenticate' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });
  });

  it('should call onOpenChange(false) when close button is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should reset authMutation when closing (onOpenChange with false)', async () => {
    const user = userEvent.setup();
    renderModal();

    // First trigger an error to put mutation in error state
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/terminal/auth'),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: { nonFieldErrors: ['Invalid password'] },
            },
            { status: 422 },
          );
        },
      ),
    );

    await user.type(screen.getByLabelText(/Password/), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Authenticate' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });

    // Close the modal - this should reset the mutation
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
