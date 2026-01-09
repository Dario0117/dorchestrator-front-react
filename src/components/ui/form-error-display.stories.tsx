import { FormErrorDisplay } from '@components/ui/form-error-display';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/FormErrorDisplay',
  component: FormErrorDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormErrorDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoError: Story = {
  args: {
    errors: [],
  },
};

export const SimpleError: Story = {
  args: {
    errors: ['Invalid credentials. Please check your username and password.'],
  },
};

export const ValidationError: Story = {
  args: {
    errors: ['Validation failed'],
  },
};

export const ServerError: Story = {
  args: {
    errors: ['Internal server error. Please try again later.'],
  },
};

export const NetworkError: Story = {
  args: {
    errors: [
      'Network error. Please check your internet connection and try again.',
    ],
  },
};

export const LongErrorMessage: Story = {
  args: {
    errors: [
      'Registration failed due to multiple validation errors. Please review all fields and ensure they meet the requirements. Username must be unique, password must be at least 8 characters with uppercase, lowercase, and special characters, and email must be valid.',
    ],
  },
};

export const InFormContext: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <form className="space-y-4">
        <div className="grid gap-2">
          <label
            htmlFor="username-demo"
            className="text-sm font-medium"
          >
            Username
          </label>
          <input
            id="username-demo"
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            placeholder="Enter username"
          />
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="password-demo"
            className="text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password-demo"
            type="password"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            placeholder="Enter password"
          />
        </div>
        <button
          type="submit"
          className="w-full h-9 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Sign In
        </button>
        <FormErrorDisplay {...args} />
      </form>
    </div>
  ),
  args: {
    errors: ['Invalid username or password. Please try again.'],
  },
};
