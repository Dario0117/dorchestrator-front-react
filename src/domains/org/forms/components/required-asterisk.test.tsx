import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { RequiredAsterisk } from './required-asterisk';

describe('RequiredAsterisk', () => {
  it('renders an asterisk', () => {
    renderWithProviders(<RequiredAsterisk />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
