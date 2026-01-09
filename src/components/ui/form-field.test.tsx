import { FormField } from '@components/ui/form-field';
import { useForm } from '@tanstack/react-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test wrapper component to provide form context
function TestFormField({
  initialValue = '',
  label = 'Test Label',
  placeholder = 'Test placeholder',
  type = 'text',
  required = false,
  children = null,
}: {
  initialValue?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  const form = useForm({
    defaultValues: {
      testField: initialValue,
    },
  });

  return (
    <form.Field name="testField">
      {(field) => (
        <FormField
          field={field}
          label={label}
          placeholder={placeholder}
          type={type as React.ComponentPropsWithoutRef<'input'>['type']}
          required={required}
        >
          {children}
        </FormField>
      )}
    </form.Field>
  );
}

describe('FormField', () => {
  it('should render successfully with label and input', () => {
    render(
      <TestFormField
        label="Username"
        placeholder="Enter username"
      />,
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should render required indicator when required is true', () => {
    render(
      <TestFormField
        label="Password"
        required={true}
      />,
    );

    expect(screen.getByText('Password')).toBeInTheDocument();
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk.tagName).toBe('SPAN');
  });

  it('should not render required indicator when required is false', () => {
    render(
      <TestFormField
        label="Optional Field"
        required={false}
      />,
    );

    expect(screen.getByText('Optional Field')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should handle different input types', () => {
    const { rerender } = render(<TestFormField type="email" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<TestFormField type="password" />);
    input = screen.getByLabelText('Test Label') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');

    rerender(<TestFormField type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();

    render(<TestFormField placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('should render children content', () => {
    render(
      <TestFormField label="Email">
        <span>Helper text</span>
      </TestFormField>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('should display validation errors when field has errors', () => {
    // Create a mock field with errors
    const mockFieldWithError = {
      name: 'testField',
      state: {
        value: 'ab',
        meta: {
          errors: ['Too short'],
        },
      },
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
    };

    render(
      <FormField
        field={
          mockFieldWithError as unknown as Parameters<
            typeof FormField
          >[0]['field']
        }
        label="Test Field"
        placeholder="Enter value"
      />,
    );

    // The error should be displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestFormField
        label="Email Address"
        required={true}
      />,
    );

    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'testField');
    expect(input).toHaveAttribute('id', 'testField');
    expect(input).toHaveAttribute('name', 'testField');
    expect(input).toBeRequired();
  });

  it('should set aria-invalid when there are errors', () => {
    // Create a mock field with errors
    const mockFieldWithError = {
      name: 'testField',
      state: {
        value: '',
        meta: {
          errors: ['Required field'],
        },
      },
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
    };

    render(
      <FormField
        field={
          mockFieldWithError as unknown as Parameters<
            typeof FormField
          >[0]['field']
        }
        label="Required Field"
        placeholder="Enter value"
      />,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'testField-error');
  });

  it('should handle blur events', async () => {
    const user = userEvent.setup();

    render(<TestFormField placeholder="Focus and blur" />);

    const input = screen.getByPlaceholderText('Focus and blur');

    await user.click(input);
    expect(input).toHaveFocus();

    await user.tab();
    expect(input).not.toHaveFocus();
  });

  it('should have proper structure with wrapper div', () => {
    const { container } = render(<TestFormField label="Test" />);

    const wrapper = container.querySelector('.grid.gap-3');
    expect(wrapper).toBeInTheDocument();
  });
});
