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

  describe('position', () => {
    it('applies sticky positioning', () => {
      const { container } = renderWithProviders(
        <PageHeader position="sticky">Title</PageHeader>,
      );
      expect(container.firstChild).toHaveClass('sticky', 'top-0');
    });

    it('does not apply sticky by default', () => {
      const { container } = renderWithProviders(<PageHeader>Title</PageHeader>);
      expect(container.firstChild).not.toHaveClass('sticky');
    });
  });

  describe('shadow', () => {
    it('applies sm shadow', () => {
      const { container } = renderWithProviders(
        <PageHeader shadow="sm">Title</PageHeader>,
      );
      expect(container.firstChild).toHaveClass('shadow');
    });

    it('applies no shadow with none', () => {
      const { container } = renderWithProviders(
        <PageHeader shadow="none">Title</PageHeader>,
      );
      expect(container.firstChild).toHaveClass('shadow-none');
    });
  });

  it('spreads additional props', () => {
    renderWithProviders(<PageHeader data-testid="ph">Title</PageHeader>);
    expect(screen.getByTestId('ph')).toBeInTheDocument();
  });
});
