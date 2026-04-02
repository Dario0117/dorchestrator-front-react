import {
  type HostEntryFormValue,
  HostEntryList,
} from '@domains/sandbox/components/host-entry-list';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultEntries: HostEntryFormValue[] = [
  { id: '1', host: 'api.github.com', ports: '443' },
  { id: '2', host: 'example.com', ports: '80, 443' },
];

function renderComponent(
  overrides: Partial<Parameters<typeof HostEntryList>[0]> = {},
) {
  const props = {
    label: 'Allowed Hosts',
    entries: defaultEntries,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onChangeHost: vi.fn(),
    onChangePorts: vi.fn(),
    ...overrides,
  };
  const result = renderWithProviders(<HostEntryList {...props} />);
  return { ...result, props };
}

describe('HostEntryList', () => {
  it('renders the label', () => {
    renderComponent();
    expect(screen.getByText('Allowed Hosts')).toBeInTheDocument();
  });

  it('renders host and port inputs for each entry', () => {
    renderComponent();
    expect(screen.getByLabelText('Allowed Hosts host 1')).toHaveValue(
      'api.github.com',
    );
    expect(screen.getByLabelText('Allowed Hosts ports 1')).toHaveValue('443');
    expect(screen.getByLabelText('Allowed Hosts host 2')).toHaveValue(
      'example.com',
    );
    expect(screen.getByLabelText('Allowed Hosts ports 2')).toHaveValue(
      '80, 443',
    );
  });

  it('renders a remove button for each entry', () => {
    renderComponent();
    expect(
      screen.getByLabelText('Remove Allowed Hosts entry 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Remove Allowed Hosts entry 2'),
    ).toBeInTheDocument();
  });

  it('renders the Add Entry button', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: /add entry/i }),
    ).toBeInTheDocument();
  });

  it('calls onAdd when Add Entry button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderComponent();
    await user.click(screen.getByRole('button', { name: /add entry/i }));
    expect(props.onAdd).toHaveBeenCalledOnce();
  });

  it('calls onRemove with the correct index when remove button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderComponent();
    await user.click(screen.getByLabelText('Remove Allowed Hosts entry 2'));
    expect(props.onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onChangeHost with the correct index and value when host input changes', async () => {
    const user = userEvent.setup();
    const { props } = renderComponent();
    const hostInput = screen.getByLabelText('Allowed Hosts host 1');
    await user.clear(hostInput);
    await user.type(hostInput, 'new.host.com');
    // onChangeHost is called for each keystroke; verify the index is correct
    expect(props.onChangeHost).toHaveBeenCalledWith(0, expect.any(String));
  });

  it('calls onChangePorts with the correct index and value when ports input changes', async () => {
    const user = userEvent.setup();
    const { props } = renderComponent();
    const portsInput = screen.getByLabelText('Allowed Hosts ports 1');
    await user.clear(portsInput);
    await user.type(portsInput, '8080');
    expect(props.onChangePorts).toHaveBeenCalledWith(0, expect.any(String));
  });

  it('shows empty state message when entries is empty', () => {
    renderComponent({ entries: [] });
    expect(screen.getByText('No entries. Add one below.')).toBeInTheDocument();
  });

  it('does not show empty state message when there are entries', () => {
    renderComponent();
    expect(
      screen.queryByText('No entries. Add one below.'),
    ).not.toBeInTheDocument();
  });
});
