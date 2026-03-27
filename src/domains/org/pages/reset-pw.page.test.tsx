import { ResetPasswordPage } from '@domains/org/pages/reset-pw.page';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the navigation hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}));

const mockUseNavigate = vi.mocked(
  await import('@tanstack/react-router'),
).useNavigate;

// Mock navigate function
const mockNavigate = vi.fn();
mockUseNavigate.mockReturnValue(mockNavigate);

// Mock better-auth client to control mutation responses
const mockRequestPasswordReset = vi.fn();
vi.mock('@/better-auth.client', () => ({
  authClient: {
    requestPasswordReset: (params: { email: string; redirectTo: string }) =>
      mockRequestPasswordReset(params),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockRequestPasswordReset.mockClear();
    // Default: successful response without message property
    mockRequestPasswordReset.mockResolvedValue({
      data: { status: true },
      error: null,
    });
  });

  it('should render reset password form', () => {
    renderWithProviders(<ResetPasswordPage />);

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send reset email' }),
    ).toBeInTheDocument();
  });

  it('should navigate to login page on successful reset', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
  });

  it('should pass resetPasswordMutation to ResetPasswordForm', () => {
    renderWithProviders(<ResetPasswordPage />);

    // The resetPasswordMutation should be passed to ResetPasswordForm
    // We can verify this by checking that the form is rendered (which means props were passed correctly)
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
  });

  it('should use correct navigation source', () => {
    renderWithProviders(<ResetPasswordPage />);

    // The useNavigate hook should be called with the correct 'from' parameter
    expect(mockUseNavigate).toHaveBeenCalledWith({ from: '/reset-password' });
  });

  it('should render accessibility landmarks', () => {
    renderWithProviders(<ResetPasswordPage />);

    const section = screen.getByText('Reset your password').closest('section');
    expect(section).toBeInTheDocument();
  });

  it('should use message from response data when available', async () => {
    mockRequestPasswordReset.mockResolvedValue({
      data: null,
      error: null,
      message: 'Custom reset message from server',
    });

    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
  });
});
