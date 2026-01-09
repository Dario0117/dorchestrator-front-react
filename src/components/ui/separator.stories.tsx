import { Separator } from '@components/ui/separator';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A visual separator component that can be horizontal or vertical.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
    decorative: {
      control: { type: 'boolean' },
      description: 'Whether the separator is decorative',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-64 space-y-4">
      <div>Content above</div>
      <Separator {...args} />
      <div>Content below</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-32 items-center space-x-4">
      <div>Left content</div>
      <Separator {...args} />
      <div>Right content</div>
    </div>
  ),
};

export const InText: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">Settings</h3>
      <Separator {...args} />
      <p className="text-sm text-muted-foreground">
        Manage your account settings and preferences.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Separator used to divide content sections.',
      },
    },
  },
};

export const InSidebar: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-48 space-y-2 rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Navigation</p>
        <div className="space-y-1">
          <div className="rounded px-2 py-1 text-sm hover:bg-accent">Home</div>
          <div className="rounded px-2 py-1 text-sm hover:bg-accent">About</div>
        </div>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <p className="text-sm font-medium">Account</p>
        <div className="space-y-1">
          <div className="rounded px-2 py-1 text-sm hover:bg-accent">
            Profile
          </div>
          <div className="rounded px-2 py-1 text-sm hover:bg-accent">
            Settings
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Separator used in sidebar navigation to group related items.',
      },
    },
  },
};
