import { SecondaryText } from '@components/ds/atoms/secondary-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ds/molecules/pagination';
import { PAGE_SIZE_OPTIONS } from '@lib/pagination.constants';
import { cn } from '@lib/utils';

interface PaginatedFooterProps {
  totalResults: number;
  singularLabel: string;
  pluralLabel: string;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  className?: string;
}

function PaginatedFooter({
  totalResults,
  singularLabel,
  pluralLabel,
  page,
  totalPages,
  hasNext,
  hasPrevious,
  size,
  onPageChange,
  onSizeChange,
  className,
}: PaginatedFooterProps) {
  return (
    <div
      className={cn(
        'mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between',
        className,
      )}
    >
      <SecondaryText>
        {totalResults} total {totalResults === 1 ? singularLabel : pluralLabel}
      </SecondaryText>

      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(page - 1)}
                aria-disabled={!hasPrevious}
                disabled={!hasPrevious}
              />
            </PaginationItem>

            <PaginationItem>
              <output className="px-2 text-sm">
                Page {page} of {totalPages}
              </output>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(page + 1)}
                aria-disabled={!hasNext}
                disabled={!hasNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <Select
          value={String(size)}
          onValueChange={(value) => {
            /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
            if (value !== null) {
              onSizeChange(Number(value));
            }
            /* v8 ignore stop */
          }}
        >
          <SelectTrigger
            aria-label="Page size"
            className="h-11 w-auto text-base md:text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem
                key={option}
                value={String(option)}
              >
                {option} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export { PaginatedFooter };
export type { PaginatedFooterProps };
