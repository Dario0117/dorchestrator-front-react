import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'Avatar component for displaying user profile images with fallback support.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        alt="User"
      />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="/broken-image.jpg"
        alt="User"
      />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with broken image URL showing the fallback initials.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Small"
        />
        <AvatarFallback className="text-xs">S</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Default"
        />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Large"
        />
        <AvatarFallback>L</AvatarFallback>
      </Avatar>
      <Avatar className="h-24 w-24">
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Extra Large"
        />
        <AvatarFallback className="text-lg">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different avatar sizes from small to extra large.',
      },
    },
  },
};

export const DifferentUsers: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="John"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1494790108755-2616b612b87c?w=150&h=150&fit=crop&crop=face"
          alt="Sarah"
        />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          alt="Mike"
        />
        <AvatarFallback>MJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="/broken-image.jpg"
          alt="Emma"
        />
        <AvatarFallback>EW</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple avatars showing different users, including one with fallback.',
      },
    },
  },
};

export const InUserList: Story = {
  render: () => (
    <div className="space-y-2">
      {[
        {
          name: 'John Doe',
          email: 'john@example.com',
          initials: 'JD',
          src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        {
          name: 'Sarah Miller',
          email: 'sarah@example.com',
          initials: 'SM',
          src: 'https://images.unsplash.com/photo-1494790108755-2616b612b87c?w=150&h=150&fit=crop&crop=face',
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          initials: 'MJ',
          src: '',
        },
        {
          name: 'Emma Wilson',
          email: 'emma@example.com',
          initials: 'EW',
          src: '',
        },
      ].map((user) => (
        <div
          key={user.email}
          className="flex items-center gap-3 p-2 rounded hover:bg-muted"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.src}
              alt={user.name}
            />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatars used in a user list context with names and email addresses.',
      },
    },
  },
};
