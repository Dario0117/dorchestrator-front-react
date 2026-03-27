import { Skeleton } from '@components/ds/atoms/skeleton';
import { render, screen } from '@testing-library/react';

describe('Skeleton', () => {
  it('renders with data-testid', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('passes through non-className props', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        aria-label="Loading"
      />,
    );
    expect(screen.getByTestId('skeleton')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('renders children', () => {
    render(<Skeleton>Loading content</Skeleton>);
    expect(screen.getByText('Loading content')).toBeInTheDocument();
  });

  describe('dimensions', () => {
    it('applies width via inline style', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          w="200px"
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '200px' });
    });

    it('applies height via inline style', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          h="40px"
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '40px' });
    });

    it('applies both width and height', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          w="100px"
          h="50px"
        />,
      );
      const el = screen.getByTestId('skeleton');
      expect(el).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('does not apply width/height when not provided', () => {
      render(<Skeleton data-testid="skeleton" />);
      const el = screen.getByTestId('skeleton');
      expect(el.style.width).toBe('');
      expect(el.style.height).toBe('');
    });
  });

  describe('rounded', () => {
    it('applies rounded-md when rounded is true', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          rounded
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-md');
    });
  });

  describe('centered', () => {
    it('applies mx-auto when centered is true', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          centered
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveClass('mx-auto');
    });
  });

  describe('spacing', () => {
    it('applies mb-6 when spaceBelow is lg', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          spaceBelow="lg"
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveClass('mb-6');
    });

    it('applies mt-4 when spaceAbove is md', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          spaceAbove="md"
        />,
      );
      expect(screen.getByTestId('skeleton')).toHaveClass('mt-4');
    });
  });
});
