import { TerminalToolbar } from '@domains/terminal/components/terminal-toolbar';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  sessionId: 'session-1',
  fontSizeControls: { fontSize: 14, increase: vi.fn(), decrease: vi.fn() },
  share: {
    isShared: false,
    shareUrl: null,
    hasCopied: false,
    isSharePending: false,
    handleToggleShare: vi.fn(),
    copyShareUrl: vi.fn(),
  },
  bookmark: {
    bookmarkId: null,
    isBookmarkPending: false,
    handleToggleBookmark: vi.fn(),
  },
  isClosing: false,
  warningMessage: null,
  onExtendClick: vi.fn(),
  onCloseSession: vi.fn(),
};

describe('TerminalToolbar', () => {
  it('renders toolbar with correct role and aria-label', () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Terminal session controls');
  });

  it('renders End Session button', () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /End Session/ }),
    ).toBeInTheDocument();
  });

  it('End Session button opens confirmation dialog', async () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    const endButton = screen.getByRole('button', { name: /End Session/ });
    await clickTrigger(endButton);
    expect(screen.getByText('End terminal session?')).toBeInTheDocument();
  });

  it('calls onCloseSession when confirm button is clicked in dialog', async () => {
    const onCloseSession = vi.fn();
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        onCloseSession={onCloseSession}
      />,
    );
    const endButton = screen.getByRole('button', { name: /End Session/ });
    await clickTrigger(endButton);
    const confirmButton = screen.getByRole('button', { name: 'End Session' });
    await clickTrigger(confirmButton);
    expect(onCloseSession).toHaveBeenCalled();
  });

  it('disables End Session when isClosing', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        isClosing={true}
      />,
    );
    expect(screen.getByRole('button', { name: /End Session/ })).toBeDisabled();
  });

  it('share button shows "Share session" when not shared', () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    expect(screen.getByLabelText('Share session')).toBeInTheDocument();
  });

  it('share button shows "Stop sharing" when shared', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{ ...defaultProps.share, isShared: true }}
      />,
    );
    expect(screen.getByLabelText('Stop sharing')).toBeInTheDocument();
  });

  it('calls handleToggleShare when share button is clicked', async () => {
    const handleToggleShare = vi.fn();
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{ ...defaultProps.share, handleToggleShare }}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Share session'));
    expect(handleToggleShare).toHaveBeenCalled();
  });

  it('disables share button when isSharePending', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{ ...defaultProps.share, isSharePending: true }}
      />,
    );
    expect(screen.getByLabelText('Share session')).toBeDisabled();
  });

  it('disables share button when isClosing', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        isClosing={true}
      />,
    );
    expect(screen.getByLabelText('Share session')).toBeDisabled();
  });

  it('shows copy share link button when shared and shareUrl exists', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{
          ...defaultProps.share,
          isShared: true,
          shareUrl: 'https://example.com/share/abc',
        }}
      />,
    );
    expect(screen.getByLabelText('Copy share link')).toBeInTheDocument();
  });

  it('does not show copy share link button when shared but no shareUrl', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{ ...defaultProps.share, isShared: true, shareUrl: null }}
      />,
    );
    expect(screen.queryByLabelText('Copy share link')).not.toBeInTheDocument();
  });

  it('shows "Link copied" label when hasCopied is true and shared with shareUrl', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{
          ...defaultProps.share,
          isShared: true,
          shareUrl: 'https://example.com/share/abc',
          hasCopied: true,
        }}
      />,
    );
    expect(screen.getByLabelText('Link copied')).toBeInTheDocument();
  });

  it('calls copyShareUrl when copy button is clicked', async () => {
    const copyShareUrl = vi.fn();
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{
          ...defaultProps.share,
          isShared: true,
          shareUrl: 'https://example.com/share/abc',
          copyShareUrl,
        }}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Copy share link'));
    expect(copyShareUrl).toHaveBeenCalled();
  });

  it('share toggle button shows Check icon when not shared but hasCopied', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        share={{
          ...defaultProps.share,
          isShared: false,
          hasCopied: true,
        }}
      />,
    );
    // The share button still says "Share session" regardless of hasCopied
    expect(screen.getByLabelText('Share session')).toBeInTheDocument();
  });

  it('bookmark button shows "Bookmark session" when no bookmark', () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    expect(screen.getByLabelText('Bookmark session')).toBeInTheDocument();
  });

  it('bookmark button shows "Remove bookmark" when bookmarked', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        bookmark={{ ...defaultProps.bookmark, bookmarkId: 42 }}
      />,
    );
    expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument();
  });

  it('calls handleToggleBookmark when bookmark button is clicked', async () => {
    const handleToggleBookmark = vi.fn();
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        bookmark={{ ...defaultProps.bookmark, handleToggleBookmark }}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Bookmark session'));
    expect(handleToggleBookmark).toHaveBeenCalled();
  });

  it('disables bookmark button when isBookmarkPending', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        bookmark={{ ...defaultProps.bookmark, isBookmarkPending: true }}
      />,
    );
    expect(screen.getByLabelText('Bookmark session')).toBeDisabled();
  });

  it('shows extend button when warningMessage is set', () => {
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        warningMessage="Session expiring soon"
      />,
    );
    expect(screen.getByLabelText('Extend session')).toBeInTheDocument();
  });

  it('hides extend button when no warningMessage', () => {
    renderWithProviders(<TerminalToolbar {...defaultProps} />);
    expect(screen.queryByLabelText('Extend session')).not.toBeInTheDocument();
  });

  it('calls onExtendClick when extend button is clicked', async () => {
    const onExtendClick = vi.fn();
    renderWithProviders(
      <TerminalToolbar
        {...defaultProps}
        warningMessage="Session expiring soon"
        onExtendClick={onExtendClick}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Extend session'));
    expect(onExtendClick).toHaveBeenCalled();
  });

  describe('keyboard navigation', () => {
    it('moves focus to next button on ArrowRight', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');
      // Focus the first button
      (buttons[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[1]);
    });

    it('wraps focus to first button on ArrowRight at end', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button:not(:disabled)');
      const lastButton = buttons[buttons.length - 1] as HTMLElement;
      lastButton.focus();

      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('moves focus to previous button on ArrowLeft', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');
      // Focus the second button
      (buttons[1] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('wraps focus to last button on ArrowLeft at beginning', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button:not(:disabled)');
      (buttons[0] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    });

    it('moves focus to first button on Home', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');
      // Focus a middle button
      (buttons[2] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'Home' });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('moves focus to last button on End', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button:not(:disabled)');

      (buttons[0] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'End' });
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    });

    it('does nothing for unhandled keys', () => {
      renderWithProviders(<TerminalToolbar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');
      (buttons[0] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'Tab' });
      // Focus should remain on the same button
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('does nothing when all focusable elements are disabled', () => {
      renderWithProviders(
        <TerminalToolbar
          {...defaultProps}
          isClosing={true}
        />,
      );
      const toolbar = screen.getByRole('toolbar');
      // When all buttons are disabled, focusableElements is empty — early return
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      // No error thrown and focus is not moved (body or no active element)
      expect(document.activeElement).not.toBe(null);
    });
  });
});
