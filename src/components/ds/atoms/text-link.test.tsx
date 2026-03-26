import { TextLink } from '@components/ds/atoms/text-link';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('TextLink', () => {
  it('renders link text', () => {
    renderWithProviders(
      <TextLink href="https://example.com">Click me</TextLink>,
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with the correct href', () => {
    renderWithProviders(<TextLink href="https://example.com">Link</TextLink>);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('adds target=_blank when external is true', () => {
    renderWithProviders(
      <TextLink
        href="https://example.com"
        external
      >
        External
      </TextLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add target=_blank when external is not set', () => {
    renderWithProviders(<TextLink href="/internal">Internal</TextLink>);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
  });
});
