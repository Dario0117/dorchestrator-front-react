import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface TableFiltersProps {
  children: ReactNode;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export function TableFilters({
  children,
  activeFilterCount,
  onClearFilters,
}: TableFiltersProps) {
  return (
    <ResponsiveRow
      align="center"
      wrap
      gap="md"
    >
      {children}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
        >
          <X className="h-4 w-4" />
          Clear Filters
          <Badge variant="secondary">{activeFilterCount}</Badge>
        </Button>
      )}
    </ResponsiveRow>
  );
}
