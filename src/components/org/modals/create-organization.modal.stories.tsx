import { CreateOrganizationModal } from '@components/org/modals/create-organization.modal';
import { Button } from '@components/ui/button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <CreateOrganizationModal
        isOpen={isOpen}
        onSuccess={() => {
          console.log('Organization created successfully');
          setIsOpen(false);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Modals/CreateOrganizationModal',
  component: CreateOrganizationModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog for creating a new organization. Cannot be dismissed without completing the form.',
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
} satisfies Meta<typeof CreateOrganizationModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onSuccess: () => console.log('Organization created'),
  },
  render: () => <ModalWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          'Click the button to open the modal. The modal prevents dismissal via ESC or clicking outside.',
      },
    },
  },
};

export const AlwaysOpen: Story = {
  args: {
    isOpen: true,
    onSuccess: () => {
      console.log('Organization created successfully');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal displayed in an always-open state for documentation.',
      },
    },
  },
};
