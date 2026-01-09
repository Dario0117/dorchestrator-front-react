import { Button } from '@components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight } from 'lucide-react';

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2 group/collapsible">
      <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3 font-mono text-sm">
        <h4 className="text-sm font-semibold">
          @peduarte starred 3 repositories
        </h4>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 p-0"
          >
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
      <span>Outer content</span>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">
        @radix-ui/primitives
      </div>
    </Collapsible>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Collapsible className="w-[400px] space-y-2 group/collapsible">
      <div className="flex items-center justify-between rounded-md border p-4">
        <h4 className="text-sm font-semibold">
          FAQ: Can I use this in my project?
        </h4>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
          >
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">
          Yes! This component is built using Radix UI primitives and can be used
          in your projects. You can customize it to match your design system.
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible
      defaultOpen
      className="w-[350px] space-y-2 group/collapsible"
    >
      <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
        <h4 className="text-sm font-semibold">Expanded by default</h4>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 p-0"
          >
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          Item 2
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          Item 3
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          Item 4
        </div>
      </CollapsibleContent>
      <span>Outer content</span>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">
        Item 1
      </div>
    </Collapsible>
  ),
};
