import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { SmallText } from '@components/ds/atoms/small-text';
import { X } from 'lucide-react';

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <HStack
      gap="sm"
      wrap
    >
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
        >
          <SmallText
            size="xs"
            weight="medium"
          >
            {filter.label}: {filter.value}
          </SmallText>
          <Button
            variant="ghost"
            size="icon-compact"
            onClick={() => onRemove(filter.key)}
            aria-label={`Remove ${filter.label} filter`}
          >
            <X />
          </Button>
        </Badge>
      ))}
      <Button
        variant="link"
        size="compact"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </HStack>
  );
}

export type { FilterChipsProps, FilterChip };
