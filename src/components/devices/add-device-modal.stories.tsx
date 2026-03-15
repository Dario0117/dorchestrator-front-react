import { AddDeviceModal } from '@components/devices/add-device-modal';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function ModalWrapper({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Device</Button>
      <AddDeviceModal
        open={open}
        onOpenChange={setOpen}
        organizationId={organizationId}
        teamId="team-1"
      />
    </div>
  );
}

// Mock version of AddDeviceModal that simulates token generation
function MockAddDeviceModal({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockToken = 'mock-token-abc123def456ghi789jkl012mno345';
    const mockExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    setToken(mockToken);
    setExpiresAt(mockExpiresAt);
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiration = () => {
    if (!expiresAt) {
      return '';
    }
    const date = new Date(expiresAt);
    const hours = Math.floor((date.getTime() - Date.now()) / 3600000);
    return `Token expires in ${hours} hours`;
  };

  const cliCommand = `dorchestrator register --org-id "${organizationId}" --name "random name" --token "${token}"`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a registration token and run the command below on your
            device:
          </p>

          {!token && (
            <Button
              onClick={handleGenerateToken}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Token'}
            </Button>
          )}

          {token && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="registration-token"
                  className="text-sm font-medium"
                >
                  Registration Token
                </label>
                <div className="flex gap-2">
                  <Input
                    id="registration-token"
                    value={token}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(token)}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatExpiration()}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cli-command"
                  className="text-sm font-medium"
                >
                  CLI Command
                </label>
                <div className="flex gap-2">
                  <Input
                    id="cli-command"
                    value={cliCommand}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(cliCommand)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <a
                  href="https://github.com/dorchestrator/dorchestrator-agent/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Download agent →
                </a>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  title: 'Modals/AddDeviceModal',
  component: AddDeviceModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for generating device registration tokens and CLI commands.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AddDeviceModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => console.log('Modal state changed'),
    organizationId: 'org-123',
    teamId: 'team-1',
  },
  render: () => <ModalWrapper organizationId="org-123" />,
  parameters: {
    docs: {
      description: {
        story:
          'Click the button to open the modal. Click "Generate Token" to create a registration token.',
      },
    },
  },
};

export const AlwaysOpen: Story = {
  args: {
    open: true,
    onOpenChange: () => {
      console.log('Modal closed');
    },
    organizationId: 'org-123',
    teamId: 'team-1',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal displayed in an always-open state. Click "Generate Token" to see the token and CLI command.',
      },
    },
  },
};

export const WithTokenGeneration: Story = {
  args: {
    open: false,
    onOpenChange: () => console.log('Modal state changed'),
    organizationId: 'org-123',
    teamId: 'team-1',
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)}>Add Device</Button>
        <MockAddDeviceModal
          open={open}
          onOpenChange={setOpen}
          organizationId="org-123"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo of the full token generation flow. Click "Add Device" to open the modal, then click "Generate Token" to see the token and CLI command appear with a simulated 1-second delay.',
      },
    },
  },
};
