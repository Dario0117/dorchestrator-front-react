import { FilteredDataTable } from '@components/ds/organisms/filtered-data-table';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

const defaultProps = {
  filters: <span>filter controls</span>,
  activeFilterCount: 0,
  onClearFilters: vi.fn(),
  isEmpty: false,
  filteredEmptyState: <div>No results match your filters</div>,
  defaultEmptyState: <div>No data available</div>,
};

describe('FilteredDataTable', () => {
  it('should show defaultEmptyState when empty and no filters active', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={true}
        activeFilterCount={0}
      >
        <tbody>
          <tr>
            <td>data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(
      screen.queryByText('No results match your filters'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should show filteredEmptyState when empty and filters are active', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={true}
        activeFilterCount={2}
      >
        <tbody>
          <tr>
            <td>data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(
      screen.getByText('No results match your filters'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should show table content when not empty', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={false}
      >
        <tbody>
          <tr>
            <td>row data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('row data')).toBeInTheDocument();
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No results match your filters'),
    ).not.toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={false}
        footer={<div>pagination footer</div>}
      >
        <tbody>
          <tr>
            <td>data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(screen.getByText('pagination footer')).toBeInTheDocument();
  });

  it('should render filters in TableFilters wrapper', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={false}
      >
        <tbody>
          <tr>
            <td>data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(screen.getByText('filter controls')).toBeInTheDocument();
  });

  it('should not render footer when empty', () => {
    renderWithProviders(
      <FilteredDataTable
        {...defaultProps}
        isEmpty={true}
        footer={<div>pagination footer</div>}
      >
        <tbody>
          <tr>
            <td>data</td>
          </tr>
        </tbody>
      </FilteredDataTable>,
    );

    expect(screen.queryByText('pagination footer')).not.toBeInTheDocument();
  });
});
