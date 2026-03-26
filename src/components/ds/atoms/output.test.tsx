import { Output } from '@components/ds/atoms/output';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Output', () => {
  it('renders content', () => {
    renderWithProviders(<Output>Result: 42</Output>);
    expect(screen.getByText('Result: 42')).toBeInTheDocument();
  });

  it('renders as an output element', () => {
    renderWithProviders(<Output>value</Output>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
