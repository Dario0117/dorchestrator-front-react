import { OrganizationCheckWrapper } from '@components/layout/organization-check-wrapper';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

const meta = {
  title: 'Layout/OrganizationCheckWrapper',
  component: OrganizationCheckWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wrapper component that checks if user has organizations and shows create modal if not. Note: This story demonstrates the component structure but cannot fully simulate the modal behavior due to authentication requirements.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrganizationCheckWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithOrganizations: Story = {
  args: {
    children: <div>Content</div>,
  },
  render: () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Pre-populate the cache with organization data (new API response shape)
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [
          {
            id: 'org-1',
            slug: 'acme-corp',
            name: 'Acme Corporation',
            role: 'owner',
            memberCount: 1,
            createdAt: new Date().toISOString(),
            isDefault: true,
          },
        ],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });

    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <OrganizationCheckWrapper>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="mt-4">User has organizations - no modal shown.</p>
            </div>
          </OrganizationCheckWrapper>
        </Suspense>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'When user has organizations, content is rendered normally.',
      },
    },
  },
};

export const WithoutOrganizations: Story = {
  args: {
    children: <div>Content</div>,
  },
  render: () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Pre-populate the cache with empty organization list (new API response shape)
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [],
        hasNext: false,
        hasPrevious: false,
        totalResults: 0,
        totalPages: 0,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });

    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <OrganizationCheckWrapper>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="mt-4">
                User has no organizations - modal should be shown.
              </p>
            </div>
          </OrganizationCheckWrapper>
        </Suspense>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'When user has no organizations, create organization modal is shown.',
      },
    },
  },
};
