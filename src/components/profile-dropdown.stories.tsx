import { ConfirmDialog } from '@components/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

// Mock version to avoid hook dependencies
function MockProfileDropdown({
  userName = 'satnaing',
  userEmail = 'satnaingdev@gmail.com',
  userAvatar = '/avatars/01.png',
}) {
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={userAvatar}
                alt={`@${userName}`}
              />
              <AvatarFallback>
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm leading-none font-medium">{userName}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
            Sign out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out"
        desc="Are you sure you want to sign out? You will need to sign in again to access your account."
        confirmText="Sign out"
        handleConfirm={() => {
          console.log('User signed out');
          setSignOutOpen(false);
        }}
        className="sm:max-w-sm"
      />
    </>
  );
}

const meta = {
  title: 'Components/ProfileDropdown',
  component: MockProfileDropdown,
  parameters: {
    docs: {
      description: {
        component:
          'Profile dropdown component that displays user information and provides quick access to profile, settings, billing, and sign out functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userName: {
      description: 'User display name',
      control: 'text',
    },
    userEmail: {
      description: 'User email address',
      control: 'text',
    },
    userAvatar: {
      description: 'User avatar image URL',
      control: 'text',
    },
  },
} satisfies Meta<typeof MockProfileDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DifferentUser: Story = {
  args: {
    userName: 'johndoe',
    userEmail: 'john.doe@example.com',
    userAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
};

export const LongUserInfo: Story = {
  args: {
    userName: 'Christopher Alexander',
    userEmail: 'christopher.alexander@verylongdomainname.com',
    userAvatar: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Profile dropdown with long name and email to demonstrate text handling.',
      },
    },
  },
};

export const NoAvatar: Story = {
  args: {
    userName: 'Jane Smith',
    userEmail: 'jane.smith@company.com',
    userAvatar: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Profile dropdown when user has no avatar - shows fallback initials.',
      },
    },
  },
};

export const InNavbar: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
        <h1 className="text-lg font-semibold">Application</h1>
        <div className="flex items-center gap-2">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Profile dropdown as it would appear in an application navbar.',
      },
    },
  },
};
