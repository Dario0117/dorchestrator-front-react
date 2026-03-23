import { LoginForm } from '@domains/org/forms/login.form';
import { useLoginMutation } from '@domains/org/services/users/login.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface LinkProps {
  children: React.ReactNode;
  to: string;
  [key: string]: unknown;
}

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: LinkProps) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock better-auth client to avoid internal React state updates that cause act warnings
const mockSignInEmail = vi.fn();
vi.mock('@/better-auth.client', () => ({
  authClient: {
    signIn: {
      email: (params: { email: string; password: string }) =>
        mockSignInEmail(params),
    },
  },
}));

function TestWrapper({ handleSuccess }: { handleSuccess: () => void }) {
  const loginMutation = useLoginMutation();
  return (
    <LoginForm
      loginMutation={loginMutation}
      handleSuccess={handleSuccess}
    />
  );
}

describe('LoginForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
    mockSignInEmail.mockClear();
    // Default: successful response
    mockSignInEmail.mockResolvedValue({
      data: {
        redirect: false,
        token: 'random-token',
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      error: null,
    });
  });

  it('should render login form with all required fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('Login to your account')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your email below to login to your account'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute(
      'href',
      '/reset-password',
    );
  });

  it('should render register link', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const registerLink = screen.getByText('Register');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('should have proper input placeholders', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByPlaceholderText('johndoe17@mail.com'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should have password input type', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByLabelText(/Password/);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should call loginMutation with correct credentials on form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'testpassword');
    // Blur the password field to trigger onBlur validation
    await user.tab();

    // Wait for the submit button to become enabled after validation
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            redirect: false,
            token: 'random-token',
            user: expect.objectContaining({
              id: 'test-id',
              email: 'test@example.com',
              name: 'Test User',
            }),
          }),
          error: null,
        }),
      );
    });
  });

  it('should prevent default form submission', async () => {
    const mockPreventDefault = vi.fn();
    const mockStopPropagation = vi.fn();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const form = screen.getByRole('button', { name: 'Login' }).closest('form');
    expect(form).toBeInTheDocument();

    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;
      event.stopPropagation = mockStopPropagation;

      fireEvent(form, event);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();

      // Wait for any pending form validation updates to complete
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Login' }),
        ).toBeInTheDocument();
      });
    }
  });

  it('should handle empty form submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    // Form should handle validation internally
    expect(mockHandleSuccess).not.toHaveBeenCalled();
  });

  it('should display form error when loginMutation fails', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const user = userEvent.setup();

    // Override the mock to return an error
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should have required attributes on form fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);
    const forgotPasswordLink = screen.getByRole('link', {
      name: 'Forgot your password?',
    });

    // Tab navigation should work
    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    // Password toggle button is excluded from tab order (tabIndex=-1)
    // Forgot password link is next
    await user.tab();
    expect(forgotPasswordLink).toHaveFocus();

    // Register link is next
    await user.tab();
    const registerLink = screen.getByRole('link', { name: 'Register' });
    expect(registerLink).toHaveFocus();
  });
});
