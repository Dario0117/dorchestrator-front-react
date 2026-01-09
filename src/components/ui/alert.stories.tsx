import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <InfoIcon />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertCircleIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </>
    ),
  },
};

export const WithoutIcon: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Simple Alert</AlertTitle>
        <AlertDescription>
          This is a simple alert without an icon.
        </AlertDescription>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    children: <AlertTitle>Just a title</AlertTitle>,
  },
};

export const DescriptionOnly: Story = {
  args: {
    children: (
      <>
        <InfoIcon />
        <AlertDescription>Just a description with an icon.</AlertDescription>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertCircleIcon />
        <AlertTitle>Validation Error</AlertTitle>
        <AlertDescription>
          There were multiple validation errors in your form submission:
          <ul className="mt-2 list-disc list-inside">
            <li>Email is required</li>
            <li>Password must be at least 8 characters</li>
            <li>Username is already taken</li>
          </ul>
        </AlertDescription>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Alert>
        <InfoIcon />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This is a default informational alert.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>This is a destructive error alert.</AlertDescription>
      </Alert>
    </div>
  ),
};
