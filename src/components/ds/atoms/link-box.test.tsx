import { LinkBox } from '@components/ds/atoms/link-box';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('LinkBox', () => {
  it('renders as a link with the correct href', () => {
    renderWithProviders(
      <LinkBox
        variant="thumbnail"
        href="https://example.com"
      >
        Content
      </LinkBox>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders children', () => {
    renderWithProviders(
      <LinkBox
        variant="icon"
        href="/path"
      >
        Icon content
      </LinkBox>,
    );
    expect(screen.getByText('Icon content')).toBeInTheDocument();
  });

  describe('variant', () => {
    it('applies thumbnail variant classes', () => {
      renderWithProviders(
        <LinkBox
          variant="thumbnail"
          href="/img"
        >
          Thumb
        </LinkBox>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('overflow-hidden', 'rounded', 'border');
    });

    it('applies icon variant classes', () => {
      renderWithProviders(
        <LinkBox
          variant="icon"
          href="/icon"
        >
          Icon
        </LinkBox>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'bg-muted',
      );
    });
  });

  it('spreads additional props', () => {
    renderWithProviders(
      <LinkBox
        variant="thumbnail"
        href="/path"
        data-testid="lb"
      >
        Content
      </LinkBox>,
    );
    expect(screen.getByTestId('lb')).toBeInTheDocument();
  });
});
