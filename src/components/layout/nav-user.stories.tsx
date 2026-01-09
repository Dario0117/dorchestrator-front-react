import { NavUser } from '@components/layout/nav-user';
import { SidebarProvider } from '@components/ui/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Layout/NavUser',
  component: NavUser,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div className="w-[280px]">
            <Story />
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof NavUser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://github.com/shadcn.png',
    },
  },
};

export const WithInitials: Story = {
  args: {
    user: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      avatar: '',
    },
  },
};

export const LongName: Story = {
  args: {
    user: {
      name: 'Alexander Christopher Wellington',
      email: 'alexander.wellington@verylongdomainname.com',
      avatar: 'https://github.com/shadcn.png',
    },
  },
};
