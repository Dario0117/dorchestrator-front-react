import { CommandPaletteTrigger } from '@components/ds/atoms/command-palette-trigger';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('CommandPaletteTrigger', () => {
  describe('rendering', () => {
    it('renders search buttons', () => {
      renderWithProviders(<CommandPaletteTrigger onClick={vi.fn()} />);
      const buttons = screen.getAllByRole('button', { name: 'Search' });
      expect(buttons.length).toBe(2);
    });
  });

  describe('interactions', () => {
    it('calls onClick when the mobile button is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<CommandPaletteTrigger onClick={onClick} />);

      const [mobileButton] = screen.getAllByRole('button', { name: 'Search' });
      await user.click(mobileButton as HTMLElement);

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls onClick when the desktop button is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<CommandPaletteTrigger onClick={onClick} />);

      const [, desktopButton] = screen.getAllByRole('button', {
        name: 'Search',
      });
      await user.click(desktopButton as HTMLElement);

      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
