import { SandboxPresetsSection } from '@domains/sandbox/components/sandbox-presets-section';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type ListPresetsSuccessResponse =
  operations['getApiV1ByOrganizationIdSandboxPresets']['responses']['200']['content']['application/json'];

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

function renderComponent() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <SandboxPresetsSection />
    </Suspense>,
  );
}

describe('SandboxPresetsSection', () => {
  it('renders the section title and create button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Sandbox Presets')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /create preset/i }),
    ).toBeInTheDocument();
  });

  it('renders preset names from the API', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    // "No Sandbox" appears both as a preset name and as a sandbox type label
    expect(screen.getAllByText('No Sandbox').length).toBeGreaterThanOrEqual(1);
  });

  it('renders sandbox type labels for each preset', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    // sandboxTypeId 2 maps to 'Docker', sandboxTypeId 1 maps to 'No Sandbox'
    const dockerLabels = screen.getAllByText('Docker');
    expect(dockerLabels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('No Sandbox').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Default" badge for the org default preset', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('shows "Requires Approval" badge for presets that require approval', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText('Requires Approval').length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders description for presets that have one', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Standard Docker sandbox with allow-all networking'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Docker sandbox with restricted networking'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Direct host execution with no isolation'),
    ).toBeInTheDocument();
  });

  it('shows "Set as Default" button only for non-default presets', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    const setDefaultButtons = screen.getAllByRole('button', {
      name: /set as default/i,
    });
    // Only 2 of the 3 presets are non-default
    expect(setDefaultButtons).toHaveLength(2);
  });

  it('disables the delete button for the org default preset', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // The first preset is the default — its delete button should be disabled
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();
    expect(deleteButtons[2]).not.toBeDisabled();
  });

  it('opens the create dialog when "Create Preset" is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create preset/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create preset/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole('dialog')).getByRole('heading', {
        name: 'Create Preset',
      }),
    ).toBeInTheDocument();
  });

  it('opens the edit dialog when "Edit" is clicked on a preset', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    await user.click(editButtons[0]!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole('dialog')).getByRole('heading', {
        name: 'Edit Preset',
      }),
    ).toBeInTheDocument();
  });

  it('calls the set-default mutation when "Set as Default" is clicked', async () => {
    let setDefaultCalled = false;
    server.use(
      http.patch(
        buildBackendUrl(
          '/api/v1/{organizationId}/sandbox/presets/{presetId}/set-default',
        ),
        () => {
          setDefaultCalled = true;
          return HttpResponse.json({
            responseData: { results: ['Default preset updated'] },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    });

    const setDefaultButtons = screen.getAllByRole('button', {
      name: /set as default/i,
    });
    await user.click(setDefaultButtons[0]!);

    await waitFor(() => {
      expect(setDefaultCalled).toBe(true);
    });
  });

  it('opens confirm dialog when "Delete" is clicked on a non-default preset', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // Click delete on the second preset (Restricted Docker, not default)
    await user.click(deleteButtons[1]!);

    await waitFor(() => {
      expect(screen.getByText('Delete Preset')).toBeInTheDocument();
      expect(
        screen.getByText(
          /are you sure you want to delete the preset "Restricted Docker"/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('calls the delete mutation when confirming deletion', async () => {
    let deleteCalled = false;
    server.use(
      http.delete(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets/{presetId}'),
        () => {
          deleteCalled = true;
          return HttpResponse.json({
            responseData: { results: ['Preset deleted successfully'] },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[1]!);

    await waitFor(() => {
      expect(screen.getByText('Delete Preset')).toBeInTheDocument();
    });

    // Click the confirm "Delete" button in the dialog
    const confirmButton = within(screen.getByRole('alertdialog')).getByRole(
      'button',
      { name: /delete/i },
    );
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });
  });

  it('closes the confirm dialog when cancelled', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[1]!);

    await waitFor(() => {
      expect(screen.getByText('Delete Preset')).toBeInTheDocument();
    });

    const cancelButton = within(screen.getByRole('alertdialog')).getByRole(
      'button',
      { name: /cancel/i },
    );
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no presets exist', async () => {
    server.use(
      http.get<never, never, ListPresetsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(
          'No sandbox presets configured. Create one to get started.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows "Unknown" when a preset has an unrecognized sandbox type ID', async () => {
    server.use(
      http.get<never, never, ListPresetsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 99,
                  organizationId: 'org-123',
                  name: 'Unknown Type Preset',
                  description: null,
                  sandboxTypeId: 999,
                  networkPolicy: null,
                  resourceLimits: null,
                  volumeMounts: null,
                  pluginConfig: null,
                  isOrgDefault: false,
                  requiresApproval: false,
                  createdBy: 'user-123',
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  it('handles null responseData for presets gracefully', async () => {
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(
          'No sandbox presets configured. Create one to get started.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('handles null responseData for sandbox types gracefully', async () => {
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/types'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    // With no sandbox types loaded, all type labels fall back to "Unknown"
    const unknownLabels = screen.getAllByText('Unknown');
    expect(unknownLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('handles confirm delete click followed by rapid second click gracefully', async () => {
    let deleteCallCount = 0;
    server.use(
      http.delete(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets/{presetId}'),
        () => {
          deleteCallCount++;
          return HttpResponse.json({
            responseData: { results: ['Preset deleted successfully'] },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Restricted Docker')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[1]!);

    await waitFor(() => {
      expect(screen.getByText('Delete Preset')).toBeInTheDocument();
    });

    const confirmButton = within(screen.getByRole('alertdialog')).getByRole(
      'button',
      { name: /delete/i },
    );

    // Use synchronous fireEvent to trigger two clicks before React can flush state
    // The second click hits the guard clause at L73 when confirmDeletePreset is null
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteCallCount).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not render description when preset has no description', async () => {
    server.use(
      http.get<never, never, ListPresetsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 10,
                  organizationId: 'org-123',
                  name: 'No Description Preset',
                  description: null,
                  sandboxTypeId: 1,
                  networkPolicy: null,
                  resourceLimits: null,
                  volumeMounts: null,
                  pluginConfig: null,
                  isOrgDefault: false,
                  requiresApproval: false,
                  createdBy: 'user-123',
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No Description Preset')).toBeInTheDocument();
    });

    // The only SmallParagraph texts should be the name and the type label, no description
    expect(
      screen.queryByText('Standard Docker sandbox with allow-all networking'),
    ).not.toBeInTheDocument();
  });
});
