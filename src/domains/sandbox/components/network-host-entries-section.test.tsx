import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { NetworkHostEntriesSection } from '@domains/sandbox/components/network-host-entries-section';
import type { SandboxConfigFormType } from '@domains/sandbox/forms/hooks/use-sandbox-config-form';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';

type HostEntryFormValue = { id: string; host: string; ports: string };

type WrapperProps = {
  externalFieldName: 'allowExternal' | 'denyExternal';
  localFieldName: 'allowLocal' | 'denyLocal';
  initialExternal?: HostEntryFormValue[];
  initialLocal?: HostEntryFormValue[];
  children?: (form: SandboxConfigFormType) => ReactNode;
};

function FormWrapper({
  externalFieldName,
  localFieldName,
  initialExternal = [],
  initialLocal = [],
  children,
}: WrapperProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      requiresApproval: 'false',
      sandboxTypeId: 1,
      networkMode: '',
      image: '',
      maxTimeoutMs: '' as number | string,
      maxOutputSize: '' as number | string,
      pidsLimit: '' as number | string,
      allowExternal:
        externalFieldName === 'allowExternal' ? initialExternal : [],
      allowLocal: localFieldName === 'allowLocal' ? initialLocal : [],
      denyExternal: externalFieldName === 'denyExternal' ? initialExternal : [],
      denyLocal: localFieldName === 'denyLocal' ? initialLocal : [],
    },
    // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
    onSubmit() {},
  });

  return (
    <>
      <NetworkHostEntriesSection
        form={form as unknown as SandboxConfigFormType}
        externalFieldName={externalFieldName}
        localFieldName={localFieldName}
      />
      {children?.(form as unknown as SandboxConfigFormType)}
    </>
  );
}

function renderComponent(overrides: Partial<WrapperProps> = {}) {
  const props: WrapperProps = {
    externalFieldName: 'allowExternal',
    localFieldName: 'allowLocal',
    ...overrides,
  };
  return renderWithProviders(<FormWrapper {...props} />);
}

