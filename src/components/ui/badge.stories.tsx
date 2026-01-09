import { Badge } from '@components/ui/badge';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Check, Star, X } from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Badge component for displaying status, labels, or small pieces of information. Supports various styles and can include icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>
        <Check className="mr-1" />
        Success
      </Badge>
      <Badge variant="destructive">
        <X className="mr-1" />
        Error
      </Badge>
      <Badge variant="secondary">
        <AlertTriangle className="mr-1" />
        Warning
      </Badge>
      <Badge variant="outline">
        <Star className="mr-1" />
        Featured
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with icons to convey meaning and status.',
      },
    },
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Inactive</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common status badges using different variants.',
      },
    },
  },
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="relative">
        <span className="text-sm">Notifications</span>
        <Badge className="ml-2">12</Badge>
      </div>
      <div className="relative">
        <span className="text-sm">Messages</span>
        <Badge
          variant="destructive"
          className="ml-2"
        >
          3
        </Badge>
      </div>
      <div className="relative">
        <span className="text-sm">Tasks</span>
        <Badge
          variant="secondary"
          className="ml-2"
        >
          25
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Badges used as count indicators for notifications, messages, etc.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center flex-wrap">
      <Badge className="text-xs">Extra Small</Badge>
      <Badge>Small (Default)</Badge>
      <Badge className="px-3 py-1 text-sm">Medium</Badge>
      <Badge className="px-4 py-1.5 text-base">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different badge sizes achieved by adjusting padding and text size.',
      },
    },
  },
};
