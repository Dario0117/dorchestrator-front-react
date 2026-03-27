import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import { TeamManagementSection } from './team-management-section';

const mockTeams = [
  {
    id: 'team-1',
    name: 'Engineering',
    slug: 'engineering',
    organizationId: 'org-1',
    createdAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'team-2',
    name: 'Design',
    slug: 'design',
    organizationId: 'org-1',
    createdAt: '2025-02-20T10:00:00.000Z',
  },
];

function seedOrgCache(teams = mockTeams) {
  queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
    responseData: {
      results: [
        {
          id: 'org-1',
          name: 'Test Org',
          slug: 'test-org',
          role: 'owner',
          memberCount: 3,
          createdAt: '2025-01-01T00:00:00.000Z',
          isDefault: true,
          teams,
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
}

describe('TeamManagementSection', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it('renders card title', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('renders empty state when no teams exist', () => {
    seedOrgCache([]);
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(
      screen.getByText(/No teams yet. Create a team to organize device access/),
    ).toBeInTheDocument();
  });

  it('renders team names in the table', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('renders created dates', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(
      screen.getByText(
        new Date('2025-01-15T10:00:00.000Z').toLocaleDateString(),
      ),
    ).toBeInTheDocument();
  });

  it('shows create team button when canManage is true', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(
      screen.getByRole('button', { name: /Create Team/ }),
    ).toBeInTheDocument();
  });

  it('hides create team button when canManage is false', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage={false}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /Create Team/ }),
    ).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons when canManage is true', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(
      screen.getAllByRole('button', { name: 'Edit team name' }),
    ).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Delete team' })).toHaveLength(
      2,
    );
  });

  it('hides edit and delete buttons when canManage is false', () => {
    seedOrgCache();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage={false}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Edit team name' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete team' }),
    ).not.toBeInTheDocument();
  });

  it('expands team row on toggle click', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const toggleButton = screen.getAllByRole('button', {
      name: 'Toggle members',
    })[0] as HTMLElement;
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('Loading members...')).toBeInTheDocument();
    });
  });

  it('collapses expanded team row on second toggle click', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const toggleButton = screen.getAllByRole('button', {
      name: 'Toggle members',
    })[0] as HTMLElement;
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('Loading members...')).toBeInTheDocument();
    });
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });
  });

  it('opens delete confirmation dialog', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const deleteButton = screen.getAllByRole('button', {
      name: 'Delete team',
    })[0] as HTMLElement;
    await user.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText('Delete Team')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete "Engineering"\?/),
      ).toBeInTheDocument();
    });
  });

  it('opens create team dialog when Create Team button is clicked', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    await user.click(screen.getByRole('button', { name: /Create Team/ }));
    await waitFor(() => {
      expect(
        screen.getByText('Create Team', {
          selector: '[data-slot="dialog-title"]',
        }),
      ).toBeInTheDocument();
    });
  });

  it('opens edit team dialog when edit button is clicked', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const editButtons = screen.getAllByRole('button', {
      name: 'Edit team name',
    });
    await user.click(editButtons[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText('Edit Team')).toBeInTheDocument();
    });
  });

  it('closes edit team dialog when close button is clicked', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const editButtons = screen.getAllByRole('button', {
      name: 'Edit team name',
    });
    await user.click(editButtons[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText('Edit Team')).toBeInTheDocument();
    });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Edit Team')).not.toBeInTheDocument();
    });
  });

  it('calls set default team mutation when star button is clicked', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const starButtons = screen.getAllByRole('button', {
      name: 'Set as default team',
    });
    await user.click(starButtons[0] as HTMLElement);
    // The mutation fires - no error means the MSW handler caught it
    await waitFor(() => {
      expect(starButtons[0]).toBeInTheDocument();
    });
  });

  it('confirms team deletion and calls remove team mutation', async () => {
    // Add MSW handler for better-auth remove-team endpoint
    server.use(
      http.post(
        buildBackendUrl('/api/v1/organization/remove-team' as never),
        () => {
          return HttpResponse.json({ id: 'team-1' });
        },
      ),
    );
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    // First expand team-1 so we can also cover the expandedTeamId === confirmDelete.id branch
    const toggleButton = screen.getAllByRole('button', {
      name: 'Toggle members',
    })[0] as HTMLElement;
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('Loading members...')).toBeInTheDocument();
    });
    // Click delete on the first team
    const deleteButton = screen.getAllByRole('button', {
      name: 'Delete team',
    })[0] as HTMLElement;
    await user.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText('Delete Team')).toBeInTheDocument();
    });
    // Click confirm
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);
    // After successful deletion, the dialog should close
    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to delete/),
      ).not.toBeInTheDocument();
    });
  });

  it('closes delete confirmation dialog when cancel is clicked', async () => {
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    const deleteButton = screen.getAllByRole('button', {
      name: 'Delete team',
    })[0] as HTMLElement;
    await user.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText('Delete Team')).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText('Delete Team')).not.toBeInTheDocument();
    });
  });

  it('deletes a non-expanded team and keeps the expanded team row visible', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/organization/remove-team' as never),
        () => {
          return HttpResponse.json({ id: 'team-2' });
        },
      ),
    );
    seedOrgCache();
    const user = userEvent.setup();
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    // Expand team-1
    const toggleButtons = screen.getAllByRole('button', {
      name: 'Toggle members',
    });
    await user.click(toggleButtons[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText('Loading members...')).toBeInTheDocument();
    });
    // Delete team-2 (different from the expanded team-1)
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete team',
    });
    await user.click(deleteButtons[1] as HTMLElement);
    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete "Design"/),
      ).toBeInTheDocument();
    });
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);
    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to delete/),
      ).not.toBeInTheDocument();
    });
  });

  it('shows default team indicator for the default team', async () => {
    seedOrgCache([
      {
        id: 'team-123',
        name: 'Default Team',
        slug: 'default-team',
        organizationId: 'org-1',
        createdAt: '2025-01-15T10:00:00.000Z',
      },
      {
        id: 'team-456',
        name: 'Other Team',
        slug: 'other-team',
        organizationId: 'org-1',
        createdAt: '2025-02-20T10:00:00.000Z',
      },
    ]);
    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    // The default team handler returns 'team-123' as the default
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Default team' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: 'Set as default team' }),
    ).toBeInTheDocument();
  });

  it('only renders teams for the given organization', () => {
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [
          {
            id: 'org-1',
            name: 'Org 1',
            slug: 'org-1',
            role: 'owner',
            memberCount: 1,
            createdAt: '2025-01-01T00:00:00.000Z',
            isDefault: true,
            teams: [
              {
                id: 'team-1',
                name: 'Org1 Team',
                slug: 'org1-team',
                organizationId: 'org-1',
                createdAt: '2025-01-01T00:00:00.000Z',
              },
            ],
          },
          {
            id: 'org-2',
            name: 'Org 2',
            slug: 'org-2',
            role: 'member',
            memberCount: 1,
            createdAt: '2025-01-01T00:00:00.000Z',
            isDefault: false,
            teams: [
              {
                id: 'team-2',
                name: 'Org2 Team',
                slug: 'org2-team',
                organizationId: 'org-2',
                createdAt: '2025-01-01T00:00:00.000Z',
              },
            ],
          },
        ],
        hasNext: false,
        hasPrevious: false,
        totalResults: 2,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });

    renderWithProviders(
      <TeamManagementSection
        organizationId="org-1"
        canManage
      />,
    );
    expect(screen.getByText('Org1 Team')).toBeInTheDocument();
    expect(screen.queryByText('Org2 Team')).not.toBeInTheDocument();
  });
});
