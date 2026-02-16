import { useAppForm } from '@components/org/forms/hooks/app-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AppFormField', () => {
  const TestFormWrapper = ({
    initialValue = '',
    hasError = false,
    errorMessage = 'This field is required',
    required = false,
    type = 'text',
    placeholder = 'Enter value',
    label = 'Test Field',
    children,
  }: {
    initialValue?: string;
    hasError?: boolean;
    errorMessage?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    label?: string;
    children?: React.ReactNode;
  }) => {
    const form = useAppForm({
      defaultValues: {
        testField: initialValue,
      },
      onSubmit: async () => {
        // Intentionally empty for testing
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <form.AppField
          name="testField"
          validators={{
            onChange: hasError ? () => errorMessage : undefined,
          }}
        >
          {(field) => (
            <field.AppFormField
              label={label}
              placeholder={placeholder}
              type={type}
              required={required}
            >
              {children}
            </field.AppFormField>
          )}
        </form.AppField>
      </form>
    );
  };

  it('should render field with label', () => {
    render(<TestFormWrapper label="Username" />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('should render field with placeholder', () => {
    render(<TestFormWrapper placeholder="Enter username" />);

    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should render required indicator when required is true', () => {
    render(
      <TestFormWrapper
        label="Email"
        required={true}
      />,
    );

    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(screen.getByLabelText('Email*')).toBeInTheDocument();
  });

  it('should not render required indicator when required is false', () => {
    render(
      <TestFormWrapper
        label="Email"
        required={false}
      />,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render input with correct type attribute', () => {
    render(
      <TestFormWrapper
        type="email"
        label="Email"
      />,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should render password input type', () => {
    render(
      <TestFormWrapper
        type="password"
        label="Password"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should render PasswordInput component with toggle button for password type', () => {
    render(
      <TestFormWrapper
        type="password"
        label="Password"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    // Should have a toggle button
    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should toggle password visibility in form context', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        type="password"
        label="Password"
      />,
    );

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: 'Show password' });

    // Initially password type
    expect(input).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toBeInTheDocument();

    // Click again to hide password
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
  });

  it('should maintain password value when toggling visibility', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        type="password"
        label="Password"
        initialValue="SecurePassword123"
      />,
    );

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: 'Show password' });

    expect(input.value).toBe('SecurePassword123');

    // Toggle visibility
    await user.click(toggleButton);
    expect(input.value).toBe('SecurePassword123');
    expect(input).toHaveAttribute('type', 'text');

    // Toggle back
    await user.click(toggleButton);
    expect(input.value).toBe('SecurePassword123');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should render text input by default', () => {
    render(<TestFormWrapper label="Name" />);

    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should display initial value', () => {
    render(
      <TestFormWrapper
        initialValue="test value"
        label="Field"
      />,
    );

    const input = screen.getByLabelText('Field') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('should update input value on user typing', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper label="Username" />);

    const input = screen.getByLabelText('Username') as HTMLInputElement;

    await user.type(input, 'newvalue');

    await waitFor(() => {
      expect(input.value).toBe('newvalue');
    });
  });

  it('should display error message when field has error', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Username"
        hasError={true}
        errorMessage="Username is required"
      />,
    );

    const input = screen.getByLabelText('Username');

    // Trigger onChange to show error
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
  });

  it('should set aria-invalid when field has error', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Email"
        hasError={true}
        errorMessage="Invalid email"
      />,
    );

    const input = screen.getByLabelText('Email');

    // Trigger onChange to show error
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should set aria-describedby when field has error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Password is required';
    render(
      <TestFormWrapper
        label="Password"
        hasError={true}
        errorMessage={errorMessage}
      />,
    );

    const input = screen.getByLabelText('Password');

    // Trigger onChange to show error
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-describedby', 'testField-error');
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render error message with role alert', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Field"
        hasError={true}
        errorMessage="Error message"
      />,
    );

    const input = screen.getByLabelText('Field');

    // Trigger onChange to show error
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error message');
    });
  });

  it('should not display error message when field has no error', () => {
    render(
      <TestFormWrapper
        label="Field"
        hasError={false}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render children when provided', () => {
    render(
      <TestFormWrapper label="Field">
        <span data-testid="custom-child">Custom content</span>
      </TestFormWrapper>,
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should have required attribute when required is true', () => {
    render(
      <TestFormWrapper
        label="Email"
        required={true}
      />,
    );

    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('required');
  });

  it('should not have required attribute when required is false', () => {
    render(
      <TestFormWrapper
        label="Email"
        required={false}
      />,
    );

    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('required');
  });

  it('should handle blur event', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper label="Username" />);

    const input = screen.getByLabelText('Username');

    await user.click(input);
    await user.tab();

    // Input should lose focus
    expect(input).not.toHaveFocus();
  });

  it('should display "Invalid input" for non-string error messages', async () => {
    const user = userEvent.setup();
    const TestFormWrapperWithObjectError = () => {
      const form = useAppForm({
        defaultValues: {
          testField: '',
        },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField
            name="testField"
            validators={{
              onChange: () => ({ type: 'required' }) as unknown as string,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Field"
                placeholder="Enter value"
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWrapperWithObjectError />);

    const input = screen.getByLabelText('Field');

    // Trigger onChange to show error
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });
  });

  it('should handle number input type', () => {
    render(
      <TestFormWrapper
        type="number"
        label="Age"
      />,
    );

    const input = screen.getByLabelText('Age');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should properly associate label with input via htmlFor', () => {
    render(<TestFormWrapper label="Username" />);

    const label = screen.getByText('Username').closest('label');
    const input = screen.getByLabelText('Username');

    expect(label).toHaveAttribute('for', 'testField');
    expect(input).toHaveAttribute('id', 'testField');
  });

  it('should render with proper structure', () => {
    const { container } = render(<TestFormWrapper label="Field" />);

    const gridContainer = container.querySelector('.grid.gap-3');
    expect(gridContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex.items-center');
    expect(flexContainer).toBeInTheDocument();
  });

  it('should call custom onChange handler for password field', async () => {
    const customOnChange = vi.fn();
    const user = userEvent.setup();

    const TestFormWithPasswordOnChange = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField name="testField">
            {(field) => (
              <field.AppFormField
                label="Password"
                type="password"
                onChange={customOnChange}
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithPasswordOnChange />);

    const input = screen.getByLabelText('Password');
    await user.type(input, 'secret');

    expect(customOnChange).toHaveBeenCalled();
  });

  it('should call custom onChange handler for text field', async () => {
    const customOnChange = vi.fn();
    const user = userEvent.setup();

    const TestFormWithTextOnChange = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField name="testField">
            {(field) => (
              <field.AppFormField
                label="Name"
                type="text"
                onChange={customOnChange}
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithTextOnChange />);

    const input = screen.getByLabelText('Name');
    await user.type(input, 'hello');

    expect(customOnChange).toHaveBeenCalled();
  });

  it('should handle array error in normalizeFieldErrors', async () => {
    const user = userEvent.setup();

    const TestFormWithArrayError = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField
            name="testField"
            validators={{
              onChange: () =>
                ['Error from array 1', 'Error from array 2'] as never,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Field"
                placeholder="Enter value"
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithArrayError />);

    const input = screen.getByLabelText('Field');
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByText('Error from array 1')).toBeInTheDocument();
      expect(screen.getByText('Error from array 2')).toBeInTheDocument();
    });
  });

  it('should filter non-string elements from array errors in normalizeFieldErrors', async () => {
    const user = userEvent.setup();

    const TestFormWithMixedArrayError = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField
            name="testField"
            validators={{
              onChange: () => [42, 'Valid error message', null] as never,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Field"
                placeholder="Enter value"
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithMixedArrayError />);

    const input = screen.getByLabelText('Field');
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByText('Valid error message')).toBeInTheDocument();
    });
  });

  it('should handle error object with message property in normalizeFieldErrors', async () => {
    const user = userEvent.setup();

    const TestFormWithMessageError = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField
            name="testField"
            validators={{
              onChange: () =>
                ({ message: 'Error from message property' }) as never,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Field"
                placeholder="Enter value"
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithMessageError />);

    const input = screen.getByLabelText('Field');
    await user.type(input, 'a');
    await user.clear(input);

    await waitFor(() => {
      expect(
        screen.getByText('Error from message property'),
      ).toBeInTheDocument();
    });
  });

  it('should display helper text when provided', () => {
    const TestFormWithHelperText = () => {
      const form = useAppForm({
        defaultValues: { testField: '' },
        onSubmit: async () => {
          // Intentionally empty for testing
        },
      });

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.AppField name="testField">
            {(field) => (
              <field.AppFormField
                label="Slug"
                helperText="Only lowercase letters and hyphens"
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithHelperText />);

    expect(
      screen.getByText('Only lowercase letters and hyphens'),
    ).toBeInTheDocument();
  });
});
