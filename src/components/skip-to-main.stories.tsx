import { SkipToMain } from '@components/skip-to-main';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/SkipToMain',
  component: SkipToMain,
  parameters: {
    docs: {
      description: {
        component:
          'Accessibility component that provides a "Skip to Main" link for keyboard navigation. The link is hidden by default and becomes visible when focused.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SkipToMain>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default skip to main link. Press Tab to focus and see the link appear.',
      },
    },
  },
};

export const Focused: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the skip link in its focused state. In real usage, this appears when users press Tab.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Click on the skip link below to see the focused state:
        </p>
        <Story />
        <div className="mt-8">
          <div
            id="content"
            className="p-4 border rounded"
          >
            <h2 className="text-lg font-semibold">Main Content</h2>
            <p>
              This would be the main content area that the skip link jumps to.
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};
