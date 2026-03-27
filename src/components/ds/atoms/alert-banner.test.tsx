import { render, screen } from '@testing-library/react';
import { AlertBanner } from './alert-banner';

describe('AlertBanner', () => {
  it('renders children', () => {
    render(<AlertBanner>Something went wrong</AlertBanner>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  describe('variant', () => {
    it('defaults to destructive variant', () => {
      render(<AlertBanner data-testid="banner">Error</AlertBanner>);
      expect(screen.getByTestId('banner')).toHaveClass(
        'bg-destructive/10',
        'text-destructive',
      );
    });

    it('applies warning variant', () => {
      render(
        <AlertBanner
          data-testid="banner"
          variant="warning"
        >
          Caution
        </AlertBanner>,
      );
      expect(screen.getByTestId('banner')).toHaveClass(
        'bg-warning/10',
        'text-warning',
      );
    });
  });

  describe('inline', () => {
    it('applies rounded-md by default (non-inline)', () => {
      render(<AlertBanner data-testid="banner">Alert</AlertBanner>);
      expect(screen.getByTestId('banner')).toHaveClass('rounded-md');
    });

    it('applies inline styling when inline is true', () => {
      render(
        <AlertBanner
          data-testid="banner"
          inline
        >
          Inline alert
        </AlertBanner>,
      );
      const el = screen.getByTestId('banner');
      expect(el).toHaveClass('text-center', 'shrink-0');
      expect(el).not.toHaveClass('rounded-md');
    });
  });

  it('spreads additional props', () => {
    render(<AlertBanner data-testid="alert-banner">Content</AlertBanner>);
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
  });
});
