// ActionFilter is a thin wrapper around SelectFilter with hardcoded options.
// SelectFilter is tested separately in search-input.test.tsx / status-filter usage tests.
// Re-evaluate if ActionFilter gains custom logic beyond delegation.

import { ActionFilter } from '@components/audit-logs/filters/action-filter';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('ActionFilter', () => {
  it('should render the filter with correct aria label', () => {
    renderWithProviders(
      <ActionFilter
        value={undefined}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Filter by action')).toBeInTheDocument();
  });
});
