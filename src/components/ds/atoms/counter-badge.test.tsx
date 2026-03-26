import { CounterBadge } from '@components/ds/atoms/counter-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('CounterBadge', () => {
  it('renders the count', () => {
    renderWithProviders(<CounterBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders 99+ for counts over 99', () => {
    renderWithProviders(<CounterBadge count={100} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders exact count of 99', () => {
    renderWithProviders(<CounterBadge count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('renders zero count', () => {
    renderWithProviders(<CounterBadge count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
