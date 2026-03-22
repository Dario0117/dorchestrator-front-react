import { render, screen } from '@testing-library/react';
import { RouteErrorFallback } from './route-error-fallback';

describe('RouteErrorFallback', () => {
  const defaultProps = {
    pageTitle: 'Dashboard',
    errorTitle: 'Something went wrong',
    errorDescription: 'An unexpected error occurred.',
    reset: vi.fn(),
  };

  describe('rendering', () => {
    it('renders error title and description', () => {
      render(<RouteErrorFallback {...defaultProps} />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText('An unexpected error occurred.'),
      ).toBeInTheDocument();
    });

    it('renders try again button', () => {
      render(<RouteErrorFallback {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'Try again' }),
      ).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls reset when try again is clicked', () => {
      const resetFn = vi.fn();
      render(
        <RouteErrorFallback
          {...defaultProps}
          reset={resetFn}
        />,
      );
      screen.getByRole('button', { name: 'Try again' }).click();
      expect(resetFn).toHaveBeenCalledOnce();
    });
  });

  describe('semantic props', () => {
    it('accepts pageTitle prop', () => {
      render(
        <RouteErrorFallback
          {...defaultProps}
          pageTitle="Settings"
        />,
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
