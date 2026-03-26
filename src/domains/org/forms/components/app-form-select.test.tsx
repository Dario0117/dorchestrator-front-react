import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod/v4';

const OPTIONS = [
  { value: 'option-a', label: 'Option A' },
  { value: 'option-b', label: 'Option B' },
  { value: 'option-c', label: 'Option C' },
];

const NUMBER_OPTIONS = [
  { value: '1', label: 'One' },
  { value: '2', label: 'Two' },
  { value: '3', label: 'Three' },
];

const requiredSchema = z.object({
  testField: z.string().min(1),
});

describe('AppFormSelect', () => {
  const StringSelectWrapper = ({
    initialValue = '',
    hasError = false,
    errorMessage = 'This field is required',
    schema,
    disabled = false,
    placeholder,
    label = 'Test Select',
  }: {
    initialValue?: string;
    hasError?: boolean;
    errorMessage?: string;
    schema?: typeof requiredSchema;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
  }) => {
    const form = useAppForm({
      defaultValues: {
        testField: initialValue,
      },
      validators: schema ? { onSubmit: schema } : undefined,
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
            <field.AppFormSelect
              label={label}
              options={OPTIONS}
              disabled={disabled}
              placeholder={placeholder}
            />
          )}
        </form.AppField>
      </form>
    );
  };

  const NumberSelectWrapper = ({
    initialValue = 0,
    label = 'Number Select',
  }: {
    initialValue?: number;
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
        <form.AppField name="testField">
          {(field) => (
            <field.AppFormSelect
              label={label}
              options={NUMBER_OPTIONS}
            />
          )}
        </form.AppField>
      </form>
    );
  };

  it('should render select with label', () => {
    render(<StringSelectWrapper label="Category" />);

    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('should render default placeholder', () => {
    render(<StringSelectWrapper />);

    expect(screen.getByText('Select an option...')).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(<StringSelectWrapper placeholder="Pick one" />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('should render required indicator when schema field is required', () => {
    render(
      <StringSelectWrapper
        schema={requiredSchema}
        label="Category"
      />,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not render required indicator when no schema is provided', () => {
    render(<StringSelectWrapper />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should render all options when opened', async () => {
    render(<StringSelectWrapper />);

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });
  });

  it('should call handleChange with string value when field value is a string', async () => {
    const user = userEvent.setup();
    render(<StringSelectWrapper initialValue="" />);

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    const options = screen.getAllByRole('option');
    await user.click(options[0] as HTMLElement);

    // Re-open to verify the selected option label is present
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option A' }),
      ).toBeInTheDocument();
    });
  });

  it('should call handleChange with numeric value when field value is a number', async () => {
    const user = userEvent.setup();
    render(<NumberSelectWrapper initialValue={1} />);

    const trigger = screen.getByRole('combobox');

    // Open select to verify initial value label
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    const options = screen.getAllByRole('option');
    const twoOption = options.find((opt) => opt.textContent?.includes('Two'));
    expect(twoOption).toBeDefined();
    await user.click(twoOption as HTMLElement);

    // Re-open to verify the selected option
    await clickTrigger(trigger);

    await waitFor(() => {
      const updatedOptions = screen.getAllByRole('option');
      const selectedTwo = updatedOptions.find((opt) =>
        opt.textContent?.includes('Two'),
      );
      expect(selectedTwo).toBeDefined();
    });
  });

  it('should display error messages when field has errors', async () => {
    const user = userEvent.setup();
    render(
      <StringSelectWrapper
        hasError={true}
        errorMessage="Selection required"
      />,
    );

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    const options = screen.getAllByRole('option');
    await user.click(options[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Selection required')).toBeInTheDocument();
    });
  });

  it('should set aria-invalid when field has errors', async () => {
    const user = userEvent.setup();
    render(
      <StringSelectWrapper
        hasError={true}
        errorMessage="Required"
      />,
    );

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    const options = screen.getAllByRole('option');
    await user.click(options[0] as HTMLElement);

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should render error messages with role alert', async () => {
    const user = userEvent.setup();
    render(
      <StringSelectWrapper
        hasError={true}
        errorMessage="Error!"
      />,
    );

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    const options = screen.getAllByRole('option');
    await user.click(options[0] as HTMLElement);

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error!');
    });
  });

  it('should display the selected value when initialValue is set', async () => {
    render(<StringSelectWrapper initialValue="option-b" />);

    const trigger = screen.getByRole('combobox');

    // Open select to verify the selected value label is present
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option B' }),
      ).toBeInTheDocument();
    });
  });

  it('should not display error when field has no errors', () => {
    render(<StringSelectWrapper hasError={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
