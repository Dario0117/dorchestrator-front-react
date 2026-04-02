import { SandboxConfigForm } from '@domains/sandbox/forms/sandbox-config.form';
import { useCreateSandboxPresetMutation } from '@domains/sandbox/services/create-sandbox-preset.http-service';
import type { SandboxTypeItem } from '@domains/sandbox/services/list-sandbox-types.http-service';
import { useUpdateSandboxPresetMutation } from '@domains/sandbox/services/update-sandbox-preset.http-service';
import { renderWithProviders, selectOption } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const SANDBOX_TYPES: SandboxTypeItem[] = [
  {
    id: 1,
    name: 'None',
    category: 'none',
    pluginType: 'native',
    available: true,
  },
  {
    id: 2,
    name: 'Docker',
    category: 'container',
    pluginType: 'native',
    available: true,
  },
  {
    id: 3,
    name: 'Firecracker',
    category: 'vm',
    pluginType: 'third-party',
    available: false,
  },
];

function TestWrapper({
  mode = 'create',
  handleSuccess,
  presetId,
  defaultValues,
  sandboxTypes = SANDBOX_TYPES,
}: {
  mode?: 'create' | 'edit';
  handleSuccess: () => void;
  presetId?: number;
  defaultValues?: Parameters<typeof SandboxConfigForm>[0]['defaultValues'];
  sandboxTypes?: SandboxTypeItem[];
}) {
  const createMutation = useCreateSandboxPresetMutation('org-123');
  const updateMutation = useUpdateSandboxPresetMutation('org-123');
  return (
    <SandboxConfigForm
      mode={mode}
      createMutation={createMutation}
      updateMutation={updateMutation}
      organizationId="org-123"
      presetId={presetId}
      defaultValues={defaultValues}
      handleSuccess={handleSuccess}
      sandboxTypes={sandboxTypes}
    />
  );
}

