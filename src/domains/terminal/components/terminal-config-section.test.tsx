import { TerminalConfigSection } from '@domains/terminal/components/terminal-config-section';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ organizationSlug: 'test-org', teamSlug: 'my-team' }),
  };
});

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    role: 'owner',
  }),
}));

function configHandler(overrides?: {
  inactivityTimeoutMs?: number;
  hardCapMs?: number | null;
  results?: null;
}) {
  return http.get(
    buildBackendUrl('/api/v1/{organizationId}/terminal/config'),
    () => {
      if (overrides?.results === null) {
        return HttpResponse.json({
          responseData: { results: undefined },
          responseErrors: null,
        });
      }
      return HttpResponse.json({
        responseData: {
          results: {
            inactivityTimeoutMs: overrides?.inactivityTimeoutMs ?? 3_600_000,
            hardCapMs: overrides?.hardCapMs ?? null,
            maxConcurrentSessions: 5,
            defaultWorkingDirectory: null,
            recordingRetentionDays: null,
            recordingMaxSizePerSessionBytes: null,
            recordingMaxSizePerOrgBytes: null,
          },
        },
        responseErrors: null,
      });
    },
  );
}

function renderSection() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <TerminalConfigSection />
    </Suspense>,
  );
}

describe('TerminalConfigSection', () => {
  it('renders the terminal config form', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Terminal Session Timeouts')).toBeInTheDocument();
    });
  });

  it('computes inactivity timeout in minutes from config', async () => {
    server.use(configHandler({ inactivityTimeoutMs: 7_200_000 }));
    renderSection();
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
      ).toHaveValue(120);
    });
  });

  it('defaults inactivity timeout to 60 when config results are undefined', async () => {
    server.use(configHandler({ results: null }));
    renderSection();
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
      ).toHaveValue(60);
    });
  });

  it('computes hard cap hours from config when hardCapMs is set', async () => {
    server.use(configHandler({ hardCapMs: 7_200_000 }));
    renderSection();
    await waitFor(() => {
      expect(screen.getByLabelText(/Hard Cap \(hours\)/)).toHaveValue(2);
    });
  });

  it('leaves hard cap empty when hardCapMs is null', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByLabelText(/Hard Cap \(hours\)/)).toHaveValue(null);
    });
  });

  it('shows success alert after form submission and hides it after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSection();

    const input = await screen.findByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );

    // Make form dirty so submit button becomes enabled
    await user.clear(input);
    await user.type(input, '30');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Configuration' }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole('button', { name: 'Save Configuration' }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Terminal configuration updated successfully.'),
      ).toBeInTheDocument();
    });

    await act(() => vi.advanceTimersByTime(5000));

    await waitFor(() => {
      expect(
        screen.queryByText('Terminal configuration updated successfully.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('clears previous timeout when submitting again', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSection();

    const input = await screen.findByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );

    // Make form dirty so submit button becomes enabled
    await user.clear(input);
    await user.type(input, '30');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Configuration' }),
      ).toBeEnabled();
    });

    // First submission
    await user.click(
      screen.getByRole('button', { name: 'Save Configuration' }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Terminal configuration updated successfully.'),
      ).toBeInTheDocument();
    });

    // Advance partially
    await act(() => vi.advanceTimersByTime(3000));

    // Make form dirty again for second submission
    await user.clear(input);
    await user.type(input, '45');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Configuration' }),
      ).toBeEnabled();
    });

    // Second submission — should clear previous timeout
    await user.click(
      screen.getByRole('button', { name: 'Save Configuration' }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Terminal configuration updated successfully.'),
      ).toBeInTheDocument();
    });

    // Advance 3 more seconds — past the original 5s from first submit
    await act(() => vi.advanceTimersByTime(3000));

    // Success should still show (reset by second submit)
    expect(
      screen.getByText('Terminal configuration updated successfully.'),
    ).toBeInTheDocument();

    // Advance the remaining 2s to complete the second 5s timeout
    await act(() => vi.advanceTimersByTime(2000));

    await waitFor(() => {
      expect(
        screen.queryByText('Terminal configuration updated successfully.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
