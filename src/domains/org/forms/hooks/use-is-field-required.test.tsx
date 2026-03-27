import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { render, screen } from '@testing-library/react';
import { z } from 'zod/v4';

const schemaWithRequired = z.object({
  testField: z.string().min(1, 'Required'),
});

const schemaWithOptional = z.object({
  testField: z.string().optional(),
});

const schemaWithAcceptsEmpty = z.object({
  testField: z.string(),
});

const schemaWithoutField = z.object({
  someOtherField: z.string().min(1, 'Required'),
});

const TestComponent = ({ schema }: { schema?: typeof schemaWithRequired }) => {
  const form = useAppForm({
    defaultValues: {
      testField: '',
    },
    validators: schema ? { onSubmit: schema } : undefined,
    onSubmit: async () => {
      // Intentionally empty for testing
    },
  });

  return (
    <form>
      <form.AppField name="testField">
        {(field) => <field.AppFormField label="Test Field" />}
      </form.AppField>
    </form>
  );
};

describe('useIsFieldRequired', () => {
  it('should show required indicator when schema field rejects undefined and empty string', () => {
    render(<TestComponent schema={schemaWithRequired} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show required indicator when no schema is provided', () => {
    render(<TestComponent />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should not show required indicator when field name is not in schema shape', () => {
    render(
      <TestComponent
        schema={schemaWithoutField as unknown as typeof schemaWithRequired}
      />,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should not show required indicator when schema field accepts empty string', () => {
    render(
      <TestComponent
        schema={schemaWithAcceptsEmpty as unknown as typeof schemaWithRequired}
      />,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should not show required indicator when schema field is optional', () => {
    render(
      <TestComponent
        schema={schemaWithOptional as unknown as typeof schemaWithRequired}
      />,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});
