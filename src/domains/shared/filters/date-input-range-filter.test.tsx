import { DateInputRangeFilter } from '@domains/shared/filters/date-input-range-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DateInputRangeFilter', () => {
  it('should render from and to date inputs', () => {
    renderWithProviders(<DateInputRangeFilter onChange={vi.fn()} />);

    expect(screen.getByLabelText('From date')).toBeInTheDocument();
    expect(screen.getByLabelText('To date')).toBeInTheDocument();
  });

  it('should display provided date values', () => {
    renderWithProviders(
      <DateInputRangeFilter
        dateFrom="2026-03-10"
        dateTo="2026-03-20"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('From date')).toHaveValue('2026-03-10');
    expect(screen.getByLabelText('To date')).toHaveValue('2026-03-20');
  });

  it('should call onChange with date-only from-date when from input changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<DateInputRangeFilter onChange={onChange} />);

    await user.type(screen.getByLabelText('From date'), '2026-03-10');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: '2026-03-10',
      }),
    );
  });

  it('should call onChange with date-only to-date when to input changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<DateInputRangeFilter onChange={onChange} />);

    await user.type(screen.getByLabelText('To date'), '2026-03-20');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateTo: '2026-03-20',
      }),
    );
  });

  it('should set max on from-date input based on dateTo', () => {
    renderWithProviders(
      <DateInputRangeFilter
        dateTo="2026-03-20"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('From date')).toHaveAttribute(
      'max',
      '2026-03-20',
    );
  });

  it('should set min on to-date input based on dateFrom', () => {
    renderWithProviders(
      <DateInputRangeFilter
        dateFrom="2026-03-10"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('To date')).toHaveAttribute(
      'min',
      '2026-03-10',
    );
  });

  it('should not set min/max constraints when no dates are provided', () => {
    renderWithProviders(<DateInputRangeFilter onChange={vi.fn()} />);

    expect(screen.getByLabelText('From date')).not.toHaveAttribute('max');
    expect(screen.getByLabelText('To date')).not.toHaveAttribute('min');
  });

  it('should preserve existing dateTo when from-date changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DateInputRangeFilter
        dateTo="2026-03-20"
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('From date'), '2026-03-10');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateTo: '2026-03-20',
      }),
    );
  });

  it('should preserve existing dateFrom when to-date changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DateInputRangeFilter
        dateFrom="2026-03-10"
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('To date'), '2026-03-20');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: '2026-03-10',
      }),
    );
  });
});