describe('SandboxConfigForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
  });

  describe('rendering in create mode', () => {
    it('should render the card title as "New Preset" in create mode', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      expect(screen.getByText('New Preset')).toBeInTheDocument();
    });

    it('should render the submit button with "Create Preset" label', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      expect(
        screen.getByRole('button', { name: 'Create Preset' }),
      ).toBeInTheDocument();
    });

    it('should render the Preset Name and Description fields', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      expect(screen.getByLabelText(/Preset Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('should render the Requires Approval select', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      expect(screen.getByLabelText(/Requires Approval/)).toBeInTheDocument();
    });

    it('should render the Sandbox Type select', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      expect(screen.getByLabelText(/Sandbox Type/)).toBeInTheDocument();
    });
  });

  describe('rendering in edit mode', () => {
    it('should render the card title as "Edit Preset"', () => {
      renderWithProviders(
        <TestWrapper
          mode="edit"
          presetId={1}
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            name: 'My Preset',
            sandboxTypeId: 2,
          }}
        />,
      );

      expect(screen.getByText('Edit Preset')).toBeInTheDocument();
    });

    it('should render the submit button with "Save Changes" label', () => {
      renderWithProviders(
        <TestWrapper
          mode="edit"
          presetId={1}
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            name: 'My Preset',
            sandboxTypeId: 2,
          }}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Save Changes' }),
      ).toBeInTheDocument();
    });
  });

  describe('sandbox type selection — "none" category', () => {
    it('should show host execution warning when "None" sandbox type is selected', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 1 }}
        />,
      );

      expect(
        screen.getByText(/Commands run directly on the host with no isolation/),
      ).toBeInTheDocument();
    });

    it('should not show container-specific fields when "None" is selected', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 1 }}
        />,
      );

      expect(screen.queryByLabelText(/Network Policy/)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Container Image/),
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Max Timeout/)).not.toBeInTheDocument();
    });
  });

  describe('sandbox type selection — container type', () => {
    it('should show container-specific fields when a container type is selected', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2 }}
        />,
      );

      expect(screen.getByLabelText(/Network Policy/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Container Image/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Timeout/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Output Size/)).toBeInTheDocument();
      expect(screen.getByLabelText(/PIDs Limit/)).toBeInTheDocument();
    });

    it('should not show host execution warning when container type is selected', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2 }}
        />,
      );

      expect(
        screen.queryByText(
          /Commands run directly on the host with no isolation/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('network mode conditional sections', () => {
    it('should show allow-list host entry sections when network mode is "allow-list"', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            sandboxTypeId: 2,
            networkMode: 'allow-list',
          }}
        />,
      );

      expect(screen.getByText('External Hosts')).toBeInTheDocument();
      expect(screen.getByText('Local Hosts')).toBeInTheDocument();
    });

    it('should show deny-list host entry sections when network mode is "deny-list"', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            sandboxTypeId: 2,
            networkMode: 'deny-list',
          }}
        />,
      );

      expect(screen.getByText('External Hosts')).toBeInTheDocument();
      expect(screen.getByText('Local Hosts')).toBeInTheDocument();
    });

    it('should not show host entry sections when network mode is empty', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            sandboxTypeId: 2,
            networkMode: '',
          }}
        />,
      );

      expect(screen.queryByText('External Hosts')).not.toBeInTheDocument();
      expect(screen.queryByText('Local Hosts')).not.toBeInTheDocument();
    });

    it('should not show host entry sections when network mode is "allow-all"', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            sandboxTypeId: 2,
            networkMode: 'allow-all',
          }}
        />,
      );

      expect(screen.queryByText('External Hosts')).not.toBeInTheDocument();
    });
  });

  describe('sandbox type options', () => {
    it('should label the "none" category with "(direct host execution)" suffix', async () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const trigger = screen.getByLabelText(/Sandbox Type/);
      await userEvent.setup().click(trigger);

      await waitFor(() => {
        expect(
          screen.getByRole('option', {
            name: 'None (direct host execution)',
          }),
        ).toBeInTheDocument();
      });
    });

    it('should label unavailable types with "(not yet available)" suffix and disable them', async () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const trigger = screen.getByLabelText(/Sandbox Type/);
      await userEvent.setup().click(trigger);

      await waitFor(() => {
        const option = screen.getByRole('option', {
          name: 'Firecracker (not yet available)',
        });
        expect(option).toBeInTheDocument();
        expect(option).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should label available non-none types with just the name', async () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const trigger = screen.getByLabelText(/Sandbox Type/);
      await userEvent.setup().click(trigger);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Docker' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('noSandboxTypeId fallback', () => {
    it('should fall back to 1 when no "none" category sandbox type exists', () => {
      const typesWithoutNone: SandboxTypeItem[] = [
        {
          id: 5,
          name: 'Docker',
          category: 'container',
          pluginType: 'native',
          available: true,
        },
      ];

      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          sandboxTypes={typesWithoutNone}
          defaultValues={{ sandboxTypeId: 1 }}
        />,
      );

      // With sandboxTypeId=1 and noSandboxTypeId=1 (fallback), should show the "none" warning
      expect(
        screen.getByText(/Commands run directly on the host with no isolation/),
      ).toBeInTheDocument();
    });
  });

  describe('network mode select options', () => {
    it('should show all network mode options in the select', async () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2 }}
        />,
      );

      const trigger = screen.getByLabelText(/Network Policy/);
      await userEvent.setup().click(trigger);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'None' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Allow List' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Deny List' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Allow All' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Internet Only' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Local Only' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('switching network mode dynamically', () => {
    it('should reveal allow-list host entries when selecting Allow List', async () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2, networkMode: '' }}
        />,
      );

      expect(screen.queryByText('External Hosts')).not.toBeInTheDocument();

      await selectOption(screen.getByLabelText(/Network Policy/), 'Allow List');

      await waitFor(() => {
        expect(screen.getByText('External Hosts')).toBeInTheDocument();
      });
    });

    it('should reveal deny-list host entries when selecting Deny List', async () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2, networkMode: '' }}
        />,
      );

      await selectOption(screen.getByLabelText(/Network Policy/), 'Deny List');

      await waitFor(() => {
        expect(screen.getByText('External Hosts')).toBeInTheDocument();
      });
    });
  });

  describe('form input fields', () => {
    it('should accept input in the Preset Name field', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const nameInput = screen.getByLabelText(/Preset Name/);
      await user.type(nameInput, 'My Test Preset');

      await waitFor(() => {
        expect(nameInput).toHaveValue('My Test Preset');
      });
    });

    it('should accept input in the Description field', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const descInput = screen.getByLabelText(/Description/);
      await user.type(descInput, 'A description');

      await waitFor(() => {
        expect(descInput).toHaveValue('A description');
      });
    });

    it('should accept input in the Container Image field', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2 }}
        />,
      );

      const imageInput = screen.getByLabelText(/Container Image/);
      await user.type(imageInput, 'ubuntu:22.04');

      await waitFor(() => {
        expect(imageInput).toHaveValue('ubuntu:22.04');
      });
    });

    it('should display default values when provided', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            name: 'Preset A',
            description: 'Desc A',
            sandboxTypeId: 2,
            image: 'nginx:latest',
            maxTimeoutMs: 30000,
            maxOutputSize: 1048576,
            pidsLimit: 50,
          }}
        />,
      );

      expect(screen.getByLabelText(/Preset Name/)).toHaveValue('Preset A');
      expect(screen.getByLabelText(/Description/)).toHaveValue('Desc A');
      expect(screen.getByLabelText(/Container Image/)).toHaveValue(
        'nginx:latest',
      );
      expect(screen.getByLabelText(/Max Timeout/)).toHaveValue(30000);
      expect(screen.getByLabelText(/Max Output Size/)).toHaveValue(1048576);
      expect(screen.getByLabelText(/PIDs Limit/)).toHaveValue(50);
    });
  });

  describe('form submission — create mode', () => {
    it('should call handleSuccess after successful create submission', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const nameInput = screen.getByLabelText(/Preset Name/);
      await user.type(nameInput, 'New Sandbox');

      const submitButton = screen.getByRole('button', {
        name: 'Create Preset',
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

  describe('form submission — edit mode', () => {
    it('should call handleSuccess after successful edit submission', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TestWrapper
          mode="edit"
          presetId={42}
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            name: 'Old Name',
            sandboxTypeId: 2,
          }}
        />,
      );

      const nameInput = screen.getByLabelText(/Preset Name/);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByRole('button', {
        name: 'Save Changes',
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

  describe('Sandbox Type select disabled in edit mode', () => {
    it('should disable the Sandbox Type select in edit mode', () => {
      renderWithProviders(
        <TestWrapper
          mode="edit"
          presetId={1}
          handleSuccess={mockHandleSuccess}
          defaultValues={{
            name: 'My Preset',
            sandboxTypeId: 2,
          }}
        />,
      );

      const trigger = screen.getByLabelText(/Sandbox Type/);
      expect(trigger).toBeDisabled();
    });

    it('should not disable the Sandbox Type select in create mode', () => {
      renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

      const trigger = screen.getByLabelText(/Sandbox Type/);
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('placeholders', () => {
    it('should show correct placeholders for container fields', () => {
      renderWithProviders(
        <TestWrapper
          handleSuccess={mockHandleSuccess}
          defaultValues={{ sandboxTypeId: 2 }}
        />,
      );

      expect(
        screen.getByPlaceholderText('e.g. Default Container'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Optional description'),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ubuntu:22.04')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('300000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('1048576')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('100')).toBeInTheDocument();
    });
  });
});
