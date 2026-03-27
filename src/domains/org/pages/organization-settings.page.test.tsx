import { OrganizationSettingsPage } from '@domains/org/pages/organization-settings.page';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders, selectOption } from '@lib/test-wrappers.utils';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

const mockNavigate = vi.fn();
let mockRole = 'owner';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ organizationSlug: 'test-org', teamSlug: 'my-team' }),
  };
});

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    get role() {
      return mockRole;
    },
  }),
}));

vi.mock('@routes/(authenticated)/$organizationSlug/settings', () => ({
  Route: {
    useSearch: () => ({
      page: 1,
      size: 25,
      search: undefined,
      role: undefined,
    }),
    fullPath: '/$organizationSlug/settings',
  },
}));

const mockOrganization = {
  id: 'org-1',
  name: 'Test Org',
  slug: 'test-org',
  role: 'owner',
  memberCount: 3,
  createdAt: '2025-01-01T00:00:00.000Z',
  isDefault: true,
  teams: [
    {
      id: 'team-1',
      name: 'Default Team',
      slug: 'my-team',
      organizationId: 'org-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ],
};

function seedCache() {
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
}

function renderPage() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizationSettingsPage />
    </Suspense>,
  );
}

async function waitForPageLoad() {
  await waitFor(() => {
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
  });
}

