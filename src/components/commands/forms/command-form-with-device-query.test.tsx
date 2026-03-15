import { CommandFormWithDeviceQuery } from '@components/commands/forms/command-form-with-device-query';
import { useCommandForm } from '@components/commands/forms/hooks/use-command-form';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { useSubmitCommandMutationType } from '@services/commands/submit-command.http-service';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

vi.mock('@hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

vi.mock('@hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
  })),
}));

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

function TestWrapper() {
  const mockMutation = {
    mutate: vi.fn(),
  } as unknown as useSubmitCommandMutationType;
  const mockHandleSuccess = vi.fn();

  const form = useCommandForm({
    submitCommandMutation: mockMutation,
    handleSuccess: mockHandleSuccess,
    organizationId: 'org-1',
    teamId: 'team-1',
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommandFormWithDeviceQuery form={form} />
    </Suspense>
  );
}

describe('CommandFormWithDeviceQuery', () => {
  beforeEach(() => {
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  });

  it('should render with empty devices when responseData is null', async () => {
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    expect(screen.getByText('Select a device...')).toBeInTheDocument();
  });
});