describe('NetworkHostEntriesSection', () => {
  it('renders External Hosts and Local Hosts labels', async () => {
    renderComponent();
    expect(await screen.findByText('External Hosts')).toBeInTheDocument();
    expect(screen.getByText('Local Hosts')).toBeInTheDocument();
  });

  it('seeds default local host entries when local entries are empty', async () => {
    renderComponent();
    // The 5 default CIDR ranges should be seeded
    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.0/8')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('172.16.0.0/12')).toBeInTheDocument();
    expect(screen.getByDisplayValue('192.168.0.0/16')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100.64.0.0/10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('fc00::/7')).toBeInTheDocument();
  });

  it('does not seed defaults when local entries already exist', async () => {
    renderComponent({
      initialLocal: [{ id: '1', host: 'custom-host', ports: '80' }],
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('custom-host')).toBeInTheDocument();
    });
    expect(screen.queryByDisplayValue('10.0.0.0/8')).not.toBeInTheDocument();
  });

  it('renders existing external entries', async () => {
    renderComponent({
      initialExternal: [{ id: '1', host: 'api.github.com', ports: '443' }],
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('api.github.com')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('443')).toBeInTheDocument();
  });

  it('adds a new external entry when Add Entry is clicked in External Hosts', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [{ id: '1', host: 'example.com', ports: '80' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('example.com')).toBeInTheDocument();
    });

    // There are two "Add Entry" buttons - one for External, one for Local.
    // External Hosts comes first.
    const addButtons = screen.getAllByRole('button', { name: /add entry/i });
    await user.click(addButtons[0]!);

    // A new empty host input should appear for external hosts
    await waitFor(() => {
      const externalHostInputs =
        screen.getAllByLabelText(/External Hosts host/);
      expect(externalHostInputs).toHaveLength(2);
    });
  });

  it('removes an external entry when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [
        { id: '1', host: 'first.com', ports: '80' },
        { id: '2', host: 'second.com', ports: '443' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('first.com')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Remove External Hosts entry 1'));

    await waitFor(() => {
      expect(screen.queryByDisplayValue('first.com')).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('second.com')).toBeInTheDocument();
  });

  it('updates host value for an external entry', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [{ id: '1', host: 'old.com', ports: '80' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('old.com')).toBeInTheDocument();
    });

    const hostInput = screen.getByLabelText('External Hosts host 1');
    await user.clear(hostInput);
    await user.type(hostInput, 'new.com');

    await waitFor(() => {
      expect(screen.getByDisplayValue('new.com')).toBeInTheDocument();
    });
  });

  it('updates ports value for an external entry', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [{ id: '1', host: 'example.com', ports: '80' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    });

    const portsInput = screen.getByLabelText('External Hosts ports 1');
    await user.clear(portsInput);
    await user.type(portsInput, '443');

    await waitFor(() => {
      expect(screen.getByDisplayValue('443')).toBeInTheDocument();
    });
  });

  it('adds a new local entry when Add Entry is clicked in Local Hosts', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [{ id: '1', host: '10.0.0.1', ports: '22' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.1')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /add entry/i });
    // Local Hosts Add Entry is the second button
    await user.click(addButtons[1]!);

    await waitFor(() => {
      const localHostInputs = screen.getAllByLabelText(/Local Hosts host/);
      expect(localHostInputs).toHaveLength(2);
    });
  });

  it('removes a local entry when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [
        { id: '1', host: '10.0.0.1', ports: '22' },
        { id: '2', host: '192.168.1.1', ports: '80' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.1')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Remove Local Hosts entry 1'));

    await waitFor(() => {
      expect(screen.queryByDisplayValue('10.0.0.1')).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();
  });

  it('updates host value for a local entry', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [{ id: '1', host: '10.0.0.1', ports: '22' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.1')).toBeInTheDocument();
    });

    const hostInput = screen.getByLabelText('Local Hosts host 1');
    await user.clear(hostInput);
    await user.type(hostInput, '172.16.0.1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('172.16.0.1')).toBeInTheDocument();
    });
  });

  it('updates ports value for a local entry', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [{ id: '1', host: '10.0.0.1', ports: '22' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('22')).toBeInTheDocument();
    });

    const portsInput = screen.getByLabelText('Local Hosts ports 1');
    await user.clear(portsInput);
    await user.type(portsInput, '8080');

    await waitFor(() => {
      expect(screen.getByDisplayValue('8080')).toBeInTheDocument();
    });
  });

  it('works with deny field names', async () => {
    renderComponent({
      externalFieldName: 'denyExternal',
      localFieldName: 'denyLocal',
      initialExternal: [{ id: '1', host: 'blocked.com', ports: '80' }],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('blocked.com')).toBeInTheDocument();
    });
    expect(screen.getByText('External Hosts')).toBeInTheDocument();
    expect(screen.getByText('Local Hosts')).toBeInTheDocument();
  });

  it('seeds defaults for deny local field when empty', async () => {
    renderComponent({
      externalFieldName: 'denyExternal',
      localFieldName: 'denyLocal',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.0/8')).toBeInTheDocument();
    });
  });

  it('renders separator between sections', async () => {
    renderComponent();
    // The separator is rendered; we verify it exists via its role
    await waitFor(() => {
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  it('does not re-seed defaults on subsequent re-renders after seeding', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for defaults to be seeded
    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.0/8')).toBeInTheDocument();
    });

    // Trigger a re-render by adding an external entry, which causes state change
    const addButtons = screen.getAllByRole('button', { name: /add entry/i });
    await user.click(addButtons[0]!);

    // The local defaults should still be the same 5 entries, not re-seeded
    await waitFor(() => {
      const localHostInputs = screen.getAllByLabelText(/Local Hosts host/);
      expect(localHostInputs).toHaveLength(5);
    });
    expect(screen.getByDisplayValue('10.0.0.0/8')).toBeInTheDocument();
  });

  it('updates host for one external entry while preserving others', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [
        { id: '1', host: 'first.com', ports: '80' },
        { id: '2', host: 'second.com', ports: '443' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('first.com')).toBeInTheDocument();
    });

    const hostInput = screen.getByLabelText('External Hosts host 2');
    await user.clear(hostInput);
    await user.type(hostInput, 'updated.com');

    await waitFor(() => {
      expect(screen.getByDisplayValue('updated.com')).toBeInTheDocument();
    });
    // First entry should remain unchanged
    expect(screen.getByDisplayValue('first.com')).toBeInTheDocument();
  });

  it('updates ports for one external entry while preserving others', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialExternal: [
        { id: '1', host: 'first.com', ports: '80' },
        { id: '2', host: 'second.com', ports: '443' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    });

    const portsInput = screen.getByLabelText('External Hosts ports 2');
    await user.clear(portsInput);
    await user.type(portsInput, '8080');

    await waitFor(() => {
      expect(screen.getByDisplayValue('8080')).toBeInTheDocument();
    });
    // First entry ports should remain unchanged
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('updates host for one local entry while preserving others', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [
        { id: '1', host: '10.0.0.1', ports: '22' },
        { id: '2', host: '192.168.1.1', ports: '80' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.1')).toBeInTheDocument();
    });

    const hostInput = screen.getByLabelText('Local Hosts host 2');
    await user.clear(hostInput);
    await user.type(hostInput, '172.16.0.1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('172.16.0.1')).toBeInTheDocument();
    });
    // First entry should remain unchanged
    expect(screen.getByDisplayValue('10.0.0.1')).toBeInTheDocument();
  });

  it('skips re-seeding after localFieldName changes once defaults were already seeded', async () => {
    const user = userEvent.setup();

    function SwitchableWrapper() {
      const [localField, setLocalField] = useState<'allowLocal' | 'denyLocal'>(
        'allowLocal',
      );
      const form = useAppForm({
        defaultValues: {
          name: '',
          description: '',
          requiresApproval: 'false',
          sandboxTypeId: 1,
          networkMode: '',
          image: '',
          maxTimeoutMs: '' as number | string,
          maxOutputSize: '' as number | string,
          pidsLimit: '' as number | string,
          allowExternal: [],
          allowLocal: [],
          denyExternal: [],
          denyLocal: [{ id: '1', host: 'existing.local', ports: '22' }],
        },
        onSubmit() {
          return undefined;
        },
      });

      return (
        <>
          <button
            type="button"
            onClick={() => setLocalField('denyLocal')}
          >
            Switch Field
          </button>
          <NetworkHostEntriesSection
            form={form as unknown as SandboxConfigFormType}
            externalFieldName="allowExternal"
            localFieldName={localField}
          />
        </>
      );
    }

    renderWithProviders(<SwitchableWrapper />);

    // First render: allowLocal is empty → defaults are seeded
    await waitFor(() => {
      expect(screen.getByDisplayValue('10.0.0.0/8')).toBeInTheDocument();
    });

    // Switch localFieldName to denyLocal → effect re-runs, but hasSeededDefaults.current is true
    await user.click(screen.getByRole('button', { name: /switch field/i }));

    // denyLocal has an existing entry "existing.local" — defaults should NOT be seeded again
    await waitFor(() => {
      expect(screen.getByDisplayValue('existing.local')).toBeInTheDocument();
    });
  });

  it('updates ports for one local entry while preserving others', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialLocal: [
        { id: '1', host: '10.0.0.1', ports: '22' },
        { id: '2', host: '192.168.1.1', ports: '80' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('22')).toBeInTheDocument();
    });

    const portsInput = screen.getByLabelText('Local Hosts ports 2');
    await user.clear(portsInput);
    await user.type(portsInput, '8080');

    await waitFor(() => {
      expect(screen.getByDisplayValue('8080')).toBeInTheDocument();
    });
    // First entry ports should remain unchanged
    expect(screen.getByDisplayValue('22')).toBeInTheDocument();
  });
});
