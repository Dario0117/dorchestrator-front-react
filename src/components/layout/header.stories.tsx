import { Header } from '@components/layout/header';
import { Button } from '@components/ui/button';
import { SidebarProvider } from '@components/ui/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Search, User } from 'lucide-react';

// Mock component with sidebar context and sample content
function MockHeader({
  fixed,
  children,
}: {
  fixed?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Header fixed={fixed}>{children}</Header>
        <div className="p-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Page Content</h1>
            <p>This is sample page content to demonstrate header behavior.</p>
            {Array.from({ length: 20 }, () => (
              <p
                key={crypto.randomUUID()}
                className="text-gray-600"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

const meta = {
  title: 'Layout/Header',
  component: MockHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header component with sidebar trigger and optional fixed positioning. Includes scroll-based shadow effects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fixed: {
      description: 'Whether the header should be fixed to the top',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MockHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fixed: Story = {
  args: {
    fixed: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fixed header that sticks to the top and shows shadow on scroll.',
      },
    },
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with custom content including title and action buttons.',
      },
    },
  },
};

export const FixedWithActions: Story = {
  args: {
    fixed: true,
    children: (
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">Application</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fixed header with actions and blur effect on scroll.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    fixed: true,
    children: (
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">App</h1>
        <Button
          variant="ghost"
          size="icon"
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Header on mobile viewport with larger sidebar trigger.',
      },
    },
  },
};
