import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Stack } from '@components/ds/atoms/stack';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

interface FilterPanelProps {
  children: ReactNode;
  activeFilterCount: number;
  onClear: () => void;
  onApply?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterPanel({
  children,
  activeFilterCount,
  onClear,
  onApply,
  open,
  onOpenChange,
}: FilterPanelProps) {
  const hasActiveFilters = activeFilterCount > 0;

  const handleApply = () => {
    onApply?.();
    onOpenChange(false);
  };

  const handleClear = () => {
    onClear();
    onOpenChange(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger
        render={
          <Button variant="outline">
            <SlidersHorizontal />
            Filter
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                compact
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-80 rounded-lg p-4"
      >
        <Stack
          gap="lg"
          role="dialog"
          aria-label="Filter options"
        >
          {children}
          <HStack
            justify="between"
            border="top"
            innerSpaceY="sm"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              Clear all
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
            >
              Apply
            </Button>
          </HStack>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}

export type { FilterPanelProps };
