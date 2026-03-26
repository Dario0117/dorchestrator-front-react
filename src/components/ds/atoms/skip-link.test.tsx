import { SkipLink } from '@components/ds/atoms/skip-link';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('SkipLink', () => {
  it('renders as a link targeting #main-content', () => {
    renderWithProviders(
      <SkipLink href="#main-content">Skip to content</SkipLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent('Skip to content');
  });
});
