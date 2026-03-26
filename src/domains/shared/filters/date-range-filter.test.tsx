import { DateRangeFilter } from '@domains/shared/filters/date-range-filter';
import {
  clickTrigger,
  renderWithProviders,
  selectOption,
} from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';

describe('DateRangeFilter', () => {
  beforeEach(() => {
    // Only fake Date (not setTimeout/setInterval) so Base UI's internal
    // timers for select open/close still work normally and don't cause act() warnings
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with "Any Time" shown by default', async () => {
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    const trigger = screen.getByLabelText('Filter by date range');
    expect(trigger).toBeInTheDocument();

    // Open select to verify the "Any Time" option is present
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Any Time' }),
      ).toBeInTheDocument();
    });
  });

  it('should show date preset options when clicked', async () => {
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    await clickTrigger(screen.getByLabelText('Filter by date range'));

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
    const onChange = vi.fn();
    renderWithProviders(<DateRangeFilter onChange={onChange} />);

    await selectOption(
      screen.getByLabelText('Filter by date range'),
      'Last 7 days',
    );

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
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-14T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    await selectOption(
      screen.getByLabelText('Filter by date range'),
      'Any Time',
    );

    expect(onChange).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('should reflect current "Last 24 hours" preset from startDate prop', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-14T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    // Open select to verify the correct preset is available
    const trigger = screen.getByLabelText('Filter by date range');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Last 24 hours' }),
      ).toBeInTheDocument();
    });
  });

  it('should reflect current "Last 30 days" preset from startDate prop', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2025-12-16T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    // Open select to verify the correct preset is available
    const trigger = screen.getByLabelText('Filter by date range');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Last 30 days' }),
      ).toBeInTheDocument();
    });
  });

  it('should show "Any Time" when startDate does not match any preset', async () => {
    const onChange = vi.fn();
    // A date 3 days ago — doesn't match 24h, 7d, or 30d presets (outside 1h tolerance)
    renderWithProviders(
      <DateRangeFilter
        startDate={new Date('2026-01-12T12:00:00.000Z').toISOString()}
        onChange={onChange}
      />,
    );

    // Open select to verify "Any Time" option is present (no preset matched)
    const trigger = screen.getByLabelText('Filter by date range');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Any Time' }),
      ).toBeInTheDocument();
    });
  });
});
