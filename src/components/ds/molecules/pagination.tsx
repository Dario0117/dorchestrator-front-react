import {
  Pagination as UiPagination,
  PaginationContent as UiPaginationContent,
  PaginationEllipsis as UiPaginationEllipsis,
  PaginationItem as UiPaginationItem,
  PaginationLink as UiPaginationLink,
  PaginationNext as UiPaginationNext,
  PaginationPrevious as UiPaginationPrevious,
} from '@components/ui/pagination';

function Pagination(props: React.ComponentProps<typeof UiPagination>) {
  return <UiPagination {...props} />;
}

function PaginationContent(
  props: React.ComponentProps<typeof UiPaginationContent>,
) {
  return <UiPaginationContent {...props} />;
}

function PaginationItem(props: React.ComponentProps<typeof UiPaginationItem>) {
  return <UiPaginationItem {...props} />;
}

function PaginationLink({
  isActive,
  disabled,
  ...props
}: React.ComponentProps<typeof UiPaginationLink>) {
  return (
    <UiPaginationLink
      isActive={isActive}
      disabled={disabled}
      {...props}
    />
  );
}

function PaginationPrevious({
  text,
  ...props
}: React.ComponentProps<typeof UiPaginationPrevious>) {
  return (
    <UiPaginationPrevious
      text={text}
      {...props}
    />
  );
}

function PaginationNext({
  text,
  ...props
}: React.ComponentProps<typeof UiPaginationNext>) {
  return (
    <UiPaginationNext
      text={text}
      {...props}
    />
  );
}

function PaginationEllipsis(
  props: React.ComponentProps<typeof UiPaginationEllipsis>,
) {
  return <UiPaginationEllipsis {...props} />;
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
