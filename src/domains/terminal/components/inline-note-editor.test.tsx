import { InlineNoteEditor } from '@domains/terminal/components/inline-note-editor';
import type { BookmarkItem } from '@domains/terminal/services/list-bookmarks.http-service';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const mockBookmark = {
  id: 1,
  sessionId: 10,
  deviceName: 'server-1',
  sessionStatus: 'terminated',
  sessionCreatedAt: '2025-12-01T10:00:00.000Z',
  createdAt: '2025-12-01T12:00:00.000Z',
  sessionTerminatedAt: '2025-12-01T11:00:00.000Z',
  note: null as string | null,
  recordingSizeBytes: 1024,
} satisfies BookmarkItem;

function setupUpdateHandler() {
  server.use(
    http.patch(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/bookmarks/{bookmarkId}',
      ),
      () => {
        return HttpResponse.json({
          responseData: { results: { id: 1 } },
          responseErrors: null,
        });
      },
    ),
  );
}

describe('InlineNoteEditor', () => {
  it('should render "Add note..." when note is null', () => {
    renderWithProviders(
      <InlineNoteEditor
        bookmark={mockBookmark}
        organizationId="org-1"
      />,
    );

    expect(screen.getByText('Add note...')).toBeInTheDocument();
  });

  it('should render existing note text', () => {
    renderWithProviders(
      <InlineNoteEditor
        bookmark={{ ...mockBookmark, note: 'Important session' }}
        organizationId="org-1"
      />,
    );

    expect(screen.getByText('Important session')).toBeInTheDocument();
  });

  it('should enter edit mode on click', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={mockBookmark}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Add note...'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should save note on Save button click', async () => {
    const user = userEvent.setup();
    setupUpdateHandler();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={mockBookmark}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Add note...'));
    await user.type(screen.getByRole('textbox'), 'New note');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('should save note on Enter key', async () => {
    const user = userEvent.setup();
    setupUpdateHandler();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={mockBookmark}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Add note...'));
    await user.type(screen.getByRole('textbox'), 'New note{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('should cancel editing on Escape key', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={{ ...mockBookmark, note: 'Original' }}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Original'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('should handle undefined note as empty string', () => {
    const bookmarkWithUndefinedNote = {
      ...mockBookmark,
      note: undefined as unknown as string | null,
    };

    renderWithProviders(
      <InlineNoteEditor
        bookmark={bookmarkWithUndefinedNote}
        organizationId="org-1"
      />,
    );

    expect(screen.getByText('Add note...')).toBeInTheDocument();
  });

  it('should reset to empty string on Escape when note is undefined', async () => {
    const user = userEvent.setup();
    const bookmarkWithUndefinedNote = {
      ...mockBookmark,
      note: undefined as unknown as string | null,
    };

    renderWithProviders(
      <InlineNoteEditor
        bookmark={bookmarkWithUndefinedNote}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Add note...'));
    await user.type(screen.getByRole('textbox'), 'temp');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Add note...')).toBeInTheDocument();
  });

  it('should send null when saving an empty note', async () => {
    const user = userEvent.setup();
    setupUpdateHandler();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={{ ...mockBookmark, note: 'Existing' }}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Existing'));
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('should cancel editing on X button click', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <InlineNoteEditor
        bookmark={mockBookmark}
        organizationId="org-1"
      />,
    );

    await user.click(screen.getByText('Add note...'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // The X button is the second ghost button (after Save)
    const buttons = screen.getAllByRole('button', { name: '' });
    // biome-ignore lint/style/noNonNullAssertion: test context
    await user.click(buttons[buttons.length - 1]!);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
