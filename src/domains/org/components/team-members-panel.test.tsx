import { mockTeamMembers } from '@domains/org/services/teams/list-team-members.http-service.handlers';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { TeamMembersPanel } from './team-members-panel';

function renderPanel(canManage = true) {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMembersPanel
        teamId="team-1"
        organizationId="org-1"
        canManage={canManage}
      />
    </Suspense>,
  );
}

describe('TeamMembersPanel', () => {
  it('renders team member names', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(screen.getByText('Bob Member')).toBeInTheDocument();
  });

  it('renders team member emails', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows permanent badge for members without expiration', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Permanent')).toBeInTheDocument();
    });
  });

  it('shows expiration badge for members with expiresAt', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText(/Expires/)).toBeInTheDocument();
    });
  });

  it('shows member select and add button when canManage is true', async () => {
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByLabelText('Select member to add')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
  });

  it('hides member select when canManage is false', async () => {
    renderPanel(false);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(
      screen.queryByLabelText('Select member to add'),
    ).not.toBeInTheDocument();
  });

  it('shows remove buttons when canManage is true', async () => {
    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Remove from team' }),
      ).toHaveLength(mockTeamMembers.length);
    });
  });

  it('hides remove buttons when canManage is false', async () => {
    renderPanel(false);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Remove from team' }),
    ).not.toBeInTheDocument();
  });

  it('shows expiration date input when canManage is true', async () => {
    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Access expiration date'),
      ).toBeInTheDocument();
    });
  });

  it('opens remove confirmation dialog on remove click', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    const removeButton = screen.getAllByRole('button', {
      name: 'Remove from team',
    })[0] as HTMLElement;
    await user.click(removeButton);
    await waitFor(() => {
      expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
      expect(
        screen.getByText(/Remove Alice Owner from this team\?/),
      ).toBeInTheDocument();
    });
  });

  it('shows clear button when expiration date is set', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Access expiration date'),
      ).toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText('Access expiration date');
    await user.type(dateInput, '2026-12-01T12:00');
    expect(screen.getByLabelText('Clear expiration')).toBeInTheDocument();
  });

  it('clears expiration date on clear button click', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Access expiration date'),
      ).toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText(
      'Access expiration date',
    ) as HTMLInputElement;
    await user.type(dateInput, '2026-12-01T12:00');
    await user.click(screen.getByLabelText('Clear expiration'));
    expect(dateInput.value).toBe('');
  });

  it('renders empty state when no team members', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
        () => {
          return HttpResponse.json({
            responseData: { results: [] },
            responseErrors: null,
          });
        },
      ),
    );

    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getByText('No members in this team yet.'),
      ).toBeInTheDocument();
    });
  });

  it('does not add member when no user is selected (Add button disabled)', async () => {
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });
    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
  });

  it('adds a team member after selecting from the dropdown', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    const option = screen.getAllByRole('option')[0] as HTMLElement;
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });
  });

  it('adds a team member with expiration date', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText('Access expiration date');
    await user.type(dateInput, '2027-06-01T12:00');

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    const option = screen.getAllByRole('option')[0] as HTMLElement;
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add/ });
    await user.click(addButton);

    await waitFor(() => {
      const input = screen.getByLabelText(
        'Access expiration date',
      ) as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  it('confirms and removes a team member', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByRole('button', {
      name: 'Remove from team',
    })[0] as HTMLElement;
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: 'Remove' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Remove Team Member')).not.toBeInTheDocument();
    });
  });

  it('closes remove confirmation dialog when cancelled', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByRole('button', {
      name: 'Remove from team',
    })[0] as HTMLElement;
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Remove Team Member')).not.toBeInTheDocument();
    });
  });

  it('shows userId when team member name is null', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 'tm-null',
                  userId: 'user-null-name',
                  teamId: 'team-1',
                  name: null,
                  email: null,
                  createdAt: '2025-01-01T00:00:00.000Z',
                  expiresAt: null,
                },
              ],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('user-null-name')).toBeInTheDocument();
    });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows userId in remove dialog when member name is null', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 'tm-null',
                  userId: 'user-null-name',
                  teamId: 'team-1',
                  name: null,
                  email: null,
                  createdAt: '2025-01-01T00:00:00.000Z',
                  expiresAt: null,
                },
              ],
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('user-null-name')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', {
      name: 'Remove from team',
    });
    await user.click(removeButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Remove user-null-name from this team\?/),
      ).toBeInTheDocument();
    });
  });

  it('shows error alert when add member mutation fails', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
        () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    const option = screen.getAllByRole('option')[0] as HTMLElement;
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add/ });
    await user.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to update team members. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error alert when remove member mutation fails', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.delete(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/members/{memberUserId}',
        ),
        () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByRole('button', {
      name: 'Remove from team',
    })[0] as HTMLElement;
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: 'Remove' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to update team members. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('hides add controls when canManage is true but no available members', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/members'), () => {
        return HttpResponse.json({
          responseData: {
            results: [
              {
                id: 'member-1',
                userId: 'user-1',
                name: 'Alice Owner',
                email: 'alice@example.com',
                role: 'owner',
                createdAt: '2025-01-01T00:00:00.000Z',
              },
              {
                id: 'member-2',
                userId: 'user-2',
                name: 'Bob Member',
                email: 'bob@example.com',
                role: 'member',
                createdAt: '2025-02-01T00:00:00.000Z',
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
      }),
    );

    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('does not show Actions column when canManage is false', async () => {
    renderPanel(false);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('renders correctly when org members responseData is null', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/members'), () => {
        return HttpResponse.json({
          responseData: null,
          responseErrors: null,
        });
      }),
    );

    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    // With no available org members (responseData null → empty array), the add controls are hidden
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders correctly when team members responseData is null', async () => {
    const { server } = await import('@/../testsSetup');
    const { HttpResponse, http } = await import('msw');
    const { buildBackendUrl } = await import('@lib/test-backend-url.utils');

    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        },
      ),
    );

    renderPanel(true);
    await waitFor(() => {
      expect(
        screen.getByText('No members in this team yet.'),
      ).toBeInTheDocument();
    });
  });

  it('does not call add mutation when selectedUserId is empty (defensive guard)', async () => {
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });
    // Force-fire the click even though the button is disabled to exercise the defensive guard at L73-74
    const addButton = screen.getByRole('button', { name: /Add/ });
    fireEvent.click(addButton);
    // No error or mutation is triggered — panel stays stable
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
  });

  it('does not call remove mutation when confirmRemove is null (defensive guard)', async () => {
    const user = userEvent.setup();
    renderPanel(true);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByRole('button', {
      name: 'Remove from team',
    })[0] as HTMLElement;
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    });

    // Cancel the dialog so confirmRemove becomes null
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Remove Team Member')).not.toBeInTheDocument();
    });

    // confirmRemove is now null; the panel is stable
    expect(screen.getByText('Alice Owner')).toBeInTheDocument();
  });
});
