import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: 'Click me' }),
      ).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts variant prop', () => {
      render(<Button variant="outline">Outlined</Button>);
      expect(
        screen.getByRole('button', { name: 'Outlined' }),
      ).toBeInTheDocument();
    });

    it('accepts size prop', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument();
    });

    it('accepts disabled prop', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });

    it('accepts multiple semantic props together', () => {
      render(
        <Button
          variant="destructive"
          size="sm"
          disabled
        >
          Delete
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Button data-testid="custom-btn">text</Button>);
      expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
    });

    it('accepts type prop', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
        'type',
        'submit',
      );
    });

    it('accepts onClick handler', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      screen.getByRole('button', { name: 'Click' }).click();
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });
});
