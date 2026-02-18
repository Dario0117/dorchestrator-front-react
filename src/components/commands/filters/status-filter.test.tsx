import { SelectFilter } from '@components/commands/filters/status-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

describe('SelectFilter', () => {
  it('should render with allLabel shown by default', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <SelectFilter
        onChange={onChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
      />,
    );

    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
  });

  it('should show options when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <SelectFilter
        onChange={onChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
      />,
    );

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Pending' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Running' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Completed' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Failed' }),
      ).toBeInTheDocument();
    });
  });

  it('should call onChange with value on selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <SelectFilter
        onChange={onChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
      />,
    );

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Failed' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Failed' }));

    expect(onChange).toHaveBeenCalledWith('failed');
  });

  it('should call onChange with undefined when "All" is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <SelectFilter
        value="completed"
        onChange={onChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
      />,
    );

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'All Statuses' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'All Statuses' }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('should reflect current value', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <SelectFilter
        value="completed"
        onChange={onChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
      />,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should work with device-like options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const deviceOptions = [
      { value: '1', label: 'Server Alpha' },
      { value: '2', label: 'Server Beta' },
    ];

    renderWithProviders(
      <SelectFilter
        onChange={onChange}
        options={deviceOptions}
        allLabel="All Devices"
        ariaLabel="Filter by device"
      />,
    );

    await user.click(screen.getByLabelText('Filter by device'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Server Alpha' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Server Beta' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Server Alpha' }));

    expect(onChange).toHaveBeenCalledWith('1');
  });
});
