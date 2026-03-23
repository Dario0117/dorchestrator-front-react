import { DataTable } from '@components/ds/organisms/data-table';
import { TableFilters } from '@components/ds/organisms/table-filters';
import type { ReactNode } from 'react';

interface FilteredDataTableProps {
  filters: ReactNode;
  activeFilterCount: number;
  onClearFilters: () => void;
  isEmpty: boolean;
  filteredEmptyState: ReactNode;
  defaultEmptyState: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FilteredDataTable({
  filters,
  activeFilterCount,
  onClearFilters,
  isEmpty,
  filteredEmptyState,
  defaultEmptyState,
  children,
  footer,
  className,
}: FilteredDataTableProps) {
  return (
    <div className={className}>
      <TableFilters
        activeFilterCount={activeFilterCount}
        onClearFilters={onClearFilters}
      >
        {filters}
      </TableFilters>

      {isEmpty && activeFilterCount > 0 && filteredEmptyState}
      {isEmpty && activeFilterCount === 0 && defaultEmptyState}

      {!isEmpty && (
        <>
          <DataTable>{children}</DataTable>
          {footer}
        </>
      )}
    </div>
  );
}
