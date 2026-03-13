import { DateRangeFilter } from '@components/commands/filters/date-range-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DateRangeFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with "Any Time" shown by default', () => {
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
    expect(screen.getByText('Any Time')).toBeInTheDocument();
  });

  it('should show date preset options when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    await user.click(screen.getByLabelText('Filter by date range'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Last 24 hours' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Last 7 days' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Last 30 days' }),
      ).toBeInTheDocument();
    });
  });

  it('should call onChange with startDate and endDate on preset selection', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    await user.click(screen.getByLabelText('Filter by date range'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Last 7 days' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Last 7 days' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
      }),
    );

    const call = onChange.mock.calls[0] as [
      { startDate: string; endDate: string },
    ];
    const { startDate, endDate } = call[0];
    const diffDays =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });

  it('should call onChange with undefined dates when "Any Time" is selected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-14T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Filter by date range'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Any Time' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Any Time' }));

    expect(onChange).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('should reflect current "Last 24 hours" preset from startDate prop', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-14T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
  });

  it('should reflect current "Last 30 days" preset from startDate prop', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2025-12-16T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should show "Any Time" when startDate does not match any preset', () => {
    const onChange = vi.fn();
    // A date 3 days ago — doesn't match 24h, 7d, or 30d presets (outside 1h tolerance)
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-12T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Any Time')).toBeInTheDocument();
  });
});
