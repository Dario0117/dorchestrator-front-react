import { render, screen } from '@testing-library/react';
import { AlertBanner } from './alert-banner';

describe('AlertBanner', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<AlertBanner>Something went wrong</AlertBanner>);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('renders with warning variant', () => {
      render(<AlertBanner variant="warning">Caution</AlertBanner>);
      expect(screen.getByText('Caution')).toBeInTheDocument();
    });

    it('renders in inline mode', () => {
      render(<AlertBanner inline>Inline alert</AlertBanner>);
      expect(screen.getByText('Inline alert')).toBeInTheDocument();
    });

    it('renders in non-inline mode by default', () => {
      render(<AlertBanner>Default alert</AlertBanner>);
      expect(screen.getByText('Default alert')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<AlertBanner data-testid="alert-banner">Content</AlertBanner>);
      expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
    });
  });
});
