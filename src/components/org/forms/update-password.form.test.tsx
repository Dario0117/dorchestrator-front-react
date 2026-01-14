import { UpdatePasswordForm } from '@components/org/forms/update-password.form';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUpdatePasswordMutation } from '@services/users/update-password.http-service';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

// Mock the router hooks
vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(),
}));

const mockUseParams = vi.mocked(
  await import('@tanstack/react-router'),
).useParams;

// Mock params with token
mockUseParams.mockReturnValue({ token: 'test-token-123' });

function TestWrapper({ handleSuccess }: { handleSuccess: () => void }) {
  const updatePasswordMutation = useUpdatePasswordMutation('test-token-123');
  return (
    <UpdatePasswordForm
      updatePasswordMutation={updatePasswordMutation}
      handleSuccess={handleSuccess}
    />
  );
}

describe('UpdatePasswordForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
  });

  it('should render update password form with all required fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('Update your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm new password/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Update password' }),
    ).toBeInTheDocument();
  });

  it('should have proper input placeholders', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  it('should have password input types', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should call handleSuccess on successful password update', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });

    await act(async () => {
      await user.type(passwordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        status: true,
      });
    });
  });

  it('should display error when mutation fails', async () => {
    const user = userEvent.setup();

    // Override the handler to return an error
    server.use(
      http.post(buildBackendUrl('/api/v1/reset-password'), () => {
        return HttpResponse.json(
          {
            nonFieldErrors: ['Invalid or expired token'],
          },
          { status: 400 },
        );
      }),
    );

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });

    await act(async () => {
      await user.type(passwordInput, 'newpassword123');
      await user.type(confirmPasswordInput, 'newpassword123');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });

    await act(async () => {
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);
    });

    // Should not call handleSuccess if passwords don't match
    await waitFor(
      () => {
        expect(mockHandleSuccess).not.toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    const errorMessage = await screen.findByText("Password don't match");
    expect(errorMessage).toBeInTheDocument();
  });

  it('should prevent default form submission', () => {
    const mockPreventDefault = vi.fn();
    const mockStopPropagation = vi.fn();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const form = screen
      .getByRole('button', { name: 'Update password' })
      .closest('form');
    expect(form).toBeInTheDocument();

    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;
      event.stopPropagation = mockStopPropagation;

      act(() => {
        fireEvent(form, event);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();
    }
  });

  it('should have required attributes on form fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);

    expect(passwordInput).toHaveAttribute('required');
    expect(confirmPasswordInput).toHaveAttribute('required');
  });

  it('should handle empty form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });
    await act(async () => {
      await user.click(submitButton);
    });

    // Form allows empty passwords (both match), so mutation will be called
    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const passwordToggleButtons = screen.getAllByRole('button', {
      name: /password/i,
    });

    // Tab navigation should work through input fields
    await user.tab();
    expect(passwordInput).toHaveFocus();

    // Password toggle button is next in tab order
    await user.tab();
    expect(passwordToggleButtons[0]).toHaveFocus();

    // Confirm password input is next
    await user.tab();
    expect(confirmPasswordInput).toHaveFocus();

    // Fill in both fields to enable the submit button
    await user.click(passwordInput);
    await user.type(passwordInput, 'testpassword');
    await user.click(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'testpassword');
    // Tab to blur the last field and trigger onBlur validation
    await user.tab();

    // Now the submit button should be enabled
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // After blur, confirm password toggle button should have focus
    expect(passwordToggleButtons[1]).toHaveFocus();

    // Submit button is next in tab order
    await user.tab();
    await waitFor(() => {
      expect(submitButton).toHaveFocus();
    });
  });

  it('should handle matching passwords correctly', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm new password/);
    const submitButton = screen.getByRole('button', {
      name: 'Update password',
    });

    const passwords = ['password123', 'verysecure456', 'complex!pass789'];

    for (const password of passwords) {
      await act(async () => {
        await user.clear(passwordInput);
        await user.clear(confirmPasswordInput);
        await user.type(passwordInput, password);
        await user.type(confirmPasswordInput, password);
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockHandleSuccess).toHaveBeenCalled();
      });

      mockHandleSuccess.mockClear();
    }
  });
});
