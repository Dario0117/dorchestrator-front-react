import { CreateOrganizationForm } from '@components/org/forms/create-organization.form';
import type { useCreateOrganizationMutationType } from '@services/organizations/create-organization.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockHandleSuccess = async (name: string, slug: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Organization created:', { name, slug });
  return {
    data: {
      id: 'org-123',
      name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    error: null,
  };
};

const mockHandleError = async (name: string, slug: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Organization creation failed:', { name, slug });
  throw new Error('Failed to create organization. Please try again.');
};

const meta = {
  title: 'Forms/CreateOrganizationForm',
  component: CreateOrganizationForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form for creating a new organization with name and slug validation.',
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
} satisfies Meta<typeof CreateOrganizationForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    createOrganizationMutation: {
      mutateAsync: async ({ name, slug }: { name: string; slug: string }) =>
        mockHandleSuccess(name, slug),
      error: null,
      data: null,
      isPending: false,
    } as unknown as useCreateOrganizationMutationType,
    handleSuccess: (data) => {
      console.log('Success:', data);
    },
  },
};

export const WithError: Story = {
  args: {
    createOrganizationMutation: {
      mutateAsync: async ({ name, slug }: { name: string; slug: string }) =>
        mockHandleError(name, slug),
      error: null,
      data: null,
      isPending: false,
    } as unknown as useCreateOrganizationMutationType,
    handleSuccess: (data) => {
      console.log('Success:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Form that displays an error message when organization creation fails.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    createOrganizationMutation: {
      mutateAsync: async ({ name, slug }: { name: string; slug: string }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (slug === 'taken-slug') {
          throw new Error('Organization slug is already taken');
        }

        if (slug === 'error-slug') {
          return mockHandleError(name, slug);
        }

        return mockHandleSuccess(name, slug);
      },
      error: null,
      data: null,
      isPending: false,
    } as unknown as useCreateOrganizationMutationType,
    handleSuccess: (data) => {
      console.log('Success:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive form with different behaviors:
        - Use any name and slug for successful creation
        - Use slug "taken-slug" to simulate a taken slug error
        - Use slug "error-slug" to simulate a general error
        - The form auto-generates a slug suggestion from the organization name`,
      },
    },
  },
};
