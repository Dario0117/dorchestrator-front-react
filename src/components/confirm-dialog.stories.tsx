import { ConfirmDialog } from '@components/confirm-dialog';
import { Button } from '@components/ui/button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Archive, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';

// Interactive wrapper component for stories
function ConfirmDialogDemo(
  props: Omit<
    React.ComponentProps<typeof ConfirmDialog>,
    'open' | 'onOpenChange'
  >,
) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <ConfirmDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        handleConfirm={() => {
          console.log('Confirmed!');
          setOpen(false);
        }}
      />
    </>
  );
}

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialogDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Confirmation dialog component for important actions. Supports destructive actions, loading states, and custom content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    destructive: {
      description:
        'Whether the action is destructive (shows red confirm button)',
      control: 'boolean',
    },
    disabled: {
      description: 'Whether the confirm button is disabled',
      control: 'boolean',
    },
    isLoading: {
      description: 'Whether the dialog is in loading state',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ConfirmDialogDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Are you absolutely sure?',
    desc: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    confirmText: 'Yes, delete account',
    destructive: true,
    handleConfirm: () => console.log('Confirmed!'),
  },
};

export const SimpleConfirmation: Story = {
  args: {
    title: 'Confirm Action',
    desc: 'Are you sure you want to proceed with this action?',
    confirmText: 'Continue',
    cancelBtnText: 'Cancel',
    handleConfirm: () => console.log('Confirmed!'),
  },
};

export const DeleteUser: Story = {
  args: {
    title: 'Delete User',
    desc: 'This will permanently delete the user account. This action cannot be undone.',
    confirmText: (
      <span className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        Delete User
      </span>
    ),
    destructive: true,
    cancelBtnText: 'Keep User',
    handleConfirm: () => console.log('User deleted!'),
  },
};

export const ArchiveProject: Story = {
  args: {
    title: 'Archive Project',
    desc: 'This will move the project to your archive. You can restore it later if needed.',
    confirmText: (
      <span className="flex items-center gap-2">
        <Archive className="h-4 w-4" />
        Archive
      </span>
    ),
    cancelBtnText: 'Cancel',
    handleConfirm: () => console.log('Project archived!'),
  },
};

export const WithLoading: Story = {
  args: {
    title: 'Processing...',
    desc: 'Please wait while we process your request.',
    confirmText: 'Processing...',
    isLoading: true,
    destructive: true,
    handleConfirm: () => console.log('Processing...'),
  },
};

export const WithDisabled: Story = {
  args: {
    title: 'Action Required',
    desc: 'You must complete the required fields before proceeding.',
    confirmText: 'Continue',
    disabled: true,
    handleConfirm: () => console.log('Action confirmed!'),
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'Remove Team Member',
    desc: 'This will remove the team member from all projects and revoke their access.',
    confirmText: (
      <span className="flex items-center gap-2">
        <UserX className="h-4 w-4" />
        Remove Member
      </span>
    ),
    destructive: true,
    handleConfirm: () => console.log('Member removed!'),
    children: (
      <div className="py-4">
        <div className="bg-muted p-3 rounded-md text-sm">
          <strong>Warning:</strong> This action will also:
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Remove access to all shared resources</li>
            <li>Cancel any pending invitations</li>
            <li>Archive their work history</li>
          </ul>
        </div>
      </div>
    ),
  },
};
