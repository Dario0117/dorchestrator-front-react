import { useAppForm } from '@components/org/forms/hooks/app-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AppSubscribeSubmitButton', () => {
  const TestFormWrapper = ({
    defaultValues = { username: '', password: '' },
    onSubmit = vi.fn(),
    label = 'Submit',
  }: {
    defaultValues?: { username: string; password: string };
    onSubmit?: () => void;
    label?: string;
  }) => {
    const form = useAppForm({
      defaultValues,
      onSubmit: () => {
        onSubmit();
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.AppField
          name="username"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Username is required' : undefined,
          }}
        >
          {(field) => (
            <input
              data-testid="username-input"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Password is required' : undefined,
          }}
        >
          {(field) => (
            <input
              data-testid="password-input"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.AppSubscribeSubmitButton label={label} />
        </form.AppForm>
      </form>
    );
  };

  it('should render button with provided label', () => {
    render(<TestFormWrapper label="Login" />);

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should render button with custom label', () => {
    render(<TestFormWrapper label="Register" />);

    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument();
  });

  it('should be disabled when form is pristine', () => {
    render(<TestFormWrapper />);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
  });

  it('should be enabled when form is dirty even if fields are invalid', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    // Type and clear — form is dirty (values changed from defaults)
    await user.type(usernameInput, 'a');
    await user.clear(usernameInput);

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it('should be enabled when form is valid and not pristine', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should have type submit', () => {
    render(<TestFormWrapper />);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should enable button when form becomes valid', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    // Initially disabled
    expect(button).toBeDisabled();

    // Fill in both fields
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should stay enabled when form becomes invalid after being valid', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    // Fill in both fields
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    // Clear username — form is still dirty, so button stays enabled.
    // Validation gates the actual submission, not the button state.
    await user.clear(usernameInput);

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it('should become enabled with only one field filled when validation allows', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    await user.type(usernameInput, 'testuser');

    // Button becomes enabled because onChange validator only checks empty string
    // and pristine state changed. This is the actual behavior of the component.
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should handle form with pre-filled valid values', () => {
    render(
      <TestFormWrapper
        defaultValues={{ username: 'existinguser', password: 'existingpass' }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Submit' });

    // Button should still be disabled because form is pristine
    expect(button).toBeDisabled();
  });

  it('should work with different button labels', () => {
    const labels = ['Submit', 'Login', 'Register', 'Continue', 'Next'];

    labels.forEach((label) => {
      const { unmount } = render(<TestFormWrapper label={label} />);
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      unmount();
    });
  });

  it('should subscribe to form state changes', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    // Initially disabled
    expect(button).toBeDisabled();

    // Type full username
    await user.type(usernameInput, 'testuser');

    // Button becomes enabled after typing in username field
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    // Type in password
    await user.type(passwordInput, 'pass');

    // Should remain enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should maintain button state during rapid field changes', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const button = screen.getByRole('button', { name: 'Submit' });

    // Rapid typing
    await user.type(usernameInput, 'user');
    await user.type(passwordInput, 'pass');

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    // Rapid clearing — form is still dirty, button stays enabled
    await user.clear(usernameInput);

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });
});
