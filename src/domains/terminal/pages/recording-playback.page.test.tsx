import { RecordingPlaybackPage } from '@domains/terminal/pages/recording-playback.page';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    }),
  };
});

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording',
  () => ({
    Route: {
      useParams: () => ({ sessionId: '1', teamSlug: 'my-team' }),
    },
  }),
);

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    role: 'owner',
  }),
}));

function renderPage() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <RecordingPlaybackPage />
    </Suspense>,
  );
}

describe('RecordingPlaybackPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders back button', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /back to sessions/i }),
      ).toBeInTheDocument();
    });
  });

  it('renders session recording title', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session Recording — #1')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    const backButton = await screen.findByRole('button', {
      name: /back to sessions/i,
    });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug/t/$teamSlug/terminal',
      params: {
        organizationSlug: 'test-org',
        teamSlug: 'my-team',
      },
    });
  });

  it('renders empty state when recording is not found', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording',
        ),
        () => {
          return HttpResponse.json({
            responseData: {
              results: null,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Recording not found')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Could not load the recording for this session.'),
    ).toBeInTheDocument();
  });
});
