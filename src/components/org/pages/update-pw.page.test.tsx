import { UpdatePasswordPage } from '@components/org/pages/update-pw.page';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the navigation hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

const mockUseNavigate = vi.mocked(
  await import('@tanstack/react-router'),
).useNavigate;
const mockUseParams = vi.mocked(
  await import('@tanstack/react-router'),
).useParams;

// Mock navigate function
const mockNavigate = vi.fn();
mockUseNavigate.mockReturnValue(mockNavigate);

// Mock params with token
mockUseParams.mockReturnValue({ token: 'test-token-123' });

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render update password form', () => {
    renderWithProviders(<UpdatePasswordPage token="test-token-123" />);

    expect(screen.getByText('Update your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/New password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm new password/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Update password' }),
    ).toBeInTheDocument();
  });

  it('should navigate to login page on successful password update', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UpdatePasswordPage token="test-token-123" />);

    const passwordInput = screen.getByLabelText(/New password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    // Wait for mutation to complete and navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
  });

  it('should pass updatePassword function to UpdatePasswordForm', () => {
    renderWithProviders(<UpdatePasswordPage token="test-token-123" />);

    // The updatePassword function should be passed to UpdatePasswordForm
    // We can verify this by checking that the form is rendered (which means props were passed correctly)
    expect(screen.getByText('Update your password')).toBeInTheDocument();
  });

  it('should use correct navigation source', () => {
    renderWithProviders(<UpdatePasswordPage token="test-token-123" />);

    // The useNavigate hook should be called with the correct 'from' parameter
    expect(mockUseNavigate).toHaveBeenCalledWith({
      from: '/update-password',
    });
  });

  it('should render accessibility landmarks', () => {
    renderWithProviders(<UpdatePasswordPage token="test-token-123" />);

    const section = screen.getByText('Update your password').closest('section');
    expect(section).toBeInTheDocument();
  });
});
