import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    required: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '123',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    'aria-invalid': true,
    placeholder: 'Invalid input',
    value: 'invalid@',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="example-input">Username</Label>
      <Input
        id="example-input"
        {...args}
      />
    </div>
  ),
  args: {
    placeholder: 'johndoe',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="grid gap-4 w-full max-w-sm">
      <div className="grid gap-2">
        <Label>Text</Label>
        <Input
          type="text"
          placeholder="Text input"
        />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="email@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="Password"
        />
      </div>
      <div className="grid gap-2">
        <Label>Number</Label>
        <Input
          type="number"
          placeholder="123"
        />
      </div>
      <div className="grid gap-2">
        <Label>Search</Label>
        <Input
          type="search"
          placeholder="Search..."
        />
      </div>
      <div className="grid gap-2">
        <Label>Disabled</Label>
        <Input
          disabled
          placeholder="Disabled"
        />
      </div>
    </div>
  ),
};

export const WithFileUpload: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="file-upload">Upload File</Label>
      <Input
        id="file-upload"
        type="file"
      />
    </div>
  ),
};
