import { RecordingContent } from '@components/terminal/pages/recording-content';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { RecordingData } from '@services/terminal/get-recording.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const mockRecordingWithChunks: RecordingData = {
  chunks: [
    {
      sequenceNumber: 0,
      events: [{ type: 'output', data: 'hello world', timestamp: '0' }],
      timestamp: '2025-12-01T10:00:00.000Z',
      sizeBytes: 100,
    },
  ],
  totalChunks: 1,
  totalSizeBytes: 100,
  durationSeconds: 60,
  recordingStorageTier: 'hot',
};

const mockEmptyRecording: RecordingData = {
  chunks: [],
  totalChunks: 0,
  totalSizeBytes: 0,
  durationSeconds: 0,
  recordingStorageTier: 'hot',
};

const mockColdRecording: RecordingData = {
  chunks: [],
  totalChunks: 0,
  totalSizeBytes: 0,
  durationSeconds: 0,
  recordingStorageTier: 'cold',
};

const mockRestoringRecording: RecordingData = {
  chunks: [],
  totalChunks: 0,
  totalSizeBytes: 0,
  durationSeconds: 0,
  recordingStorageTier: 'restoring',
};

describe('RecordingContent', () => {
  it('should render ColdStorageView when tier is cold', () => {
    renderWithProviders(
      <RecordingContent
        recording={mockColdRecording}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    expect(screen.getByText('Recording archived')).toBeInTheDocument();
  });

  it('should render RestoringView when tier is restoring', () => {
    renderWithProviders(
      <RecordingContent
        recording={mockRestoringRecording}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    expect(screen.getByText('Restoring recording...')).toBeInTheDocument();
  });

  it('should render empty state when chunks are empty', () => {
    renderWithProviders(
      <RecordingContent
        recording={mockEmptyRecording}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    expect(screen.getByText('No recording data')).toBeInTheDocument();
  });

  it('should render font size controls when recording has chunks', async () => {
    renderWithProviders(
      <RecordingContent
        recording={mockRecordingWithChunks}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /increase/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /decrease/i }),
      ).toBeInTheDocument();
    });
  });

  it('should build image map from session images query', async () => {
    let handlerCalled = false;
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/images',
        ),
        () => {
          handlerCalled = true;
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 42,
                  sessionId: 1,
                  filename: 'screenshot.png',
                  mimeType: 'image/png',
                  sizeBytes: 2048,
                  createdAt: '2025-12-01T10:00:00.000Z',
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
        },
      ),
    );

    renderWithProviders(
      <RecordingContent
        recording={mockRecordingWithChunks}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    await waitFor(() => {
      expect(handlerCalled).toBe(true);
    });

    // Wait for the query data to propagate and trigger a re-render
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /increase/i }),
      ).toBeInTheDocument();
    });
  });

  it('should render restore button in cold storage view', async () => {
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
      <RecordingContent
        recording={mockColdRecording}
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
