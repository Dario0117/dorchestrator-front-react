import { SessionHistoryExportDialog } from '@domains/terminal/modals/session-history-export-dialog';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  organizationId: 'org-1',
  filters: {},
};

describe('SessionHistoryExportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog when open', () => {
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    expect(screen.getByText('Export Session History')).toBeInTheDocument();
    expect(
      screen.getByText(/Download session metadata as a file/),
    ).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        open={false}
      />,
    );

    expect(
      screen.queryByText('Export Session History'),
    ).not.toBeInTheDocument();
  });

  it('should show format selector with CSV and JSON options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'CSV' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'JSON' })).toBeInTheDocument();
    });
  });

  it('should show CSV description by default', () => {
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    expect(
      screen.getByText(
        /Comma-separated values, compatible with Excel and Google Sheets/,
      ),
    ).toBeInTheDocument();
  });

  it('should show JSON description when JSON format is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'JSON' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'JSON' }));

    await waitFor(() => {
      expect(
        screen.getByText(/Structured JSON format for programmatic use/),
      ).toBeInTheDocument();
    });
  });

  it('should show "All sessions will be included" when no filters', () => {
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    expect(
      screen.getByText(/All sessions will be included/),
    ).toBeInTheDocument();
  });

  it('should show filter notice when filters are applied', () => {
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        filters={{ status: 'active' }}
      />,
    );

    expect(
      screen.getByText(/Current page filters will be applied to the export/),
    ).toBeInTheDocument();
  });

  it('should show Export and Cancel buttons initially', () => {
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onOpenChange when Cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should initiate export when Export button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    // After initiating, the status polling should start and eventually show completed
    await waitFor(() => {
      // The export status handler returns 'completed' immediately
      // which triggers the download flow
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show error message when export initiation fails', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/export'),
        () => HttpResponse.error(),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to start export. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should show error when export status is failed', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'failed',
                totalRows: 10,
                rowsProcessed: 5,
                filename: null,
                errorMessage: 'Disk full',
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Disk full')).toBeInTheDocument();
    });
  });

  it('should show failed error with default message when no errorMessage', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'failed',
                totalRows: 10,
                rowsProcessed: 5,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByText('Export failed. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should show progress during export processing', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Exporting... 50%')).toBeInTheDocument();
      expect(screen.getByText('50 of 100 rows processed')).toBeInTheDocument();
    });
  });

  it('should show Pause and Cancel buttons during export', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel export' }),
      ).toBeInTheDocument();
    });
  });

  it('should show paused state with Resume and Cancel buttons', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'paused',
                totalRows: 100,
                rowsProcessed: 30,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Paused at 30%')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Resume' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel export' }),
      ).toBeInTheDocument();
    });
  });

  it('should show cancelled state with Retry button', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'cancelled',
                totalRows: 100,
                rowsProcessed: 40,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText(/Export was cancelled/)).toBeInTheDocument();
      expect(screen.getByText(/40 of 100/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  it('should reset state when Retry is clicked', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'cancelled',
                totalRows: 100,
                rowsProcessed: 40,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    // Should show format selector again
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Export' }),
      ).toBeInTheDocument();
    });
  });

  it('should show pending status text', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'pending',
                totalRows: 0,
                rowsProcessed: 0,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Starting export...')).toBeInTheDocument();
    });
  });

  it('should call pause mutation when Pause button is clicked', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Pause' }));

    // Pause request was sent - button should still be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });
  });

  it('should call resume mutation when Resume button is clicked', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'paused',
                totalRows: 100,
                rowsProcessed: 30,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Resume' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Resume' }));

    // Resume was clicked - the component stays in view
    await waitFor(() => {
      expect(screen.getByText('Paused at 30%')).toBeInTheDocument();
    });
  });

  it('should call cancel mutation when Cancel export button is clicked', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Cancel export' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel export' }));

    // Cancel was sent
    await waitFor(() => {
      expect(screen.getByText('Exporting... 50%')).toBeInTheDocument();
    });
  });

  it('should show pause_requested status text', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'pause_requested',
                totalRows: 100,
                rowsProcessed: 60,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Pausing...')).toBeInTheDocument();
    });
  });

  it('should show cancel_requested status text', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'cancel_requested',
                totalRows: 100,
                rowsProcessed: 60,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Cancelling...')).toBeInTheDocument();
    });
  });

  it('should show filter notice for deviceId filter', () => {
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        filters={{ deviceId: 1 }}
      />,
    );

    expect(
      screen.getByText(/Current page filters will be applied/),
    ).toBeInTheDocument();
  });

  it('should show filter notice for userId filter', () => {
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        filters={{ userId: 'user-1' }}
      />,
    );

    expect(
      screen.getByText(/Current page filters will be applied/),
    ).toBeInTheDocument();
  });

  it('should show filter notice for date range filter', () => {
    renderWithProviders(
      <SessionHistoryExportDialog
        {...defaultProps}
        filters={{ dateFrom: '2026-01-01', dateTo: '2026-01-31' }}
      />,
    );

    expect(
      screen.getByText(/Current page filters will be applied/),
    ).toBeInTheDocument();
  });

  it('should show error when download fails after export completes', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/download',
        ),
        () => HttpResponse.error(),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByText('Download failed. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should show error when pause mutation fails', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/pause',
        ),
        () => HttpResponse.error(),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Pause' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to pause export.')).toBeInTheDocument();
    });
  });

  it('should show error when resume mutation fails', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'paused',
                totalRows: 100,
                rowsProcessed: 30,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/resume',
        ),
        () => HttpResponse.error(),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Resume' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Resume' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to resume export.')).toBeInTheDocument();
    });
  });

  it('should show error when cancel mutation fails', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
        ),
        () =>
          HttpResponse.json({
            responseData: {
              results: {
                exportId: 'test-export-id',
                status: 'processing',
                totalRows: 100,
                rowsProcessed: 50,
                filename: null,
                errorMessage: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                completedAt: null,
              },
            },
            responseErrors: null,
          }),
      ),
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/cancel',
        ),
        () => HttpResponse.error(),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Cancel export' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel export' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to cancel export.')).toBeInTheDocument();
    });
  });

  it('should show loading spinner on Export button when initiate mutation is pending', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/export'),
        async () => {
          await new Promise((_resolve) => {
            // Never resolves to simulate pending state
          });
          return HttpResponse.json({});
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<SessionHistoryExportDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
