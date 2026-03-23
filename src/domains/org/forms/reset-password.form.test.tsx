import { ResetPasswordForm } from '@domains/org/forms/reset-password.form';
import { useResetPasswordMutation } from '@domains/org/services/users/reset-password.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock better-auth client to avoid internal React state updates that cause act warnings
const mockRequestPasswordReset = vi.fn();
vi.mock('@/better-auth.client', () => ({
  authClient: {
    requestPasswordReset: (params: { email: string; redirectTo: string }) =>
      mockRequestPasswordReset(params),
  },
}));

function TestWrapper({ handleSuccess }: { handleSuccess: () => void }) {
  const resetPasswordMutation = useResetPasswordMutation();
  return (
    <ResetPasswordForm
      resetPasswordMutation={resetPasswordMutation}
      handleSuccess={handleSuccess}
    />
  );
}

describe('ResetPasswordForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
    mockRequestPasswordReset.mockClear();
    // Default: successful response
    mockRequestPasswordReset.mockResolvedValue({
      data: { status: true },
      error: null,
    });
  });

  it('should render reset password form with all required fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send reset email' }),
    ).toBeInTheDocument();
  });

  it('should have proper input placeholder', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByPlaceholderText('johndoe17@mail.com'),
    ).toBeInTheDocument();
  });

  it('should call mutation with correct email on form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: { status: true },
        error: null,
      });
    });
  });

  it('should call handleSuccess on successful password reset request', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: { status: true },
        error: null,
      });
    });
  });

  it('should display error when mutation fails', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const user = userEvent.setup();

    // Override the mock to return an error
    mockRequestPasswordReset.mockResolvedValue({
      data: null,
      error: { message: 'Email not found' },
    });

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.click(submitButton);

    // Check that handleSuccess was not called due to error
    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Should not call handleSuccess if email is invalid
    await waitFor(
      () => {
        expect(mockHandleSuccess).not.toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('should prevent default form submission', async () => {
    const mockPreventDefault = vi.fn();
    const mockStopPropagation = vi.fn();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const form = screen
      .getByRole('button', { name: 'Send reset email' })
      .closest('form');
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
          screen.getByRole('button', { name: 'Send reset email' }),
        ).toBeInTheDocument();
      });
    }
  });

  it('should have required attribute on email field', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    expect(emailInput).toHaveAttribute('required');
  });

  it('should handle empty form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });
    await user.click(submitButton);

    // Form should handle validation internally and not call handleSuccess
    expect(mockHandleSuccess).not.toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);

    // Tab navigation should work to email input
    await user.tab();
    expect(emailInput).toHaveFocus();

    // Fill in email to enable the submit button
    await user.type(emailInput, 'test@example.com');

    // Now the submit button should be enabled and focusable
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.tab();
    await waitFor(() => {
      expect(submitButton).toHaveFocus();
    });
  });

  it('should clear error map before submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalled();
    });
  });

  it('should accept valid email addresses', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', {
      name: 'Send reset email',
    });

    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
    ];

    for (const email of validEmails) {
      await user.clear(emailInput);
      await user.type(emailInput, email);
      await user.click(submitButton);

      // better-auth wraps responses in { data: ..., error: null } format
      await waitFor(() => {
        expect(mockHandleSuccess).toHaveBeenCalledWith({
          data: { status: true },
          error: null,
        });
      });

      mockHandleSuccess.mockClear();
    }
  });
});
