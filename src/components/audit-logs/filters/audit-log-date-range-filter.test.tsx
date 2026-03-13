// AuditLogDateRangeFilter is a thin wrapper around DateRangeFilter.
// DateRangeFilter is tested separately. Re-evaluate if this gains custom logic.

import { AuditLogDateRangeFilter } from '@components/audit-logs/filters/audit-log-date-range-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('AuditLogDateRangeFilter', () => {
  it('should render the filter with correct aria label', () => {
    renderWithProviders(
      <AuditLogDateRangeFilter
        startDate={undefined}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
  });
});
