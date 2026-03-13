import { FontSizeControls } from '@components/terminal/font-size-controls';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FontSizeControls', () => {
  it('should render font size value', () => {
    renderWithProviders(
      <FontSizeControls
        fontSize={14}
        onIncrease={vi.fn()}
        onDecrease={vi.fn()}
      />,
    );
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('should call onIncrease when increase button is clicked', async () => {
    const onIncrease = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <FontSizeControls
        fontSize={14}
        onIncrease={onIncrease}
        onDecrease={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Increase font size'));
    expect(onIncrease).toHaveBeenCalledOnce();
  });

  it('should call onDecrease when decrease button is clicked', async () => {
    const onDecrease = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <FontSizeControls
        fontSize={14}
        onIncrease={vi.fn()}
        onDecrease={onDecrease}
      />,
    );

    await user.click(screen.getByLabelText('Decrease font size'));
    expect(onDecrease).toHaveBeenCalledOnce();
  });

  it('should disable decrease button at min font size', () => {
    renderWithProviders(
      <FontSizeControls
        fontSize={10}
        onIncrease={vi.fn()}
        onDecrease={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Decrease font size')).toBeDisabled();
  });

  it('should disable increase button at max font size', () => {
    renderWithProviders(
      <FontSizeControls
        fontSize={24}
        onIncrease={vi.fn()}
        onDecrease={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Increase font size')).toBeDisabled();
  });

  it('should enable both buttons at intermediate font size', () => {
    renderWithProviders(
      <FontSizeControls
        fontSize={16}
        onIncrease={vi.fn()}
        onDecrease={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Decrease font size')).not.toBeDisabled();
    expect(screen.getByLabelText('Increase font size')).not.toBeDisabled();
  });
});
