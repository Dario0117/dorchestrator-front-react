import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<Badge>text</Badge>);
      expect(screen.getByText('text').tagName).toBe('SPAN');
    });
  });

  describe('semantic props', () => {
    it('accepts variant prop', () => {
      render(<Badge variant="outline">outlined</Badge>);
      expect(screen.getByText('outlined')).toBeInTheDocument();
    });

    it('accepts colorScheme prop', () => {
      render(<Badge colorScheme="green">success</Badge>);
      expect(screen.getByText('success')).toBeInTheDocument();
    });

    it('accepts compact prop', () => {
      render(<Badge compact>3</Badge>);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('accepts multiple semantic props together', () => {
      render(
        <Badge
          variant="outline"
          colorScheme="blue"
          compact
        >
          info
        </Badge>,
      );
      expect(screen.getByText('info')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Badge data-testid="badge">text</Badge>);
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });
  });
});
