import { SessionNotFound } from '@domains/terminal/components/session-not-found';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      params?: Record<string, string>;
    }) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

describe('SessionNotFound', () => {
  it('should render "Session not found" heading', () => {
    renderWithProviders(
      <SessionNotFound
        organizationSlug="test-org"
        teamSlug="default"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Session not found' }),
    ).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithProviders(
      <SessionNotFound
        organizationSlug="test-org"
        teamSlug="default"
      />,
    );

    expect(
      screen.getByText(/does not exist or you don't have access/),
    ).toBeInTheDocument();
  });

  it('should render link back to sessions list', () => {
    renderWithProviders(
      <SessionNotFound
        organizationSlug="test-org"
        teamSlug="default"
      />,
    );

    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });
});
