import { Well } from '@components/ds/atoms/well';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Well', () => {
  it('renders children', () => {
    renderWithProviders(<Well>Well content</Well>);
    expect(screen.getByText('Well content')).toBeInTheDocument();
  });

  describe('padding', () => {
    it('defaults to md padding', () => {
      const { container } = renderWithProviders(<Well>content</Well>);
      expect(container.firstChild).toHaveClass('p-4');
    });

    it('applies sm padding', () => {
      const { container } = renderWithProviders(
        <Well padding="sm">content</Well>,
      );
      expect(container.firstChild).toHaveClass('p-2');
    });

    it('applies lg padding', () => {
      const { container } = renderWithProviders(
        <Well padding="lg">content</Well>,
      );
      expect(container.firstChild).toHaveClass('p-6');
    });
  });

  describe('translucent', () => {
    it('applies muted translucent background', () => {
      const { container } = renderWithProviders(
        <Well translucent="muted">content</Well>,
      );
      expect(container.firstChild).toHaveClass('bg-muted/30');
    });

    it('applies primary translucent background', () => {
      const { container } = renderWithProviders(
        <Well translucent="primary">content</Well>,
      );
      expect(container.firstChild).toHaveClass('bg-primary/10');
    });

    it('applies destructive translucent background', () => {
      const { container } = renderWithProviders(
        <Well translucent="destructive">content</Well>,
      );
      expect(container.firstChild).toHaveClass('bg-destructive/10');
    });
  });

  it('applies bg class when bg prop is provided', () => {
    const { container } = renderWithProviders(<Well bg="muted">content</Well>);
    expect(container.firstChild).toHaveClass('bg-muted');
  });

  it('spreads additional props', () => {
    renderWithProviders(<Well data-testid="well">content</Well>);
    expect(screen.getByTestId('well')).toBeInTheDocument();
  });
});
