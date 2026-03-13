import { DeviceConfigForm } from '@components/devices/forms/device-config.form';
import type { DeviceConfigFormProps } from '@components/devices/forms/device-config.form.types';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUpdateDeviceConfigMutation } from '@services/terminal/update-device-config.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultValues: DeviceConfigFormProps['defaultValues'] = {
  inactivityTimeoutMinutes: 60,
  hardCapHours: 8,
  defaultWorkingDirectory: '/home/user',
};

const orgCeiling: DeviceConfigFormProps['orgCeiling'] = {
  inactivityTimeoutMinutes: 120,
  hardCapHours: 24,
};

function TestWrapper({
  handleSuccess,
  defaultValues: dv = defaultValues,
  orgCeiling: ceiling = orgCeiling,
}: {
  handleSuccess: () => void;
  defaultValues?: DeviceConfigFormProps['defaultValues'];
  orgCeiling?: DeviceConfigFormProps['orgCeiling'];
}) {
  const updateConfigMutation = useUpdateDeviceConfigMutation();
  return (
    <DeviceConfigForm
      updateConfigMutation={updateConfigMutation}
      organizationId="org-123"
      deviceId={1}
      defaultValues={dv}
      orgCeiling={ceiling}
      handleSuccess={handleSuccess}
    />
  );
}

describe('DeviceConfigForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
  });

  it('should render all three form fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Hard Cap \(hours\)/)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Default Working Directory/),
    ).toBeInTheDocument();
  });

  it('should display correct labels', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByText('Inactivity Timeout (minutes)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Hard Cap (hours)')).toBeInTheDocument();
    expect(screen.getByText('Default Working Directory')).toBeInTheDocument();
  });

  it('should show org ceiling values in helper text when orgCeiling is provided', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByText(/Organization ceiling: 120 minutes/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Organization hard cap: 24 hours/),
    ).toBeInTheDocument();
  });

  it('should show default helper text when orgCeiling is null', () => {
    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        orgCeiling={null}
      />,
    );

    expect(
      screen.getByText(
        /Sessions will lock after this period of inactivity. Must not exceed the organization ceiling./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Maximum session lifetime regardless of activity. Must not exceed the organization ceiling./,
      ),
    ).toBeInTheDocument();
  });

  it('should show default helper text for hard cap when hardCapHours is null', () => {
    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        orgCeiling={{ inactivityTimeoutMinutes: 120, hardCapHours: null }}
      />,
    );

    expect(
      screen.getByText(/Organization ceiling: 120 minutes/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Maximum session lifetime regardless of activity. Must not exceed the organization ceiling./,
      ),
    ).toBeInTheDocument();
  });

  it('should show working directory helper text', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByText(
        /Default working directory for new terminal sessions on this device/,
      ),
    ).toBeInTheDocument();
  });

  it('should render the submit button', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByRole('button', { name: 'Save Device Configuration' }),
    ).toBeInTheDocument();
  });

  it('should display default values in form fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    const hardCapInput = screen.getByLabelText(/Hard Cap \(hours\)/);
    const workingDirInput = screen.getByLabelText(/Default Working Directory/);

    expect(inactivityInput).toHaveValue(60);
    expect(hardCapInput).toHaveValue(8);
    expect(workingDirInput).toHaveValue('/home/user');
  });

  it('should accept user input in the inactivity timeout field', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        defaultValues={{
          inactivityTimeoutMinutes: '',
          hardCapHours: '',
          defaultWorkingDirectory: '',
        }}
      />,
    );

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.type(inactivityInput, '90');

    await waitFor(() => {
      expect(inactivityInput).toHaveValue(90);
    });
  });

  it('should accept user input in the hard cap field', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        defaultValues={{
          inactivityTimeoutMinutes: '',
          hardCapHours: '',
          defaultWorkingDirectory: '',
        }}
      />,
    );

    const hardCapInput = screen.getByLabelText(/Hard Cap \(hours\)/);
    await user.type(hardCapInput, '12');

    await waitFor(() => {
      expect(hardCapInput).toHaveValue(12);
    });
  });

  it('should accept user input in the working directory field', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        defaultValues={{
          inactivityTimeoutMinutes: 60,
          hardCapHours: '',
          defaultWorkingDirectory: '',
        }}
      />,
    );

    const workingDirInput = screen.getByLabelText(/Default Working Directory/);
    await user.type(workingDirInput, '/opt/workspace');

    await waitFor(() => {
      expect(workingDirInput).toHaveValue('/opt/workspace');
    });
  });

  it('should have required attribute on inactivity timeout field', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    expect(inactivityInput).toHaveAttribute('required');
  });

  it('should not have required attribute on optional fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const hardCapInput = screen.getByLabelText(/Hard Cap \(hours\)/);
    const workingDirInput = screen.getByLabelText(/Default Working Directory/);

    expect(hardCapInput).not.toHaveAttribute('required');
    expect(workingDirInput).not.toHaveAttribute('required');
  });

  it('should display correct placeholders', () => {
    renderWithProviders(
      <TestWrapper
        handleSuccess={mockHandleSuccess}
        defaultValues={{
          inactivityTimeoutMinutes: '',
          hardCapHours: '',
          defaultWorkingDirectory: '',
        }}
      />,
    );

    expect(screen.getByPlaceholderText('60')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Leave empty for no hard cap'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('/home/user')).toBeInTheDocument();
  });

  it('should have submit button disabled when form is pristine', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', {
      name: 'Save Device Configuration',
    });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button after modifying a field', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '90');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeEnabled();
    });
  });

  it('should submit the form successfully after modifying a field', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '90');

    const submitButton = screen.getByRole('button', {
      name: 'Save Device Configuration',
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
