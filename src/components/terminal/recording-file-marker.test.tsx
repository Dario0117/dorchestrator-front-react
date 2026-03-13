import {
  type FileEventData,
  RecordingFileMarker,
} from '@components/terminal/recording-file-marker';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

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

describe('RecordingFileMarker', () => {
  it('should render file name', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={null}
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
        imageId={null}
      />,
    );

    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
  });

  it('should render file icon for non-image files', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={baseEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={null}
      />,
    );

    expect(screen.getByTestId('recording-file-marker')).toBeInTheDocument();
    // Should not have an img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render image thumbnail when imageId is provided for image files', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={42}
      />,
    );

    const img = screen.getByAltText('screenshot.png');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('/api/v1/org-1/terminal/sessions/1/images/42'),
    );
  });

  it('should render image icon when image file has no imageId', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={null}
      />,
    );

    // Should not have an img element since imageId is null
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should format bytes correctly', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={{ ...baseEvent, sizeBytes: 500 }}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={null}
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
        imageId={null}
      />,
    );

    expect(screen.getByText(/5\.0 MB/)).toBeInTheDocument();
  });

  it('should render image link pointing to backend', () => {
    renderWithProviders(
      <RecordingFileMarker
        event={imageEvent}
        timestamp="2026-01-15T10:30:00.000Z"
        organizationId="org-1"
        sessionId={1}
        imageId={42}
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/api/v1/org-1/terminal/sessions/1/images/42'),
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
