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

interface CreateOrgInput {
  name: string;
  slug: string;
}

// Helper to create mock mutation with success response
function createSuccessMutation(
  handler: (input: CreateOrgInput) => Promise<unknown>,
): useCreateOrganizationMutationType {
  return {
    mutate: (
      variables: CreateOrgInput,
      options?: { onSuccess?: (data: unknown) => void; onError?: () => void },
    ) => {
      handler(variables)
        .then((result) => options?.onSuccess?.(result))
        .catch(() => options?.onError?.());
    },
    error: null,
    data: null,
    isPending: false,
  } as unknown as useCreateOrganizationMutationType;
}

// Helper to create mock mutation with error response
function createErrorMutation(
  handler: (input: CreateOrgInput) => Promise<never>,
): useCreateOrganizationMutationType {
  return {
    mutate: (
      variables: CreateOrgInput,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      handler(variables).catch((error) => options?.onError?.(error));
    },
    error: null,
    data: null,
    isPending: false,
  } as unknown as useCreateOrganizationMutationType;
}

const mockHandleSuccess = async (input: CreateOrgInput) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Organization created:', input);
  return {
    data: {
      id: 'org-123',
      name: input.name,
      slug: input.slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    error: null,
  };
};

const mockHandleError = async (input: CreateOrgInput): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Organization creation failed:', input);
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
    createOrganizationMutation: createSuccessMutation(mockHandleSuccess),
    handleSuccess: (data) => {
      console.log('Success:', data);
    },
  },
};

export const WithError: Story = {
  args: {
    createOrganizationMutation: createErrorMutation(mockHandleError),
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
      mutate: (
        variables: CreateOrgInput,
        options?: {
          onSuccess?: (data: unknown) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        setTimeout(async () => {
          try {
            if (variables.slug === 'taken-slug') {
              throw new Error('Organization slug is already taken');
            }

            if (variables.slug === 'error-slug') {
              await mockHandleError(variables);
              return;
            }

            const result = await mockHandleSuccess(variables);
            options?.onSuccess?.(result);
          } catch (error) {
            options?.onError?.(error as Error);
          }
        }, 0);
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
