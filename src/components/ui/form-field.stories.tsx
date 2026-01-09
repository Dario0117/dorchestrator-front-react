import { Button } from '@components/ui/button';
import { FormField } from '@components/ui/form-field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AnyFieldApi } from '@tanstack/react-form';

// Mock field API for Storybook
const createMockField = (overrides: Partial<AnyFieldApi> = {}): AnyFieldApi => {
  const defaultMeta = {
    errors: [],
    isTouched: false,
    isBlurred: false,
    isDirty: false,
    isPristine: true,
    errorMap: {},
    errorSourceMap: {},
    isValidating: false,
    isValid: true,
    isDefaultValue: true,
    ...overrides.state?.meta,
  };

  return {
    name: overrides.name || 'example',
    state: {
      value: '',
      meta: defaultMeta,
      ...overrides.state,
    },
    handleChange: (value: string) => console.log('Field changed:', value),
    handleBlur: () => console.log('Field blurred'),
    triggerOnBlurListener: () => {
      // Mock implementation for Storybook
    },
    triggerOnChangeListener: () => {
      // Mock implementation for Storybook
    },
    form: {} as unknown,
    options: {} as unknown,
    store: {} as unknown,
    timeoutIds: {},
    mount: () => {
      // Mock implementation for Storybook
    },
    unmount: () => {
      // Mock implementation for Storybook
    },
    update: () => {
      // Mock implementation for Storybook
    },
    getValue: () => overrides.state?.value || '',
    setValue: () => {
      // Mock implementation for Storybook
    },
    getMeta: () => defaultMeta,
    setMeta: () => {
      // Mock implementation for Storybook
    },
    getInfo: () => ({}),
    pushValue: () => {
      // Mock implementation for Storybook
    },
    insertValue: () => {
      // Mock implementation for Storybook
    },
    removeValue: () => {
      // Mock implementation for Storybook
    },
    swapValues: () => {
      // Mock implementation for Storybook
    },
    moveValue: () => {
      // Mock implementation for Storybook
    },
    reset: () => {
      // Mock implementation for Storybook
    },
    validate: () => Promise.resolve([]),
    getLinkedFields: () => [],
    ...overrides,
  } as unknown as AnyFieldApi;
};

const meta = {
  title: 'UI/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    required: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: createMockField(),
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const Required: Story = {
  args: {
    field: createMockField(),
    label: 'Email Address',
    placeholder: 'email@example.com',
    type: 'email',
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    field: createMockField({
      state: {
        value: 'johndoe',
        meta: {
          errors: [],
          isTouched: false,
          isBlurred: false,
          isDirty: true,
          isPristine: false,
          errorMap: {},
          errorSourceMap: {},
          isValidating: false,
          isValid: true,
          isDefaultValue: false,
        },
      },
    }),
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithError: Story = {
  args: {
    field: createMockField({
      state: {
        value: 'invalid-email',
        meta: {
          errors: [{ message: 'Please enter a valid email address' }],
          isTouched: true,
          isBlurred: true,
          isDirty: true,
          isPristine: false,
          errorMap: {},
          errorSourceMap: {},
          isValidating: false,
          isValid: false,
          isDefaultValue: false,
        },
      },
    }),
    label: 'Email Address',
    placeholder: 'email@example.com',
    type: 'email',
    required: true,
  },
};

export const Password: Story = {
  args: {
    field: createMockField(),
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
  },
};

export const WithChildren: Story = {
  args: {
    field: createMockField(),
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
    children: (
      <a
        href="/forgot-password"
        className="ml-auto text-sm underline-offset-4 hover:underline"
      >
        Forgot password?
      </a>
    ),
  },
};

export const MultipleErrors: Story = {
  args: {
    field: createMockField({
      state: {
        value: 'weak',
        meta: {
          errors: [
            { message: 'Password must be at least 8 characters long' },
            'Must contain at least one uppercase letter',
          ],
          isTouched: true,
          isBlurred: true,
          isDirty: true,
          isPristine: false,
          errorMap: {},
          errorSourceMap: {},
          isValidating: false,
          isValid: false,
          isDefaultValue: false,
        },
      },
    }),
    label: 'Password',
    placeholder: 'Enter a strong password',
    type: 'password',
    required: true,
  },
};

export const FormExample: Story = {
  args: {
    field: createMockField(),
    label: 'Form Example',
  },
  render: () => (
    <form className="grid gap-4 w-full max-w-sm">
      <FormField
        field={createMockField({ name: 'firstName' })}
        label="First Name"
        placeholder="John"
        required
      />
      <FormField
        field={createMockField({ name: 'lastName' })}
        label="Last Name"
        placeholder="Doe"
        required
      />
      <FormField
        field={createMockField({ name: 'email' })}
        label="Email Address"
        placeholder="john@example.com"
        type="email"
        required
      />
      <FormField
        field={createMockField({ name: 'phone' })}
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        type="tel"
      />
      <Button
        type="submit"
        className="mt-2"
      >
        Submit
      </Button>
    </form>
  ),
};

export const AllStates: Story = {
  args: {
    field: createMockField(),
    label: 'All States Example',
  },
  render: () => (
    <div className="grid gap-6 w-full max-w-md">
      <FormField
        field={createMockField()}
        label="Normal Field"
        placeholder="Enter text"
      />
      <FormField
        field={createMockField()}
        label="Required Field"
        placeholder="This field is required"
        required
      />
      <FormField
        field={createMockField({
          state: {
            value: 'filled value',
            meta: {
              errors: [],
              isTouched: true,
              isBlurred: false,
              isDirty: true,
              isPristine: false,
              errorMap: {},
              errorSourceMap: {},
              isValidating: false,
              isValid: true,
              isDefaultValue: false,
            },
          },
        })}
        label="Filled Field"
        placeholder="Placeholder text"
      />
      <FormField
        field={createMockField({
          state: {
            value: 'error value',
            meta: {
              errors: [{ message: 'This field has an error' }],
              isTouched: true,
              isBlurred: true,
              isDirty: true,
              isPristine: false,
              errorMap: {},
              errorSourceMap: {},
              isValidating: false,
              isValid: false,
              isDefaultValue: false,
            },
          },
        })}
        label="Field with Error"
        placeholder="Enter valid input"
        required
      />
    </div>
  ),
};
