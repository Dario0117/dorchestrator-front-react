import { queryClient } from '@domains/shared/context/query.provider';
import { SuggestionNotificationPanel } from '@domains/terminal/components/suggestion-notification-panel';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const suggestionsWithData = http.get(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
  ),
  () =>
    HttpResponse.json({
      responseData: {
        results: [
          {
            id: 1,
            suggesterName: 'Alice',
            suggestionText: 'ls -la',
            response: 'pending',
          },
          {
            id: 2,
            suggesterName: 'Bob',
            suggestionText: 'pwd',
            response: 'accepted',
          },
          {
            id: 3,
            suggesterName: 'Charlie',
            suggestionText: 'whoami',
            response: 'dismissed',
          },
        ],
        hasNext: false,
        hasPrevious: false,
        totalResults: 3,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    }),
);

describe('SuggestionNotificationPanel', () => {
  const defaultProps = {
    sessionId: '42',
    organizationId: 'org-1',
  };

  it('renders null when no suggestions', async () => {
    const { container } = renderWithProviders(
      <SuggestionNotificationPanel {...defaultProps} />,
    );

    // The default handler returns empty results, so the component returns null
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders suggestions when data available', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('pwd')).toBeInTheDocument();
  });

  it('shows pending count badge', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    // Wait for data to load, then check badge with count "1" (one pending)
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('shows accept and dismiss buttons for pending suggestions', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    expect(
      await screen.findByRole('button', { name: 'Accept and paste' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('shows Accepted badge for accepted suggestions', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    expect(await screen.findByText('Accepted')).toBeInTheDocument();
  });

  it('shows Dismissed badge for dismissed suggestions', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    expect(await screen.findByText('Dismissed')).toBeInTheDocument();
  });

  it('shows refresh button', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    expect(
      await screen.findByRole('button', { name: 'Refresh suggestions' }),
    ).toBeInTheDocument();
  });

  it('calls invalidateQueries when refresh button is clicked', async () => {
    server.use(suggestionsWithData);
    const user = userEvent.setup();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    const refreshButton = await screen.findByRole('button', {
      name: 'Refresh suggestions',
    });
    await user.click(refreshButton);

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [
        'get',
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
      ],
    });

    invalidateSpy.mockRestore();
  });

  it('calls respond mutation with accept when accept button is clicked', async () => {
    server.use(suggestionsWithData);
    const user = userEvent.setup();

    let capturedBody: unknown;
    let capturedParams: unknown;
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions/{suggestionId}/respond',
        ),
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedParams = params;
          return HttpResponse.json({
            responseData: { results: [] },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    const acceptButton = await screen.findByRole('button', {
      name: 'Accept and paste',
    });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(capturedBody).toEqual({ action: 'accept' });
    });
    expect(capturedParams).toEqual(
      expect.objectContaining({
        organizationId: 'org-1',
        sessionId: '42',
        suggestionId: '1',
      }),
    );
  });

  it('calls respond mutation with dismiss when dismiss button is clicked', async () => {
    server.use(suggestionsWithData);
    const user = userEvent.setup();

    let capturedBody: unknown;
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions/{suggestionId}/respond',
        ),
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            responseData: { results: [] },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    const dismissButton = await screen.findByRole('button', {
      name: 'Dismiss',
    });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(capturedBody).toEqual({ action: 'dismiss' });
    });
  });

  it('invalidates suggestions on successful respond mutation', async () => {
    server.use(suggestionsWithData);
    const user = userEvent.setup();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    const acceptButton = await screen.findByRole('button', {
      name: 'Accept and paste',
    });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [
          'get',
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
        ],
      });
    });

    invalidateSpy.mockRestore();
  });

  it('subscribes to suggestion:notify WS messages and invalidates on matching sessionId', async () => {
    server.use(suggestionsWithData);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Capture the handler registered with onMessage
    let capturedHandler: ((msg: { sessionId: string }) => void) | undefined;
    const unsubscribeFn = vi.fn();
    const onMessageSpy = vi
      .spyOn(terminalWsClient, 'onMessage')
      .mockImplementation((_type, handler) => {
        capturedHandler = handler as (msg: { sessionId: string }) => void;
        return unsubscribeFn;
      });

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    await screen.findByText('Alice');

    // Simulate WS message with matching sessionId
    expect(capturedHandler).toBeDefined();
    capturedHandler?.({ sessionId: '42' });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [
        'get',
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
      ],
    });

    invalidateSpy.mockRestore();
    onMessageSpy.mockRestore();
  });

  it('does not invalidate on suggestion:notify WS message with non-matching sessionId', async () => {
    server.use(suggestionsWithData);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    let capturedHandler: ((msg: { sessionId: string }) => void) | undefined;
    const unsubscribeFn = vi.fn();
    const onMessageSpy = vi
      .spyOn(terminalWsClient, 'onMessage')
      .mockImplementation((_type, handler) => {
        capturedHandler = handler as (msg: { sessionId: string }) => void;
        return unsubscribeFn;
      });

    renderWithProviders(<SuggestionNotificationPanel {...defaultProps} />);

    await screen.findByText('Alice');

    // Clear any invalidation calls from initial render
    invalidateSpy.mockClear();

    // Simulate WS message with different sessionId
    capturedHandler?.({ sessionId: 'different-session' });

    expect(invalidateSpy).not.toHaveBeenCalled();

    invalidateSpy.mockRestore();
    onMessageSpy.mockRestore();
  });

  it('unsubscribes from WS messages on unmount', async () => {
    server.use(suggestionsWithData);

    const unsubscribeFn = vi.fn();
    const onMessageSpy = vi
      .spyOn(terminalWsClient, 'onMessage')
      .mockImplementation(() => unsubscribeFn);

    const { unmount } = renderWithProviders(
      <SuggestionNotificationPanel {...defaultProps} />,
    );

    await screen.findByText('Alice');

    unmount();

    expect(unsubscribeFn).toHaveBeenCalled();

    onMessageSpy.mockRestore();
  });
});
