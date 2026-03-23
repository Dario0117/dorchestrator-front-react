import { Output } from '@components/ds/atoms/output';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
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
}: PaginatedFooterProps) {
  return (
    <ResponsiveRow
      align="center"
      justify="between"
      gap="lg"
      spaceAbove="xl"
    >
      <SecondaryText>
        {totalResults} total {totalResults === 1 ? singularLabel : pluralLabel}
      </SecondaryText>

      <ResponsiveRow
        align="center"
        gap="lg"
      >
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
              <Output>
                Page {page} of {totalPages}
              </Output>
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
            width="auto"
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
      </ResponsiveRow>
    </ResponsiveRow>
  );
}

export { PaginatedFooter };
export type { PaginatedFooterProps };
