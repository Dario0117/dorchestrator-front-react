import { PageHeader } from '@components/ds/atoms/page-header';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('PageHeader', () => {
  it('renders children', () => {
    renderWithProviders(<PageHeader>My Page Title</PageHeader>);
    expect(screen.getByText('My Page Title')).toBeInTheDocument();
  });

  it('renders as a header element', () => {
    renderWithProviders(<PageHeader>Title</PageHeader>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
