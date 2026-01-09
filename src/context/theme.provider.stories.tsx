import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { ThemeProvider, useTheme } from '@context/theme.provider';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Demo component that uses the theme
function ThemeDemo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Provider Demo</CardTitle>
          <CardDescription>
            Current theme: <strong>{theme}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
            >
              System
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Sample Content</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  This content adapts to the current theme. Notice how the
                  colors change when you switch themes.
                </p>
                <div className="flex gap-2">
                  <Button size="sm">Primary</Button>
                  <Button
                    size="sm"
                    variant="secondary"
                  >
                    Secondary
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                  >
                    Destructive
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 border rounded-md">
              <p className="text-sm">
                Border colors, text colors, and background colors all respond to
                the theme changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: 'Providers/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Theme provider that manages light, dark, and system theme modes with localStorage persistence.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeDemo />
    </ThemeProvider>
  ),
  args: {
    defaultTheme: 'system',
    storageKey: 'storybook-theme',
    children: undefined, // Children will be provided by render function
  },
};

export const LightTheme: Story = {
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeDemo />
    </ThemeProvider>
  ),
  args: {
    defaultTheme: 'light',
    storageKey: 'storybook-theme-light',
    children: undefined, // Children will be provided by render function
  },
  parameters: {
    docs: {
      description: {
        story: 'Theme provider initialized with light theme.',
      },
    },
  },
};

export const DarkTheme: Story = {
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeDemo />
    </ThemeProvider>
  ),
  args: {
    defaultTheme: 'dark',
    storageKey: 'storybook-theme-dark',
    children: undefined, // Children will be provided by render function
  },
  parameters: {
    docs: {
      description: {
        story: 'Theme provider initialized with dark theme.',
      },
    },
  },
};

export const SystemTheme: Story = {
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeDemo />
    </ThemeProvider>
  ),
  args: {
    defaultTheme: 'system',
    storageKey: 'storybook-theme-system',
    children: undefined, // Children will be provided by render function
  },
  parameters: {
    docs: {
      description: {
        story: 'Theme provider that follows system preference (light/dark).',
      },
    },
  },
};
