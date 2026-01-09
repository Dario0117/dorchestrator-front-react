import { ThemeSwitch } from '@components/theme-switch';
import { ThemeProvider } from '@context/theme.provider';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitch,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Theme switcher component that allows users to toggle between light, dark, and system theme modes. Shows different icons based on current theme.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
        <h2 className="text-lg font-semibold">Application Header</h2>
        <div className="flex items-center gap-2">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Theme switch component as it would appear in an application header.',
      },
    },
  },
};

export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <div className="w-64 p-4 border rounded-lg bg-sidebar">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Theme switch component as it would appear in a sidebar.',
      },
    },
  },
};
