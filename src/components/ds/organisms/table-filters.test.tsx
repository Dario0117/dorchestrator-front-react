import { TableFilters } from '@components/ds/organisms/table-filters';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TableFilters', () => {
  it('should render children', () => {
    renderWithProviders(
      <TableFilters
        activeFilterCount={0}
        onClearFilters={vi.fn()}
      >
        <input aria-label="test filter" />
      </TableFilters>,
    );

    expect(screen.getByLabelText('test filter')).toBeInTheDocument();
  });

  it('should show clear button with badge when activeFilterCount > 0', () => {
    renderWithProviders(
      <TableFilters
        activeFilterCount={3}
        onClearFilters={vi.fn()}
      >
        <span>filters</span>
      </TableFilters>,
    );

    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should hide clear button when activeFilterCount is 0', () => {
    renderWithProviders(
      <TableFilters
        activeFilterCount={0}
        onClearFilters={vi.fn()}
      >
        <span>filters</span>
      </TableFilters>,
    );

    expect(
      screen.queryByRole('button', { name: /clear filters/i }),
    ).not.toBeInTheDocument();
  });

  it('should call onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    renderWithProviders(
      <TableFilters
        activeFilterCount={2}
        onClearFilters={onClearFilters}
      >
        <span>filters</span>
      </TableFilters>,
    );

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('should display correct count in badge', () => {
    renderWithProviders(
      <TableFilters
        activeFilterCount={5}
        onClearFilters={vi.fn()}
      >
        <span>filters</span>
      </TableFilters>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
