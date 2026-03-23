import { ColdStorageView } from '@domains/terminal/components/cold-storage-view';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

describe('ColdStorageView', () => {
  it('should render archived title and description', () => {
    renderWithProviders(
      <ColdStorageView
        organizationId="org-1"
        sessionId={1}
      />,
    );

    expect(screen.getByText('Recording archived')).toBeInTheDocument();
    expect(screen.getByText(/moved to cold storage/)).toBeInTheDocument();
  });

  it('should render restore button', () => {
    renderWithProviders(
      <ColdStorageView
        organizationId="org-1"
        sessionId={1}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Restore Recording' }),
    ).toBeInTheDocument();
  });

  it('should show pending state when restore is clicked', async () => {
    const user = userEvent.setup();

    let resolveRestore!: () => void;
    const restorePromise = new Promise<void>((resolve) => {
      resolveRestore = resolve;
    });

    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording/restore',
        ),
        async () => {
          await restorePromise;
          return HttpResponse.json(
            {
              responseData: {
                results: { sessionId: 1, status: 'restoring' },
              },
              responseErrors: null,
            },
            { status: 201 },
          );
        },
      ),
    );

    renderWithProviders(
      <ColdStorageView
        organizationId="org-1"
        sessionId={1}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Restore Recording' }));

    await waitFor(() => {
      expect(screen.getByText('Requesting...')).toBeInTheDocument();
    });

    resolveRestore();
  });
});
