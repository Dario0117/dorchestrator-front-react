import { useAppForm } from '@components/org/forms/hooks/app-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AppFormTextarea', () => {
  const TestFormWrapper = ({
    initialValue = '',
    hasError = false,
    errorMessage = 'This field is required',
    required = false,
    rows,
    maxLength,
    placeholder = 'Enter value',
    label = 'Test Field',
  }: {
    initialValue?: string;
    hasError?: boolean;
    errorMessage?: string;
    required?: boolean;
    rows?: number;
    maxLength?: number;
    placeholder?: string;
    label?: string;
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
            <field.AppFormTextarea
              label={label}
              placeholder={placeholder}
              required={required}
              rows={rows}
              maxLength={maxLength}
            />
          )}
        </form.AppField>
      </form>
    );
  };

  it('should render textarea with label', () => {
    render(<TestFormWrapper label="Description" />);

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('should render textarea with placeholder', () => {
    render(<TestFormWrapper placeholder="Enter description" />);

    expect(
      screen.getByPlaceholderText('Enter description'),
    ).toBeInTheDocument();
  });

  it('should render required indicator when required is true', () => {
    render(
      <TestFormWrapper
        label="Description"
        required={true}
      />,
    );

    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
  });

  it('should not render required indicator when required is false', () => {
    render(
      <TestFormWrapper
        label="Description"
        required={false}
      />,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should display initial value', () => {
    render(
      <TestFormWrapper
        initialValue="some text"
        label="Description"
      />,
    );

    const textarea = screen.getByLabelText(
      'Description',
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('some text');
  });

  it('should update value on user typing', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper label="Description" />);

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'hello world');

    await waitFor(() => {
      expect(textarea).toHaveValue('hello world');
    });
  });

  it('should display error message when field has error', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        hasError={true}
        errorMessage="Description is required"
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'a');
    await user.clear(textarea);

    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('should set aria-invalid when field has error', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        hasError={true}
        errorMessage="Invalid"
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'a');
    await user.clear(textarea);

    await waitFor(() => {
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should set aria-describedby when field has error', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        hasError={true}
        errorMessage="Error"
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'a');
    await user.clear(textarea);

    await waitFor(() => {
      expect(textarea).toHaveAttribute('aria-describedby', 'testField-error');
    });
  });

  it('should render error message with role alert', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        hasError={true}
        errorMessage="Error message"
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'a');
    await user.clear(textarea);

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error message');
    });
  });

  it('should not display error message when field has no error', () => {
    render(<TestFormWrapper label="Description" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display character count when maxLength is provided', () => {
    render(
      <TestFormWrapper
        label="Description"
        maxLength={100}
      />,
    );

    expect(screen.getByText('0/100')).toBeInTheDocument();
  });

  it('should update character count as user types', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        maxLength={100}
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'hello');

    await waitFor(() => {
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });
  });

  it('should not display character count when maxLength is not provided', () => {
    render(<TestFormWrapper label="Description" />);

    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it('should show character count when exceeding maxLength', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        maxLength={3}
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'abcd');

    await waitFor(() => {
      expect(screen.getByText('4/3')).toBeInTheDocument();
    });
  });

  it('should show character count when within maxLength', async () => {
    const user = userEvent.setup();
    render(
      <TestFormWrapper
        label="Description"
        maxLength={10}
      />,
    );

    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'abc');

    await waitFor(() => {
      expect(screen.getByText('3/10')).toBeInTheDocument();
    });
  });

  it('should handle blur event', async () => {
    const user = userEvent.setup();
    render(<TestFormWrapper label="Description" />);

    const textarea = screen.getByLabelText('Description');
    await user.click(textarea);
    await user.tab();

    expect(textarea).not.toHaveFocus();
  });

  it('should properly associate label with textarea via htmlFor', () => {
    render(<TestFormWrapper label="Description" />);

    const label = screen.getByText('Description').closest('label');
    const textarea = screen.getByLabelText('Description');

    expect(label).toHaveAttribute('for', 'testField');
    expect(textarea).toHaveAttribute('id', 'testField');
  });

  it('should handle non-string field value gracefully for charCount', () => {
    const TestFormWithNonStringValue = () => {
      const form = useAppForm({
        defaultValues: {
          testField: undefined as unknown as string,
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
          <form.AppField name="testField">
            {(field) => (
              <field.AppFormTextarea
                label="Description"
                maxLength={100}
              />
            )}
          </form.AppField>
        </form>
      );
    };

    render(<TestFormWithNonStringValue />);

    expect(screen.getByText('0/100')).toBeInTheDocument();
  });
});
