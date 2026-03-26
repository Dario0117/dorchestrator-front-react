import { InsetPanel } from '@components/ds/atoms/inset-panel';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('InsetPanel', () => {
  describe('rendering', () => {
    it('renders children', () => {
      renderWithProviders(<InsetPanel>Panel content</InsetPanel>);
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts border prop', () => {
      renderWithProviders(
        <InsetPanel
          border="top"
          data-testid="panel"
        >
          Content
        </InsetPanel>,
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('accepts rounded prop', () => {
      renderWithProviders(
        <InsetPanel
          rounded="lg"
          data-testid="panel"
        >
          Content
        </InsetPanel>,
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('accepts innerSpace prop', () => {
      renderWithProviders(
        <InsetPanel
          innerSpace="lg"
          data-testid="panel"
        >
          Content
        </InsetPanel>,
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      renderWithProviders(
        <InsetPanel
          data-testid="panel"
          aria-label="test panel"
        >
          Content
        </InsetPanel>,
      );
      expect(screen.getByTestId('panel')).toHaveAttribute(
        'aria-label',
        'test panel',
      );
    });
  });
});
