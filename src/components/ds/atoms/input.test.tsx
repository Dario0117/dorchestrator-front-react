import { Input } from '@components/ds/atoms/input';
import { render, screen } from '@testing-library/react';

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

  describe('ds props', () => {
    it('accepts font="mono"', () => {
      render(
        <Input
          font="mono"
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts inputSize="xs"', () => {
      render(
        <Input
          inputSize="xs"
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts inputSize="sm"', () => {
      render(
        <Input
          inputSize="sm"
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts fullWidth={false}', () => {
      render(
        <Input
          fullWidth={false}
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts padding="search"', () => {
      render(
        <Input
          padding="search"
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(
        <Input
          grow
          data-testid="input"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('accepts colorPicker', () => {
      render(
        <Input
          colorPicker
          data-testid="input"
          type="color"
        />,
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
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
