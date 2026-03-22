import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('renders as an input element', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').tagName).toBe('INPUT');
    });
  });

  describe('semantic props', () => {
    it('accepts type prop', () => {
      render(
        <Input
          type="email"
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('accepts placeholder prop', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('accepts disabled prop', () => {
      render(
        <Input
          disabled
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeDisabled();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <Input
          data-testid="input"
          aria-label="test input"
        />,
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-label',
        'test input',
      );
    });
  });
});
