import { TerminalConfigForm } from '@domains/terminal/forms/terminal-config.form';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  updateConfigMutation: {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    // biome-ignore lint/suspicious/noExplicitAny: test mock for mutation hook return type
  } as any,
  organizationId: 'org-1',
  defaultValues: { inactivityTimeoutMinutes: 60, hardCapHours: 24 },
  handleSuccess: vi.fn(),
};

describe('TerminalConfigForm', () => {
  it('renders card title "Terminal Session Timeouts"', () => {
    renderWithProviders(<TerminalConfigForm {...defaultProps} />);
    expect(screen.getByText('Terminal Session Timeouts')).toBeInTheDocument();
  });

  it('renders inactivity timeout field with label', () => {
    renderWithProviders(<TerminalConfigForm {...defaultProps} />);
    expect(
      screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
    ).toBeInTheDocument();
  });

  it('renders hard cap field with label', () => {
    renderWithProviders(<TerminalConfigForm {...defaultProps} />);
    expect(screen.getByLabelText(/Hard Cap \(hours\)/)).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderWithProviders(<TerminalConfigForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Save Configuration' }),
    ).toBeInTheDocument();
  });

  it('calls form submit when the form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalConfigForm {...defaultProps} />);

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '90');

    const submitButton = screen.getByRole('button', {
      name: 'Save Configuration',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.updateConfigMutation.mutate).toHaveBeenCalled();
    });
  });
});
