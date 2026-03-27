import { Output } from '@components/ds/atoms/output';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Output', () => {
  it('renders content', () => {
    renderWithProviders(<Output>Result: 42</Output>);
    expect(screen.getByText('Result: 42')).toBeInTheDocument();
  });

  it('renders as an output element (status role)', () => {
    renderWithProviders(<Output>value</Output>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  describe('variant', () => {
    it('defaults to inline variant', () => {
      const { container } = renderWithProviders(<Output>value</Output>);
      expect(container.firstChild).toHaveClass('px-2', 'text-sm');
    });

    it('applies status variant', () => {
      const { container } = renderWithProviders(
        <Output variant="status">value</Output>,
      );
      expect(container.firstChild).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });
  });

  it('spreads additional props', () => {
    renderWithProviders(<Output data-testid="out">value</Output>);
    expect(screen.getByTestId('out')).toBeInTheDocument();
  });
});
