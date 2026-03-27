import { TerminalReauthForm } from '@domains/terminal/forms/terminal-reauth.form';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

const defaultProps = {
  authMutation: {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    // biome-ignore lint/suspicious/noExplicitAny: test mock for mutation hook return type
  } as any,
  organizationId: 'org-1',
  handleSuccess: vi.fn(),
};

describe('TerminalReauthForm', () => {
  it('renders password field with label', () => {
    renderWithProviders(<TerminalReauthForm {...defaultProps} />);
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it('renders authenticate button', () => {
    renderWithProviders(<TerminalReauthForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Authenticate' }),
    ).toBeInTheDocument();
  });
});
