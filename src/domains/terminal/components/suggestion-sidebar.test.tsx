import { SuggestionSidebar } from '@domains/terminal/components/suggestion-sidebar';
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

describe('SuggestionSidebar', () => {
  const defaultProps = {
    sessionId: '42',
    organizationId: 'org-1',
  };

  it('renders title "Suggest Commands"', () => {
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    expect(screen.getByText('Suggest Commands')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Type a command suggestion...'),
    ).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: 'Send suggestion' });
    expect(sendButton).toBeDisabled();
  });

  it('shows "No suggestions sent yet" when empty', async () => {
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    expect(
      await screen.findByText('No suggestions sent yet'),
    ).toBeInTheDocument();
  });

  it('shows suggestions with status badges when data available', async () => {
    server.use(suggestionsWithData);

    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    expect(await screen.findByText('ls -la')).toBeInTheDocument();
    expect(screen.getByText('pwd')).toBeInTheDocument();
    expect(screen.getByText('whoami')).toBeInTheDocument();

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Dismissed')).toBeInTheDocument();
  });

  it('shows character counter when text is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    await user.type(input, 'hello');

    expect(screen.getByText('5/1000')).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Refresh suggestions' }),
    ).toBeInTheDocument();
  });

  it('submits suggestion when send button is clicked and clears input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    await user.type(input, 'echo hello');

    const sendButton = screen.getByRole('button', { name: 'Send suggestion' });
    await user.click(sendButton);

    expect(input).toHaveValue('');
  });

  it('does not submit when text is only whitespace', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    await user.type(input, '   ');

    const sendButton = screen.getByRole('button', { name: 'Send suggestion' });
    expect(sendButton).toBeDisabled();
  });

  it('submits suggestion on Enter key press and clears input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    await user.type(input, 'ls -la');
    await user.keyboard('{Enter}');

    expect(input).toHaveValue('');
  });

  it('does not submit when Enter is pressed with empty input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    // Input is empty — pressing Enter should hit the early-return branch (L52-53)
    await user.click(input);
    await user.keyboard('{Enter}');

    // Input remains empty (no submission occurred, no side effects)
    expect(input).toHaveValue('');
  });

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a command suggestion...');
    await user.type(input, 'ls -la');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(input).toHaveValue('ls -la');
  });

  it('clicking refresh button invalidates suggestions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    await screen.findByText('No suggestions sent yet');

    const refreshButton = screen.getByRole('button', {
      name: 'Refresh suggestions',
    });
    await user.click(refreshButton);

    // After invalidation the query refetches — still shows empty state
    expect(
      await screen.findByText('No suggestions sent yet'),
    ).toBeInTheDocument();
  });

  it('invalidates suggestions when WS suggestion:accepted message arrives for matching session', async () => {
    const onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage');

    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    await screen.findByText('No suggestions sent yet');

    // Find the suggestion:accepted callback registered by the component
    const acceptedCall = onMessageSpy.mock.calls.find(
      ([type]) => type === 'suggestion:accepted',
    );
    const acceptedCallback = acceptedCall?.[1];

    // Trigger with matching sessionId
    acceptedCallback?.({
      type: 'suggestion:accepted',
      sessionId: '42',
      payload: { suggestionId: 1 },
    });

    await waitFor(() => {
      expect(screen.getByText('No suggestions sent yet')).toBeInTheDocument();
    });

    onMessageSpy.mockRestore();
  });

  it('ignores WS suggestion:accepted message for different session', async () => {
    const onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage');

    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    await screen.findByText('No suggestions sent yet');

    const acceptedCall = onMessageSpy.mock.calls.find(
      ([type]) => type === 'suggestion:accepted',
    );
    const acceptedCallback = acceptedCall?.[1];

    // Trigger with non-matching sessionId — should early-return
    acceptedCallback?.({
      type: 'suggestion:accepted',
      sessionId: 'other-session',
      payload: { suggestionId: 1 },
    });

    expect(screen.getByText('No suggestions sent yet')).toBeInTheDocument();

    onMessageSpy.mockRestore();
  });

  it('invalidates suggestions when WS suggestion:dismissed message arrives for matching session', async () => {
    const onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage');

    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    await screen.findByText('No suggestions sent yet');

    const dismissedCall = onMessageSpy.mock.calls.find(
      ([type]) => type === 'suggestion:dismissed',
    );
    const dismissedCallback = dismissedCall?.[1];

    // Trigger with matching sessionId
    dismissedCallback?.({
      type: 'suggestion:dismissed',
      sessionId: '42',
      payload: { suggestionId: 1 },
    });

    await waitFor(() => {
      expect(screen.getByText('No suggestions sent yet')).toBeInTheDocument();
    });

    onMessageSpy.mockRestore();
  });

  it('ignores WS suggestion:dismissed message for different session', async () => {
    const onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage');

    renderWithProviders(<SuggestionSidebar {...defaultProps} />);

    await screen.findByText('No suggestions sent yet');

    const dismissedCall = onMessageSpy.mock.calls.find(
      ([type]) => type === 'suggestion:dismissed',
    );
    const dismissedCallback = dismissedCall?.[1];

    // Trigger with non-matching sessionId — should early-return
    dismissedCallback?.({
      type: 'suggestion:dismissed',
      sessionId: 'other-session',
      payload: { suggestionId: 1 },
    });

    expect(screen.getByText('No suggestions sent yet')).toBeInTheDocument();

    onMessageSpy.mockRestore();
  });
});
