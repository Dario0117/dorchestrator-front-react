import { Skeleton } from '@components/ui/skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton component for showing loading placeholders with animated shimmer effect.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="w-32 h-4" />,
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      <Skeleton className="w-16 h-3" />
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-32 h-5" />
      <Skeleton className="w-48 h-6" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different skeleton sizes for various text elements.',
      },
    },
  },
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-6 w-6 rounded" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different skeleton shapes including circular, rectangular, and square.',
      },
    },
  },
};

export const UserCardSkeleton: Story = {
  render: () => (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton placeholder for a user card with avatar and text.',
      },
    },
  },
};

export const ArticleCardSkeleton: Story = {
  render: () => (
    <div className="space-y-3 p-4 border rounded-lg">
      <Skeleton className="h-48 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton placeholder for an article card with image, title, content, and author.',
      },
    },
  },
};

export const TableSkeleton: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Skeleton className="h-4 w-32 font-medium" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: 5 }).map(() => (
        <div
          key={crypto.randomUUID()}
          className="flex space-x-3"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton placeholder for a data table with header and rows.',
      },
    },
  },
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map(() => (
        <div
          key={crypto.randomUUID()}
          className="flex items-center space-x-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton placeholder for a list of items with avatars and actions.',
      },
    },
  },
};
