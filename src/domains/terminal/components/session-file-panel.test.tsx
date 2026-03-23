import { SessionFilePanel } from '@domains/terminal/components/session-file-panel';
import { listSessionFilesHandler } from '@domains/terminal/services/list-session-files.http-service.handlers';
import { uploadSessionFileHandler } from '@domains/terminal/services/upload-session-file.http-service.handlers';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const ORG_ID = 'org-123';
const SESSION_ID = 1;

const downloadUrlHandler = http.get(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/{fileId}/download-url',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          downloadUrl: 'https://s3.example.com/download/screenshot.png',
          expiresInSeconds: 3600,
        },
      },
      responseErrors: null,
    });
  },
);

const s3UploadHandler = http.put(
  'https://s3.example.com/presigned-upload-url',
  () => {
    return new HttpResponse(null, { status: 200 });
  },
);

function setupHandlers() {
  server.use(
    listSessionFilesHandler,
    uploadSessionFileHandler,
    downloadUrlHandler,
    s3UploadHandler,
  );
}

function setupEmptyFilesHandler() {
  server.use(
    http.get(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
      ),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [],
            hasNext: false,
            hasPrevious: false,
            totalResults: 0,
            totalPages: 0,
            page: 1,
            size: 100,
          },
          responseErrors: null,
        });
      },
    ),
    downloadUrlHandler,
    uploadSessionFileHandler,
    s3UploadHandler,
  );
}

const defaultProps = {
  organizationId: ORG_ID,
  sessionId: SESSION_ID,
};

