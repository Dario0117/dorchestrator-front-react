// ResourceTypeFilter is a thin wrapper around SelectFilter with hardcoded options.
// SelectFilter is tested separately. Re-evaluate if this gains custom logic.

import { ResourceTypeFilter } from '@components/audit-logs/filters/resource-type-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('ResourceTypeFilter', () => {
  it('should render the filter with correct aria label', () => {
    renderWithProviders(
      <ResourceTypeFilter
        value={undefined}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText('Filter by resource type'),
    ).toBeInTheDocument();
  });
});
