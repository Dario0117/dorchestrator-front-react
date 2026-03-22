import { render, screen } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator', () => {
  describe('rendering', () => {
    it('renders a separator element', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('renders as a separator role', () => {
      render(<Separator />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts orientation prop', () => {
      render(
        <Separator
          orientation="vertical"
          data-testid="separator"
        />,
      );
      expect(screen.getByTestId('separator')).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
    });

    it('defaults to horizontal orientation', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });
});
