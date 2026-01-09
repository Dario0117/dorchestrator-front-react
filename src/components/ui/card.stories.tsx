import { Button } from '@components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontalIcon } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here.</p>
        </CardContent>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Get started with a new project in minutes.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Deploy Now</Button>
        </CardFooter>
      </>
    ),
  },
};

export const WithAction: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have 3 unread messages.</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
            >
              <MoreHorizontalIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="border-b pb-2">
              <p className="font-medium">New message from John</p>
              <p className="text-sm text-muted-foreground">2 minutes ago</p>
            </div>
            <div className="border-b pb-2">
              <p className="font-medium">Team meeting reminder</p>
              <p className="text-sm text-muted-foreground">1 hour ago</p>
            </div>
            <div>
              <p className="font-medium">Server maintenance scheduled</p>
              <p className="text-sm text-muted-foreground">3 hours ago</p>
            </div>
          </div>
        </CardContent>
      </>
    ),
  },
};

export const Complete: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Complete Card Example</CardTitle>
          <CardDescription>
            This card demonstrates all available components.
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Features</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Header with title and description</li>
                <li>Action button in header</li>
                <li>Rich content area</li>
                <li>Footer with buttons</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="mr-2"
          >
            Cancel
          </Button>
          <Button>Continue</Button>
        </CardFooter>
      </>
    ),
  },
};

export const SimpleContent: Story = {
  args: {
    children: (
      <CardContent>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold">Simple Card</h3>
          <p className="text-muted-foreground mt-2">
            This card only has content, no header or footer.
          </p>
        </div>
      </CardContent>
    ),
  },
};

export const HeaderOnly: Story = {
  args: {
    children: (
      <CardHeader>
        <CardTitle>Header Only</CardTitle>
        <CardDescription>This card only has a header section.</CardDescription>
      </CardHeader>
    ),
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>First Card</CardTitle>
          <CardDescription>This is the first card.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the first card.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Second Card</CardTitle>
          <CardDescription>This is the second card.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the second card.</p>
        </CardContent>
      </Card>
    </div>
  ),
};
