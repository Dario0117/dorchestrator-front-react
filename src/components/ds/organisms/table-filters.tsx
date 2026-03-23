import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { cn } from '@lib/utils';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface TableFiltersProps {
  children: ReactNode;
  activeFilterCount: number;
  onClearFilters: () => void;
  className?: string;
}

export function TableFilters({
  children,
  activeFilterCount,
  onClearFilters,
  className,
}: TableFiltersProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap',
        className,
      )}
    >
      {children}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-11 gap-2 text-base md:text-sm"
        >
          <X className="h-4 w-4" />
          Clear Filters
          <Badge variant="secondary">{activeFilterCount}</Badge>
        </Button>
      )}
    </div>
  );
}
