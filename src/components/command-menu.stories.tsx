import { Button } from '@components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@components/ui/command';
import { ScrollArea } from '@components/ui/scroll-area';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowRight,
  ChevronRight,
  Laptop,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { useState } from 'react';

// Mock data similar to sidebar data
const mockNavGroups = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', url: '/' },
      { title: 'Analytics', url: '/analytics' },
      { title: 'Reports', url: '/reports' },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Users',
        items: [
          { title: 'All Users', url: '/users' },
          { title: 'Roles', url: '/users/roles' },
          { title: 'Permissions', url: '/users/permissions' },
        ],
      },
      {
        title: 'Projects',
        items: [
          { title: 'Active Projects', url: '/projects/active' },
          { title: 'Archived Projects', url: '/projects/archived' },
          { title: 'Templates', url: '/projects/templates' },
        ],
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      { title: 'Profile', url: '/profile' },
      { title: 'Preferences', url: '/preferences' },
      { title: 'Security', url: '/security' },
    ],
  },
];

// Mock CommandMenu component
function MockCommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog
      modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <ScrollArea
          type="hover"
          className="h-72 pe-1"
        >
          <CommandEmpty>No results found.</CommandEmpty>
          {mockNavGroups.map((group) => (
            <CommandGroup
              key={group.title}
              heading={group.title}
            >
              {group.items.map((navItem, i) => {
                if ('url' in navItem && navItem.url) {
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() =>
                          console.log(`Navigate to: ${navItem.url}`),
                        );
                      }}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="text-muted-foreground/80 size-2" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  );
                }

                if ('items' in navItem) {
                  return navItem.items?.map((subItem, subIndex) => (
                    <CommandItem
                      key={`${navItem.title}-${subItem.url}-${subIndex}`}
                      value={`${navItem.title}-${subItem.url}`}
                      onSelect={() => {
                        runCommand(() =>
                          console.log(`Navigate to: ${subItem.url}`),
                        );
                      }}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="text-muted-foreground/80 size-2" />
                      </div>
                      {navItem.title} <ChevronRight /> {subItem.title}
                    </CommandItem>
                  ));
                }

                return null;
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => console.log('Set theme: light'))}
            >
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log('Set theme: dark'))}
            >
              <Moon className="scale-90" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => console.log('Set theme: system'))
              }
            >
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}

// Interactive wrapper component for stories
function CommandMenuDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
          Search...
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <MockCommandMenu
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

const meta = {
  title: 'Components/CommandMenu',
  component: CommandMenuDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Command menu component that provides quick navigation and actions through a searchable interface. Includes navigation items from sidebar and theme switching.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommandMenuDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
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
        story:
          'Command menu trigger as it would appear in an application header.',
      },
    },
  },
};

export const WithKeyboardShortcut: Story = {
  decorators: [
    (Story) => (
      <div className="p-8 space-y-4">
        <div className="text-sm text-muted-foreground">
          Try pressing{' '}
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + K</kbd>{' '}
          to open the command menu
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Command menu with keyboard shortcut indication. In a real app, this would respond to Cmd+K.',
      },
    },
  },
};
