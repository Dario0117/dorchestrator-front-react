import { BottomNavMoreSheet } from '@components/ds/organisms/bottom-nav-more-sheet';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Link: ({
      children,
      to,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      onClick?: () => void;
    } & Record<string, unknown>) => (
      <a
        href={to}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

describe('BottomNavMoreSheet', () => {
  it('renders menu items when open', () => {
    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={vi.fn()}
        basePath="/test-org/t/test-team"
      />,
    );

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('uses org base path (strips /t/ segment)', () => {
    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={vi.fn()}
        basePath="/test-org/t/test-team"
      />,
    );

    const auditLink = screen.getByText('Audit Logs').closest('a');
    expect(auditLink).toHaveAttribute('href', '/test-org/audit-logs');
  });

  it('handles basePath without /t/ segment', () => {
    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={vi.fn()}
        basePath="/test-org"
      />,
    );

    const auditLink = screen.getByText('Audit Logs').closest('a');
    expect(auditLink).toHaveAttribute('href', '/test-org/audit-logs');
  });

  it('falls back to full basePath when split yields empty string', () => {
    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={vi.fn()}
        basePath="/t/test-team"
      />,
    );

    const auditLink = screen.getByText('Audit Logs').closest('a');
    expect(auditLink).toHaveAttribute('href', '/t/test-team/audit-logs');
  });

  it('calls onOpenChange(false) when a link is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={onOpenChange}
        basePath="/test-org/t/test-team"
      />,
    );

    await user.click(screen.getByText('Audit Logs'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders sheet title', () => {
    renderWithProviders(
      <BottomNavMoreSheet
        open
        onOpenChange={vi.fn()}
        basePath="/test-org/t/test-team"
      />,
    );

    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
