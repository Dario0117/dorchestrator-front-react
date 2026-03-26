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
});