describe('OrganizationSettingsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockRole = 'owner';
    seedCache();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('renders page title and description', async () => {
    renderPage();
    await waitForPageLoad();
    expect(
      screen.getByText(
        'View your organization configuration and billing settings',
      ),
    ).toBeInTheDocument();
  });

  it('renders org details card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Organization Details')).toBeInTheDocument();
    });
  });

  it('renders default organization card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });

  it('renders subscription card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Subscription & Billing')).toBeInTheDocument();
    });
  });

  it('renders teams section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
  });

  it('renders members card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Members')).toBeInTheDocument();
    });
  });

  it('renders danger zone card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });
  });

  it('renders member rows from MSW data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(screen.getByText('Bob Admin')).toBeInTheDocument();
    expect(screen.getByText('Charlie Member')).toBeInTheDocument();
  });

  describe('pagination and filters', () => {
    it('calls navigate when clicking the next page button', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Alice Owner')).toBeInTheDocument();
      });

      // The pagination "Next" button - find by aria role
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      // Verify the search function produces correct output
      const searchFn = mockNavigate.mock.calls[0]?.[0].search;
      const result = searchFn({ page: 1, size: 25 });
      expect(result).toEqual(expect.objectContaining({ page: 2 }));
    });

    it('calls navigate when changing page size', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Alice Owner')).toBeInTheDocument();
      });

      const pageSizeTrigger = screen.getByRole('combobox', {
        name: /page size/i,
      });
      await selectOption(pageSizeTrigger, '50 per page');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      const searchFn = mockNavigate.mock.calls[0]?.[0].search;
      const result = searchFn({ page: 3, size: 25 });
      expect(result).toEqual(expect.objectContaining({ page: 1, size: 50 }));
    });

    it('calls navigate when searching members', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Alice Owner')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', {
        name: /search members/i,
      });
      await user.type(searchInput, 'alice');

      // Wait for debounce (300ms)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      const searchFn = mockNavigate.mock.calls[0]?.[0].search;
      const result = searchFn({ page: 2, size: 25 });
      expect(result).toEqual(
        expect.objectContaining({ page: 1, search: 'alice' }),
      );
    });

    it('calls navigate when filtering by role', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Alice Owner')).toBeInTheDocument();
      });

      const roleFilterTrigger = screen.getByRole('combobox', {
        name: /filter members by role/i,
      });
      await selectOption(roleFilterTrigger, 'Admin');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      const searchFn = mockNavigate.mock.calls[0]?.[0].search;
      const result = searchFn({ page: 3, size: 25 });
      expect(result).toEqual(
        expect.objectContaining({ page: 1, role: 'admin' }),
      );
    });
  });

  describe('remove member dialog', () => {
    it('opens and confirms removing a member', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Charlie Member')).toBeInTheDocument();
      });

      const charlieRow = screen.getByText('Charlie Member').closest('tr');
      expect(charlieRow).toBeTruthy();
      const removeButtons = within(
        charlieRow as HTMLTableRowElement,
      ).getAllByRole('button');
      await user.click(removeButtons[removeButtons.length - 1] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Remove Member')).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          /Are you sure you want to remove Charlie Member.*charlie@example\.com.*from this organization/,
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => {
        expect(screen.queryByText('Remove Member')).not.toBeInTheDocument();
      });
    });

    it('closes remove dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Charlie Member')).toBeInTheDocument();
      });

      const charlieRow = screen.getByText('Charlie Member').closest('tr');
      expect(charlieRow).toBeTruthy();
      const removeButtons = within(
        charlieRow as HTMLTableRowElement,
      ).getAllByRole('button');
      await user.click(removeButtons[removeButtons.length - 1] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Remove Member')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByText('Remove Member')).not.toBeInTheDocument();
      });
    });
  });

  describe('transfer ownership dialog', () => {
    it('opens and confirms transferring ownership', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Bob Admin')).toBeInTheDocument();
      });

      const bobRow = screen.getByText('Bob Admin').closest('tr');
      expect(bobRow).toBeTruthy();
      const transferButton = within(bobRow as HTMLTableRowElement).getByTitle(
        'Transfer ownership',
      );
      await user.click(transferButton);

      await waitFor(() => {
        expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          /Transfer ownership to Bob Admin\? You will be demoted to member\./,
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Transfer' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Transfer Ownership'),
        ).not.toBeInTheDocument();
      });
    });

    it('closes transfer dialog when dismissed', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Bob Admin')).toBeInTheDocument();
      });

      const bobRow = screen.getByText('Bob Admin').closest('tr');
      expect(bobRow).toBeTruthy();
      const transferButton = within(bobRow as HTMLTableRowElement).getByTitle(
        'Transfer ownership',
      );
      await user.click(transferButton);

      await waitFor(() => {
        expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Transfer Ownership'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('leave organization dialog', () => {
    it('renders leave organization section for owner', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Leave Organization')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/You must transfer ownership before you can leave/),
      ).toBeInTheDocument();
    });

    it('opens and confirms leaving the organization as member', async () => {
      mockRole = 'member';
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Leave Organization/ }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Leave Organization/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Are you sure you want to leave Test Org\? You will lose access/,
          ),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Leave' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('delete organization dialog', () => {
    it('opens and confirms deleting the organization', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Delete Organization/ }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Delete Organization/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Are you sure you want to permanently delete Test Org/,
          ),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('closes delete dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Delete Organization/ }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Delete Organization/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Are you sure you want to permanently delete Test Org/,
          ),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(
          screen.queryByText(
            /Are you sure you want to permanently delete Test Org/,
          ),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('with isDefault false', () => {
    it('handles organization not being default', async () => {
      queryClient.clear();
      queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
        responseData: {
          results: [{ ...mockOrganization, isDefault: false }],
          hasNext: false,
          hasPrevious: false,
          totalResults: 1,
          totalPages: 1,
          page: 1,
          size: 100,
        },
        responseErrors: null,
      });

      renderPage();
      await waitForPageLoad();
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });

  describe('with org not found in list', () => {
    it('falls back to isDefault false when org not in list', async () => {
      queryClient.clear();
      queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
        responseData: {
          results: [{ ...mockOrganization, id: 'different-org' }],
          hasNext: false,
          hasPrevious: false,
          totalResults: 1,
          totalPages: 1,
          page: 1,
          size: 100,
        },
        responseErrors: null,
      });

      renderPage();
      await waitForPageLoad();
    });
  });

  describe('with isDefault undefined', () => {
    it('falls back to false when isDefault is undefined on the org entry', async () => {
      queryClient.clear();
      const { isDefault: _omit, ...orgWithoutIsDefault } = mockOrganization;
      queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
        responseData: {
          results: [orgWithoutIsDefault],
          hasNext: false,
          hasPrevious: false,
          totalResults: 1,
          totalPages: 1,
          page: 1,
          size: 100,
        },
        responseErrors: null,
      });

      renderPage();
      await waitForPageLoad();
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });

  describe('with null responseData for organizations list', () => {
    it('falls back to isDefault false when responseData.results is null', async () => {
      queryClient.clear();
      queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
        responseData: null,
        responseErrors: null,
      });

      renderPage();
      await waitForPageLoad();
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });

  describe('with null responseData for members', () => {
    it('falls back to empty members and zero pagination values', async () => {
      server.use(
        http.get(buildBackendUrl('/api/v1/{organizationId}/members'), () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        }),
      );

      renderPage();
      await waitForPageLoad();
      // With no members data, the members card should show empty state
      expect(screen.getByText('No members found')).toBeInTheDocument();
    });
  });
});
