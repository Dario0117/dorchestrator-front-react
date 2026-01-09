import { useAppForm } from '@components/org/forms/hooks/app-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AppSubscribeErrorButton', () => {
  const TestFormWrapper = ({
    onSubmit = vi.fn(),
    shouldFail = false,
    errorMessages = ['An error occurred'],
  }: {
    onSubmit?: () => void;
    shouldFail?: boolean;
    errorMessages?: string[];
  }) => {
    const form = useAppForm({
      defaultValues: {
        username: '',
        password: '',
      },
      validators: {
        onSubmitAsync: async () => {
          await Promise.resolve();
          if (shouldFail) {
            return {
              form: errorMessages,
              fields: {},
            };
          }
          onSubmit();
          return undefined;
        },
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
        <button
          type="submit"
          data-testid="submit-button"
        >
          Submit
        </button>
        <form.AppForm>
          <form.AppSubscribeErrorButton />
        </form.AppForm>
      </form>
    );
  };

  it('should not render error when there are no submission errors', () => {
    render(<TestFormWrapper />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render error message after failed form submission', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Invalid credentials']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    // Fill form with valid data
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');

    // Submit form
    await user.click(submitButton);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should render multiple error messages', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Error 1', 'Error 2', 'Error 3']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });
  });

  it('should display error in destructive alert variant', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Server error']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  it('should display error on failed submission', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Login failed']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    // First submission fails
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('should not render anything when errors array is empty', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={[]}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    // No error should be displayed for empty array
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should subscribe to errorMap state changes', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Network error']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    // Initially no error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Trigger error
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    // Error appears
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should handle different error message formats', async () => {
    const user = userEvent.setup();
    const errorScenarios = [
      ['Authentication failed'],
      ['Username not found', 'Password incorrect'],
      ['Server error', 'Please try again', 'Contact support'],
    ];

    for (const errors of errorScenarios) {
      const { unmount } = render(
        <TestFormWrapper
          shouldFail={true}
          errorMessages={errors}
        />,
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');
      await user.click(submitButton);

      await waitFor(() => {
        errors.forEach((error) => {
          expect(screen.getByText(error)).toBeInTheDocument();
        });
      });

      unmount();
    }
  });

  it('should display error after failed submission', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Persistent error']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Persistent error')).toBeInTheDocument();
    });
  });

  it('should render with FormErrorDisplay component', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        shouldFail={true}
        errorMessages={['Test error']}
      />,
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      // FormErrorDisplay renders errors with AlertTitle component
      const alertTitle = alert.querySelector('[data-slot="alert-title"]');
      expect(alertTitle).toBeInTheDocument();
    });
  });
});
