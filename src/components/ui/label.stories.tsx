import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const Required: Story = {
  args: {
    children: (
      <>
        Username <span className="text-destructive">*</span>
      </>
    ),
  },
};

export const WithInput: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label
        htmlFor="username"
        {...args}
      >
        Username
      </Label>
      <Input
        id="username"
        placeholder="Enter your username"
      />
    </div>
  ),
};

export const WithRequiredInput: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label
        htmlFor="email"
        {...args}
      >
        Email Address <span className="text-destructive">*</span>
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="email@example.com"
        required
      />
    </div>
  ),
};

export const DisabledGroup: Story = {
  render: (args) => (
    <div
      className="grid gap-2"
      data-disabled="true"
    >
      <Label
        htmlFor="disabled-input"
        {...args}
      >
        Disabled Field
      </Label>
      <Input
        id="disabled-input"
        placeholder="Cannot edit"
        disabled
      />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="grid gap-4 w-full max-w-sm">
      <div className="grid gap-2">
        <Label htmlFor="first-name">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="first-name"
          placeholder="John"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="last-name">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="last-name"
          placeholder="Doe"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email-form">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email-form"
          type="email"
          placeholder="john@example.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </form>
  ),
};
