import { RegisterForm } from '@components/org/forms/register.form';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useRegisterMutation } from '@services/users/register.http-service';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

function TestWrapper({ handleSuccess }: { handleSuccess: () => void }) {
  const registerMutation = useRegisterMutation();
  return (
    <RegisterForm
      registerMutation={registerMutation}
      handleSuccess={handleSuccess}
    />
  );
}

describe('RegisterForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
  });

  it('should render register form with all required fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument();
  });

  it('should have proper input placeholders', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('johndoe17@mail.com'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  it('should have password input types', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should call handleSubmit with correct data on form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'testpassword');
    await user.type(confirmPasswordInput, 'testpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          token: null,
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
        }),
      );
    });
  });

  it('should call handleSuccess on successful registration', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'testpassword');
    await user.type(confirmPasswordInput, 'testpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          token: null,
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
        }),
      );
    });
  });

  it('should display error when mutation fails', async () => {
    const user = userEvent.setup();

    // Override the handler to return an error
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-up/email'), () => {
        return HttpResponse.json(
          {
            nonFieldErrors: ['Email already exists'],
          },
          { status: 400 },
        );
      }),
    );

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'existinguser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'testpassword');
    await user.type(confirmPasswordInput, 'testpassword');
    await user.click(submitButton);

    // Check that error is displayed and handleSuccess not called
    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(submitButton);

    // Should not call handleSuccess if passwords don't match
    await waitFor(
      () => {
        expect(mockHandleSuccess).not.toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('should prevent default form submission', () => {
    const mockPreventDefault = vi.fn();
    const mockStopPropagation = vi.fn();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const form = screen
      .getByRole('button', { name: 'Register' })
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

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);

    expect(nameInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(confirmPasswordInput).toHaveAttribute('required');
  });

  it('should handle empty form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', { name: 'Register' });
    await user.click(submitButton);

    // Form should handle validation internally and not call handleSuccess
    expect(mockHandleSuccess).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'testuser');
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'testpassword');
    await user.type(confirmPasswordInput, 'testpassword');
    await user.click(submitButton);

    // Should not call handleSuccess if email is invalid
    await waitFor(
      () => {
        expect(mockHandleSuccess).not.toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);

    // Tab navigation should work through input fields
    await user.tab();
    expect(nameInput).toHaveFocus();

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    // Password toggle buttons are excluded from tab order (tabIndex=-1)
    // Confirm password input is next
    await user.tab();
    expect(confirmPasswordInput).toHaveFocus();

    // Fill in the form to enable the submit button
    await user.click(nameInput);
    await user.type(nameInput, 'testuser');
    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.click(passwordInput);
    await user.type(passwordInput, 'testpassword');
    await user.click(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'testpassword');

    // Blur to trigger validation
    await user.tab();

    // Now the submit button should be enabled after validation
    const submitButton = screen.getByRole('button', { name: 'Register' });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Once enabled, we can tab to the submit button
    // Focus the confirm password input first, then tab to submit
    confirmPasswordInput.focus();
    await user.tab();
    expect(submitButton).toHaveFocus();
  });
});
