import { KeySequenceComposer } from '@domains/terminal/components/key-sequence-composer';
import {
  buildKeySequence,
  KEY_CATEGORIES,
  KEY_DEFINITIONS,
} from '@lib/terminal-key-sequence.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('KeySequenceComposer', () => {
  const defaultOnInsert = vi.fn();

  beforeEach(() => {
    defaultOnInsert.mockClear();
  });

  it('renders modifier buttons (Ctrl, Shift, Alt)', () => {
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    expect(screen.getByTestId('mod-ctrl')).toBeInTheDocument();
    expect(screen.getByTestId('mod-shift')).toBeInTheDocument();
    expect(screen.getByTestId('mod-alt')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    for (const { id } of KEY_CATEGORIES) {
      expect(screen.getByTestId(`category-${id}`)).toBeInTheDocument();
    }
  });

  it('renders key buttons for default category (letters)', () => {
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    const letterKeys = KEY_DEFINITIONS.filter((k) => k.category === 'letters');
    for (const keyDef of letterKeys) {
      expect(screen.getByTestId(`key-${keyDef.key}`)).toBeInTheDocument();
    }
  });

  it('toggles modifier on click (aria-pressed changes)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    const ctrlButton = screen.getByTestId('mod-ctrl');
    expect(ctrlButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(ctrlButton);
    expect(ctrlButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(ctrlButton);
    expect(ctrlButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches category on tab click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    await user.click(screen.getByTestId('category-arrows'));

    const arrowKeys = KEY_DEFINITIONS.filter((k) => k.category === 'arrows');
    for (const keyDef of arrowKeys) {
      expect(screen.getByTestId(`key-${keyDef.key}`)).toBeInTheDocument();
    }

    // Letters should no longer be rendered
    expect(screen.queryByTestId('key-A')).not.toBeInTheDocument();
  });

  it('calls onInsert when key button clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KeySequenceComposer onInsert={defaultOnInsert} />);

    await user.click(screen.getByTestId('key-A'));

    const expectedSequence = buildKeySequence('A', {
      ctrl: false,
      shift: false,
      alt: false,
    });
    expect(defaultOnInsert).toHaveBeenCalledWith(expectedSequence);
  });
});