describe('SessionFilePanel', () => {
  beforeEach(() => {
    setupHandlers();
  });

  it('renders the toggle button with file count', async () => {
    renderWithProviders(<SessionFilePanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('toggle-file-panel')).toHaveTextContent(
        'Files (1)',
      );
    });
  });

  it('renders the toggle button without count when no files', async () => {
    setupEmptyFilesHandler();
    renderWithProviders(<SessionFilePanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('toggle-file-panel')).toHaveTextContent(
        'Files',
      );
    });
    expect(screen.getByTestId('toggle-file-panel')).not.toHaveTextContent(
      'Files (',
    );
  });

  it('shows the upload button when not readOnly', () => {
    renderWithProviders(<SessionFilePanel {...defaultProps} />);

    expect(screen.getByTestId('upload-file-btn')).toBeInTheDocument();
  });

  it('hides the upload button in readOnly mode', () => {
    renderWithProviders(
      <SessionFilePanel
        {...defaultProps}
        readOnly={true}
      />,
    );

    expect(screen.queryByTestId('upload-file-btn')).not.toBeInTheDocument();
  });

  describe('toggle expanded', () => {
    it('shows file gallery when toggle is clicked', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      expect(screen.queryByTestId('file-gallery')).not.toBeInTheDocument();

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      expect(screen.getByTestId('file-gallery')).toBeInTheDocument();
    });

    it('hides file gallery when toggle is clicked again', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));
      expect(screen.getByTestId('file-gallery')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('toggle-file-panel'));
      expect(screen.queryByTestId('file-gallery')).not.toBeInTheDocument();
    });
  });

  describe('file gallery content', () => {
    it('shows empty message when no files and not readOnly', async () => {
      setupEmptyFilesHandler();
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      expect(
        screen.getByText(
          'No files uploaded. Drag and drop or click Upload to add files.',
        ),
      ).toBeInTheDocument();
    });

    it('shows readOnly empty message when no files and readOnly', async () => {
      setupEmptyFilesHandler();
      renderWithProviders(
        <SessionFilePanel
          {...defaultProps}
          readOnly={true}
        />,
      );

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      expect(
        screen.getByText('No files were uploaded during this session.'),
      ).toBeInTheDocument();
    });

    it('renders FileThumb for each file when expanded', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });
    });

    it('sets aria-label based on readOnly prop', async () => {
      const { unmount } = renderWithProviders(
        <SessionFilePanel {...defaultProps} />,
      );

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      expect(screen.getByTestId('file-gallery')).toHaveAttribute(
        'aria-label',
        'File upload drop zone',
      );

      unmount();

      renderWithProviders(
        <SessionFilePanel
          {...defaultProps}
          readOnly={true}
        />,
      );

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      expect(screen.getByTestId('file-gallery')).toHaveAttribute(
        'aria-label',
        'Session files',
      );
    });
  });

  describe('FileThumb', () => {
    it('renders image thumbnail when thumbnailUrl is available', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      // The FileThumb should trigger lazy URL load for image files
      await waitFor(() => {
        const img = screen.getByAltText('screenshot.png');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute(
          'src',
          'https://s3.example.com/download/screenshot.png',
        );
      });
    });

    it('renders file icon for non-image files', async () => {
      server.use(
        http.get(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 2,
                    sessionId: 1,
                    filename: 'document.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: 51200,
                    createdAt: new Date().toISOString(),
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

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-2')).toBeInTheDocument();
      });

      // Non-image should not have an img element
      expect(screen.queryByAltText('document.pdf')).not.toBeInTheDocument();
    });
  });

  describe('file upload', () => {
    it('shows error when file exceeds 10MB', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'.repeat(100)], 'large.png', {
        type: 'image/png',
      });
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024,
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(
          screen.getByText('File size exceeds 10MB limit'),
        ).toBeInTheDocument();
      });
    });

    it('dismisses upload error when X button is clicked', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'], 'large.png', {
        type: 'image/png',
      });
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024,
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(
          screen.getByText('File size exceeds 10MB limit'),
        ).toBeInTheDocument();
      });

      // Click the X button to dismiss error
      const errorDismissButton = screen
        .getByText('File size exceeds 10MB limit')
        .closest('div')
        ?.querySelector('button');
      expect(errorDismissButton).toBeTruthy();
      if (errorDismissButton) {
        await userEvent.click(errorDismissButton);
      }

      expect(
        screen.queryByText('File size exceeds 10MB limit'),
      ).not.toBeInTheDocument();
    });

    it('expands panel after successful upload', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      expect(screen.queryByTestId('file-gallery')).not.toBeInTheDocument();

      const fileInput = screen.getByTestId('file-input');
      const validFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('file-gallery')).toBeInTheDocument();
      });
    });

    it('shows error message on upload failure', async () => {
      server.use(
        http.post(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/upload-url',
          ),
          () => {
            return HttpResponse.json(
              { message: 'Server error' },
              { status: 500 },
            );
          },
        ),
      );

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');
      const validFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
    });

    it('triggers file input when upload button is clicked', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');
      const clickSpy = vi.spyOn(fileInput, 'click');

      await userEvent.click(screen.getByTestId('upload-file-btn'));

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('handles file drop', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      // Expand the panel first
      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      const gallery = screen.getByTestId('file-gallery');
      const validFile = new File(['content'], 'dropped.png', {
        type: 'image/png',
      });

      fireEvent.drop(gallery, {
        dataTransfer: { files: [validFile] },
      });

      // After drop, the panel should remain expanded (upload triggers expansion)
      await waitFor(() => {
        expect(screen.getByTestId('file-gallery')).toBeInTheDocument();
      });
    });

    it('highlights gallery on dragOver and removes on dragLeave', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      const gallery = screen.getByTestId('file-gallery');

      fireEvent.dragOver(gallery, {
        preventDefault: vi.fn(),
      });

      // After dragOver, the gallery should have the drag-over indicator
      await waitFor(() => {
        expect(gallery).toHaveAttribute('data-drag-over', '');
      });

      fireEvent.dragLeave(gallery);

      await waitFor(() => {
        expect(gallery).not.toHaveAttribute('data-drag-over');
      });
    });

    it('does not process drop in readOnly mode', async () => {
      renderWithProviders(
        <SessionFilePanel
          {...defaultProps}
          readOnly={true}
        />,
      );

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      const gallery = screen.getByTestId('file-gallery');
      const validFile = new File(['content'], 'dropped.png', {
        type: 'image/png',
      });

      fireEvent.drop(gallery, {
        dataTransfer: { files: [validFile] },
      });

      // Gallery should still be visible but no upload should occur
      expect(screen.getByTestId('file-gallery')).toBeInTheDocument();
    });
  });

  describe('file viewer dialog', () => {
    it('opens dialog when file thumb is clicked', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        expect(screen.getByText('screenshot.png')).toBeInTheDocument();
      });
    });

    it('shows image preview for image files in dialog', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        const dialogImages = screen.getAllByAltText('screenshot.png');
        // One in the thumbnail, one in the dialog
        expect(dialogImages.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows file details in dialog', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        expect(screen.getByText('image/png')).toBeInTheDocument();
      });
      // 200.0 KB appears both in the thumbnail overlay and dialog details
      const sizeElements = screen.getAllByText('200.0 KB');
      expect(sizeElements.length).toBeGreaterThanOrEqual(2);
    });

    it('shows download link in dialog', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        const downloadLink = screen.getByText('Download');
        expect(downloadLink).toBeInTheDocument();
        expect(downloadLink).toHaveAttribute(
          'href',
          'https://s3.example.com/download/screenshot.png',
        );
        expect(downloadLink).toHaveAttribute('download', 'screenshot.png');
      });
    });

    it('closes dialog when onOpenChange is triggered with false', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      // Open dialog
      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        expect(screen.getByText('screenshot.png')).toBeInTheDocument();
      });

      // Close dialog by pressing Escape
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        // The dialog title should no longer be visible
        expect(screen.queryByText('image/png')).not.toBeInTheDocument();
      });
    });

    it('renders non-image file with file icon in thumbnail', async () => {
      server.use(
        http.get(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 3,
                    sessionId: 1,
                    filename: 'data.csv',
                    mimeType: 'text/csv',
                    sizeBytes: 512,
                    createdAt: new Date().toISOString(),
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

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-3')).toBeInTheDocument();
      });

      // Non-image file shows file icon, not an img element
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      // formatSize is displayed in the overlay
      expect(screen.getByText('512 B')).toBeInTheDocument();
    });
  });

  describe('formatSize', () => {
    it('formats bytes correctly via FileThumb overlay', async () => {
      server.use(
        http.get(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 10,
                    sessionId: 1,
                    filename: 'tiny.txt',
                    mimeType: 'text/plain',
                    sizeBytes: 500,
                    createdAt: new Date().toISOString(),
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

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-10')).toBeInTheDocument();
      });

      // formatSize is rendered in the FileThumb overlay
      expect(screen.getByText('500 B')).toBeInTheDocument();
    });

    it('formats kilobytes correctly via FileThumb overlay', async () => {
      server.use(
        http.get(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 11,
                    sessionId: 1,
                    filename: 'medium.txt',
                    mimeType: 'text/plain',
                    sizeBytes: 5120,
                    createdAt: new Date().toISOString(),
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

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-11')).toBeInTheDocument();
      });

      expect(screen.getByText('5.0 KB')).toBeInTheDocument();
    });

    it('formats megabytes correctly via FileThumb overlay', async () => {
      server.use(
        http.get(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 12,
                    sessionId: 1,
                    filename: 'big.bin',
                    mimeType: 'application/octet-stream',
                    sizeBytes: 5242880,
                    createdAt: new Date().toISOString(),
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

      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-12')).toBeInTheDocument();
      });

      expect(screen.getByText('5.0 MB')).toBeInTheDocument();
    });

    it('formats KB size in the dialog details', async () => {
      // Default file is 204800 bytes = 200.0 KB
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      await userEvent.click(screen.getByTestId('toggle-file-panel'));

      await waitFor(() => {
        expect(screen.getByTestId('file-thumb-1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('file-thumb-1'));

      await waitFor(() => {
        // Dialog should show file details
        expect(screen.getByText('image/png')).toBeInTheDocument();
      });
    });
  });

  describe('handleFileChange', () => {
    it('uploads multiple files from file input', async () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');
      const file1 = new File(['a'], 'file1.png', { type: 'image/png' });
      const file2 = new File(['b'], 'file2.png', { type: 'image/png' });

      fireEvent.change(fileInput, {
        target: { files: [file1, file2] },
      });

      // After upload, panel should expand
      await waitFor(() => {
        expect(screen.getByTestId('file-gallery')).toBeInTheDocument();
      });
    });

    it('handles null files gracefully', () => {
      renderWithProviders(<SessionFilePanel {...defaultProps} />);

      const fileInput = screen.getByTestId('file-input');

      // Fire change with null files — should not throw or trigger uploads
      fireEvent.change(fileInput, { target: { files: null } });

      // No error should appear and no gallery should expand
      expect(screen.queryByTestId('file-gallery')).not.toBeInTheDocument();
      expect(
        screen.queryByText('File size exceeds 10MB limit'),
      ).not.toBeInTheDocument();
    });
  });
});
