import { ConfirmDialog } from '@components/confirm-dialog';
import { Button } from '@components/ui/button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

// Mock version of SignOutDialog to avoid router/store dependencies
function MockSignOutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      handleConfirm={() => {
        console.log('User signed out');
        onOpenChange(false);
      }}
      className="sm:max-w-sm"
    />
  );
}

// Interactive wrapper component for stories
function SignOutDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Sign Out
      </Button>
      <MockSignOutDialog
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

const meta = {
  title: 'Components/SignOutDialog',
  component: SignOutDialogDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Specialized confirmation dialog for signing out users. Built on top of ConfirmDialog with specific messaging for sign-out actions.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SignOutDialogDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InUserMenu: Story = {
  decorators: [
    (Story) => (
      <div className="p-4 border rounded-lg bg-background">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <Story />
        </div>
        <div className="text-xs text-muted-foreground">User menu context</div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Sign out dialog as it would appear when triggered from a user menu or profile dropdown.',
      },
    },
  },
};
