import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClickableArea } from './clickable-area';

describe('ClickableArea', () => {
  describe('rendering', () => {
    it('renders as a button', () => {
      render(<ClickableArea>Click me</ClickableArea>);
      expect(
        screen.getByRole('button', { name: 'Click me' }),
      ).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('renders with rounded prop', () => {
      render(<ClickableArea rounded>Rounded</ClickableArea>);
      expect(
        screen.getByRole('button', { name: 'Rounded' }),
      ).toBeInTheDocument();
    });

    it('renders without rounded prop', () => {
      render(<ClickableArea rounded={false}>Not rounded</ClickableArea>);
      expect(
        screen.getByRole('button', { name: 'Not rounded' }),
      ).toBeInTheDocument();
    });

    it('renders with a size prop', () => {
      render(<ClickableArea size="md">Sized</ClickableArea>);
      expect(screen.getByRole('button', { name: 'Sized' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ClickableArea onClick={onClick}>Clickable</ClickableArea>);

      await user.click(screen.getByRole('button', { name: 'Clickable' }));
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe('additional props', () => {
    it('supports disabled state', () => {
      render(<ClickableArea disabled>Disabled</ClickableArea>);
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });
  });
});
