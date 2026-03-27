import { EditTeamDialog } from '@domains/org/modals/edit-team-dialog';
import { env } from '@lib/env.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const mockTeam = {
  id: 'team-1',
  name: 'Original Name',
  slug: 'original-name',
  organizationId: 'org-1',
  createdAt: '2025-01-01T00:00:00.000Z',
};

const updateTeamHandler = http.post(
  `${env.BACKEND_BASE_URL}/api/v1/organization/update-team`,
  () => {
    return HttpResponse.json({
      id: 'team-1',
      name: 'Updated Name',
      slug: 'updated-name',
      organizationId: 'org-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  },
);

beforeEach(() => {
  server.use(updateTeamHandler);
});

describe('EditTeamDialog', () => {
  it('renders dialog title', () => {
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Edit Team')).toBeInTheDocument();
  });

  it('pre-fills input with team name', () => {
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
  });

  it('disables save button when name is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('allows editing the team name', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    await user.type(input, 'New Name');
    expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
  });

  it('enables save button with valid name', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    await user.type(input, 'New Name');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('does not submit when name is only whitespace', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={{ ...mockTeam, name: '   ' }}
        onClose={onClose}
      />,
    );
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('submits and calls onClose on success', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={onClose}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    await user.type(input, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('submits on Enter key press', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={onClose}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    await user.type(input, 'Updated Name');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not submit on Enter when name is empty', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={{ ...mockTeam, name: '   ' }}
        onClose={onClose}
      />,
    );
    await user.keyboard('{Enter}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not submit on Enter when name is only whitespace after editing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={onClose}
      />,
    );
    const input = screen.getByDisplayValue('Original Name');
    await user.clear(input);
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when dialog is closed via overlay', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={onClose}
      />,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('shows pending state while saving', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(
        `${env.BACKEND_BASE_URL}/api/v1/organization/update-team`,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            id: 'team-1',
            name: 'Updated',
            slug: 'updated',
            organizationId: 'org-1',
            createdAt: '2025-01-01T00:00:00.000Z',
          });
        },
      ),
    );

    renderWithProviders(
      <EditTeamDialog
        team={mockTeam}
        onClose={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
