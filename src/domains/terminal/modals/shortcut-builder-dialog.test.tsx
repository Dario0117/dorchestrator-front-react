import { ShortcutBuilderDialog } from '@domains/terminal/modals/shortcut-builder-dialog';
import type { ShortcutItem } from '@domains/terminal/services/list-shortcuts.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onSave: vi.fn(),
  isSaving: false,
};

const editingShortcutSnippetAutoSend = {
  id: 1,
  label: 'List Files',
  keySequence: 'ls\n',
  mode: 'snippet' as const,
  color: null,
  icon: null,
  sortOrder: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
} satisfies ShortcutItem;

const editingShortcutKeystroke = {
  id: 2,
  label: 'Clear',
  keySequence: '\\x0c',
  mode: 'keystroke' as const,
  color: '#ff0000',
  icon: null,
  sortOrder: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
} satisfies ShortcutItem;

describe('ShortcutBuilderDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with create title when open', () => {
    renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

    expect(screen.getByText('Add Custom Shortcut')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a custom shortcut button for your terminal sessions.',
      ),
    ).toBeInTheDocument();
  });

  it('renders label input', () => {
    renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

    expect(screen.getByTestId('shortcut-label-input')).toBeInTheDocument();
  });

  it('renders mode buttons (Keystroke, Snippet)', () => {
    renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

    expect(screen.getByTestId('mode-keystroke-btn')).toBeInTheDocument();
    expect(screen.getByTestId('mode-snippet-btn')).toBeInTheDocument();
  });

  it('renders save button with "Add Shortcut" text', () => {
    renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /Add Shortcut/ }),
    ).toBeInTheDocument();
  });

  it('shows "Edit Shortcut" title when editingShortcut provided', () => {
    renderWithProviders(
      <ShortcutBuilderDialog
        {...defaultProps}
        editingShortcut={editingShortcutSnippetAutoSend}
      />,
    );

    expect(screen.getByText('Edit Shortcut')).toBeInTheDocument();
    expect(
      screen.getByText('Update your custom shortcut button.'),
    ).toBeInTheDocument();
  });

  it('shows "Save Changes" button when editing', () => {
    renderWithProviders(
      <ShortcutBuilderDialog
        {...defaultProps}
        editingShortcut={editingShortcutSnippetAutoSend}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Save Changes/ }),
    ).toBeInTheDocument();
  });

  it('disables save and cancel when isSaving', () => {
    renderWithProviders(
      <ShortcutBuilderDialog
        {...defaultProps}
        isSaving={true}
      />,
    );

    expect(screen.getByRole('button', { name: /Add Shortcut/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeDisabled();
  });

  it('does not render dialog when closed', () => {
    renderWithProviders(
      <ShortcutBuilderDialog
        {...defaultProps}
        open={false}
      />,
    );

    expect(screen.queryByText('Add Custom Shortcut')).not.toBeInTheDocument();
  });

  describe('label input', () => {
    it('allows typing in the label field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      const input = screen.getByTestId('shortcut-label-input');
      await user.type(input, 'My Shortcut');

      expect(input).toHaveValue('My Shortcut');
    });
  });

  describe('mode switching', () => {
    it('defaults to keystroke mode with appropriate description', () => {
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      expect(screen.getByTestId('mode-keystroke-btn')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(
        screen.getByText(/Sends a keyboard shortcut or escape sequence/),
      ).toBeInTheDocument();
    });

    it('switches to snippet mode when snippet button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByTestId('mode-snippet-btn'));

      expect(screen.getByTestId('mode-snippet-btn')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(
        screen.getByText(/Pastes the command text into the terminal/),
      ).toBeInTheDocument();
    });

    it('switches back to keystroke mode and disables autoSend', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Switch to snippet, enable auto-send
      await user.click(screen.getByTestId('mode-snippet-btn'));
      await user.click(screen.getByTestId('auto-send-toggle'));

      // Switch back to keystroke
      await user.click(screen.getByTestId('mode-keystroke-btn'));

      expect(screen.getByTestId('mode-keystroke-btn')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      // Auto-send section should be gone
      expect(screen.queryByTestId('auto-send-toggle')).not.toBeInTheDocument();
    });
  });

  describe('snippet mode', () => {
    it('shows snippet text input and auto-send toggle', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByTestId('mode-snippet-btn'));

      expect(screen.getByTestId('shortcut-sequence-input')).toBeInTheDocument();
      expect(screen.getByTestId('auto-send-toggle')).toBeInTheDocument();
    });

    it('allows typing in the snippet command input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByTestId('mode-snippet-btn'));
      const input = screen.getByTestId('shortcut-sequence-input');
      await user.type(input, 'docker ps');

      expect(input).toHaveValue('docker ps');
    });

    it('toggles auto-send on and off', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByTestId('mode-snippet-btn'));
      const toggle = screen.getByTestId('auto-send-toggle');

      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(toggle).toHaveTextContent('Off');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(toggle).toHaveTextContent('On');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(toggle).toHaveTextContent('Off');
    });
  });

  describe('keystroke mode', () => {
    it('shows placeholder text when no sequence built', () => {
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      expect(
        screen.getByText('Use the keys below to build a shortcut'),
      ).toBeInTheDocument();
    });

    it('shows key sequence composer', () => {
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      expect(screen.getByTestId('key-sequence-composer')).toBeInTheDocument();
    });

    it('builds and displays key sequence when keys are clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Click a key in the composer (e.g., "a")
      const keyA = screen.getByTestId('key-A');
      await user.click(keyA);

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(
        within(display).queryByText('Use the keys below to build a shortcut'),
      ).not.toBeInTheDocument();
    });

    it('clears key sequence when clear button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Build a sequence first
      await user.click(screen.getByTestId('key-A'));

      // Click clear
      const clearBtn = screen.getByTestId('clear-sequence-btn');
      await user.click(clearBtn);

      expect(
        screen.getByText('Use the keys below to build a shortcut'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('clear-sequence-btn'),
      ).not.toBeInTheDocument();
    });
  });

  describe('color input', () => {
    it('renders color picker and text input', () => {
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      expect(screen.getByTestId('shortcut-color-input')).toBeInTheDocument();
    });

    it('allows changing color via text input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Find the color text input (the one with placeholder #6366f1)
      const colorTextInput = screen.getByPlaceholderText('#6366f1');
      await user.type(colorTextInput, '#00ff00');

      expect(colorTextInput).toHaveValue('#00ff00');
    });

    it('allows changing color via color picker', () => {
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      const colorPicker = screen.getByTestId('shortcut-color-input');
      fireEvent.change(colorPicker, { target: { value: '#0000ff' } });

      // The color text input should reflect the change
      const colorTextInput = screen.getByPlaceholderText('#6366f1');
      expect(colorTextInput).toHaveValue('#0000ff');
    });

    it('shows clear button when color is set and clears it', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Set a color first via the text input
      const colorTextInput = screen.getByPlaceholderText('#6366f1');
      await user.type(colorTextInput, '#ff0000');
      expect(colorTextInput).toHaveValue('#ff0000');

      // Now a Clear button for color should appear
      const clearButtons = screen.getAllByRole('button', { name: 'Clear' });
      const colorClearBtn = clearButtons[
        clearButtons.length - 1
      ] as HTMLElement;
      await user.click(colorClearBtn);

      expect(colorTextInput).toHaveValue('');
    });
  });

  describe('form validation and submission', () => {
    it('shows error when label is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(screen.getByRole('alert')).toHaveTextContent('Label is required');
    });

    it('shows error when label exceeds 30 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      const input = screen.getByTestId('shortcut-label-input');
      // Use fireEvent.change to bypass maxLength DOM attribute
      fireEvent.change(input, { target: { value: 'a'.repeat(31) } });

      await user.click(screen.getByTestId('key-A'));

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Label must be at most 30 characters',
      );
    });

    it('shows error when key sequence exceeds 100 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.type(screen.getByTestId('shortcut-label-input'), 'Test');

      // Switch to snippet mode so we can directly set sequence via input
      await user.click(screen.getByTestId('mode-snippet-btn'));
      const seqInput = screen.getByTestId('shortcut-sequence-input');
      fireEvent.change(seqInput, { target: { value: 'x'.repeat(101) } });

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Key sequence must be at most 100 characters',
      );
    });

    it('shows error when key sequence is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      const input = screen.getByTestId('shortcut-label-input');
      await user.type(input, 'Test');

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Key sequence is required',
      );
    });

    it('calls onSave with correct data for keystroke mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.type(screen.getByTestId('shortcut-label-input'), 'MyKey');
      await user.click(screen.getByTestId('key-A'));

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'MyKey',
          mode: 'keystroke',
          color: null,
        }),
      );
    });

    it('calls onSave with auto-send newline appended in snippet mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.type(screen.getByTestId('shortcut-label-input'), 'Docker');
      await user.click(screen.getByTestId('mode-snippet-btn'));
      await user.type(
        screen.getByTestId('shortcut-sequence-input'),
        'docker ps',
      );
      await user.click(screen.getByTestId('auto-send-toggle'));

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Docker',
          keySequence: 'docker ps\n',
          mode: 'snippet',
        }),
      );
    });

    it('calls onSave without newline in snippet mode when auto-send is off', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.type(screen.getByTestId('shortcut-label-input'), 'Docker');
      await user.click(screen.getByTestId('mode-snippet-btn'));
      await user.type(
        screen.getByTestId('shortcut-sequence-input'),
        'docker ps',
      );

      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          keySequence: 'docker ps',
          mode: 'snippet',
          color: null,
        }),
      );
    });

    it('passes color when set', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: 'a',
          }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#ff0000',
          sortOrder: 1,
        }),
      );
    });

    it('clears error on successful validation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      // Trigger error first
      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Now fill in valid data
      await user.type(screen.getByTestId('shortcut-label-input'), 'Valid');
      await user.click(screen.getByTestId('key-A'));
      await user.click(screen.getByRole('button', { name: /Add Shortcut/ }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('editing shortcut', () => {
    it('populates fields from editing shortcut (snippet with auto-send)', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={editingShortcutSnippetAutoSend}
        />,
      );

      expect(screen.getByTestId('shortcut-label-input')).toHaveValue(
        'List Files',
      );
      expect(screen.getByTestId('mode-snippet-btn')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByTestId('auto-send-toggle')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      // Key sequence should be stripped of trailing \n
      expect(screen.getByTestId('shortcut-sequence-input')).toHaveValue('ls');
    });

    it('populates fields from editing shortcut (keystroke with color)', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={editingShortcutKeystroke}
        />,
      );

      expect(screen.getByTestId('shortcut-label-input')).toHaveValue('Clear');
      expect(screen.getByTestId('mode-keystroke-btn')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('populates snippet shortcut without auto-send when no trailing newline', () => {
      const snippetNoAutoSend: ShortcutItem = {
        ...editingShortcutSnippetAutoSend,
        keySequence: 'ls -la',
      };
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={snippetNoAutoSend}
        />,
      );

      expect(screen.getByTestId('shortcut-sequence-input')).toHaveValue(
        'ls -la',
      );
      expect(screen.getByTestId('auto-send-toggle')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  });

  describe('cancel button', () => {
    it('calls onOpenChange(false) when cancel clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Cancel/ }));

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('button preview', () => {
    it('shows button preview when both label and sequence are filled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.type(screen.getByTestId('shortcut-label-input'), 'Test');
      await user.click(screen.getByTestId('key-A'));

      expect(screen.getByText('Button preview:')).toBeInTheDocument();
    });

    it('does not show preview when label is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShortcutBuilderDialog {...defaultProps} />);

      await user.click(screen.getByTestId('key-A'));

      expect(screen.queryByText('Button preview:')).not.toBeInTheDocument();
    });
  });

  describe('parseSequenceForPreview', () => {
    it('renders \\n as return symbol in keystroke display', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: '\\n',
          }}
        />,
      );

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(within(display).getByText('↵')).toBeInTheDocument();
    });

    it('renders \\t as tab symbol in keystroke display', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: '\\t',
          }}
        />,
      );

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(within(display).getByText('⇥')).toBeInTheDocument();
    });

    it('renders \\x1b as Esc in keystroke display', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: '\\x1b',
          }}
        />,
      );

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(within(display).getByText('Esc')).toBeInTheDocument();
    });

    it('renders control character hex codes (\\x01-\\x1a) as ^Letter', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: '\\x03',
          }}
        />,
      );

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(within(display).getByText('^C')).toBeInTheDocument();
    });

    it('renders non-control hex codes as ^HEX', () => {
      renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          editingShortcut={{
            ...editingShortcutKeystroke,
            keySequence: '\\x7f',
          }}
        />,
      );

      const display = screen.getByTestId('shortcut-sequence-display');
      expect(within(display).getByText('^7f')).toBeInTheDocument();
    });
  });

  describe('state reset on open', () => {
    it('resets fields when dialog opens without editingShortcut', () => {
      const { rerender } = renderWithProviders(
        <ShortcutBuilderDialog
          {...defaultProps}
          open={false}
        />,
      );

      rerender(
        <ShortcutBuilderDialog
          {...defaultProps}
          open={true}
        />,
      );

      expect(screen.getByTestId('shortcut-label-input')).toHaveValue('');
    });
  });
});
