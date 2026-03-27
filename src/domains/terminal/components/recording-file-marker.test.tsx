import {
  type FileEventData,
  RecordingFileMarker,
} from '@domains/terminal/components/recording-file-marker';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const baseEvent: FileEventData = {
  filename: 'report.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  writtenPath: '/tmp/report.pdf',
  transferId: 'transfer-1',
};

const imageEvent: FileEventData = {
  filename: 'screenshot.png',
  mimeType: 'image/png',
  sizeBytes: 512000,
  writtenPath: '/tmp/screenshot.png',
  transferId: 'transfer-2',
};

const downloadUrlHandler = http.get(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/{fileId}/download-url',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          downloadUrl: 'https://s3.example.com/presigned-download-url',
          expiresInSeconds: 3600,
        },
      },
      responseErrors: null,
    });
  },
);

describe('RecordingFileMarker', () => {
  it('should render file name', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('should render mime type and size for non-image files', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
  });

  it('should render file icon for non-image files without fileId', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    expect(screen.getByTestId('recording-file-marker')).toBeInTheDocument();
    // Should not have an img element or link
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render download link for non-image files with fileId', async () => {
    server.use(downloadUrlHandler);

    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={10}
      />,
    );

    const link = await waitFor(() => screen.getByRole('link'));
    expect(link).toHaveAttribute(
      'href',
      'https://s3.example.com/presigned-download-url',
    );
    expect(link).toHaveAttribute('target', '_blank');
    // Should not render an image thumbnail for non-image files
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render image thumbnail when fileId is provided for image files', async () => {
    server.use(downloadUrlHandler);

    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={42}
      />,
    );

    const img = await waitFor(() => screen.getByAltText('screenshot.png'));
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      'https://s3.example.com/presigned-download-url',
    );
  });

  it('should render image icon when image file has no fileId (no preview)', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    // Should not have an img element since fileId is null
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should format bytes correctly', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={{ ...baseEvent, sizeBytes: 500 }}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    expect(screen.getByText(/500 B/)).toBeInTheDocument();
  });

  it('should format megabytes correctly', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={{ ...imageEvent, sizeBytes: 5242880 }}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={null}
      />,
    );

    expect(screen.getByText(/5\.0 MB/)).toBeInTheDocument();
  });

  it('should fall back to icon when download URL fetch fails', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/{fileId}/download-url',
        ),
        () => HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );

    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={99}
      />,
    );

    // Wait for the failed fetch to settle, then verify no link appeared
    await waitFor(() => {
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('recording-file-marker')).toBeInTheDocument();
  });

  it('should render image link pointing to presigned URL', async () => {
    server.use(downloadUrlHandler);

    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        fileId={42}
      />,
    );

    const link = await waitFor(() => screen.getByRole('link'));
    expect(link).toHaveAttribute(
      'href',
      'https://s3.example.com/presigned-download-url',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
