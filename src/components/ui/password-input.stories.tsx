import { Label } from '@components/ui/label';
import { PasswordInput } from '@components/ui/password-input';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
    required: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your password',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'SecurePassword123',
    placeholder: 'Enter your password',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'CannotEditThis',
    placeholder: 'Enter your password',
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'Password is required',
  },
};

export const WithError: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'weak',
    placeholder: 'Enter your password',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="password-input">Password</Label>
      <PasswordInput
        id="password-input"
        {...args}
      />
    </div>
  ),
  args: {
    placeholder: 'Enter your password',
  },
};

export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid gap-2 w-80">
      <Label htmlFor="password-with-help">Password</Label>
      <PasswordInput
        id="password-with-help"
        aria-describedby="password-help"
        {...args}
      />
      <p
        id="password-help"
        className="text-sm text-muted-foreground"
      >
        Must be at least 8 characters with uppercase, lowercase, and numbers
      </p>
    </div>
  ),
  args: {
    placeholder: 'Enter secure password',
  },
};

export const InteractiveDemo: Story = {
  render: () => (
    <div className="grid gap-6 w-80">
      <div className="grid gap-2">
        <Label htmlFor="demo-password">Password</Label>
        <PasswordInput
          id="demo-password"
          placeholder="Try clicking the eye icon"
          defaultValue="DemoPassword123"
        />
        <p className="text-xs text-muted-foreground">
          Click the eye icon to toggle password visibility
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="demo-confirm">Confirm Password</Label>
        <PasswordInput
          id="demo-confirm"
          placeholder="Confirm your password"
        />
      </div>
    </div>
  ),
};

export const MultipleStates: Story = {
  render: () => (
    <div className="grid gap-4 w-80">
      <div className="grid gap-2">
        <Label>Default</Label>
        <PasswordInput placeholder="Enter password" />
      </div>

      <div className="grid gap-2">
        <Label>With Value</Label>
        <PasswordInput
          defaultValue="MySecretPassword"
          placeholder="Enter password"
        />
      </div>

      <div className="grid gap-2">
        <Label>Required</Label>
        <PasswordInput
          required
          placeholder="Required field"
        />
      </div>

      <div className="grid gap-2">
        <Label>Error State</Label>
        <PasswordInput
          aria-invalid
          defaultValue="weak"
          placeholder="Enter password"
        />
      </div>

      <div className="grid gap-2">
        <Label>Disabled</Label>
        <PasswordInput
          disabled
          defaultValue="CannotEdit"
          placeholder="Enter password"
        />
      </div>
    </div>
  ),
};
