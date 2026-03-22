import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCaption as ShadcnTableCaption,
  TableCell as ShadcnTableCell,
  TableFooter as ShadcnTableFooter,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from '@components/ui/table';

type ShadcnTableProps = React.ComponentProps<typeof ShadcnTable>;
interface TableProps extends ShadcnTableProps {}

type ShadcnTableHeaderProps = React.ComponentProps<typeof ShadcnTableHeader>;
interface TableHeaderProps extends ShadcnTableHeaderProps {}

type ShadcnTableBodyProps = React.ComponentProps<typeof ShadcnTableBody>;
interface TableBodyProps extends ShadcnTableBodyProps {}

type ShadcnTableFooterProps = React.ComponentProps<typeof ShadcnTableFooter>;
interface TableFooterProps extends ShadcnTableFooterProps {}

type ShadcnTableRowProps = React.ComponentProps<typeof ShadcnTableRow>;
interface TableRowProps extends ShadcnTableRowProps {}

type ShadcnTableHeadProps = React.ComponentProps<typeof ShadcnTableHead>;
interface TableHeadProps extends ShadcnTableHeadProps {}

type ShadcnTableCellProps = React.ComponentProps<typeof ShadcnTableCell>;
interface TableCellProps extends ShadcnTableCellProps {}

type ShadcnTableCaptionProps = React.ComponentProps<typeof ShadcnTableCaption>;
interface TableCaptionProps extends ShadcnTableCaptionProps {}

function Table(props: TableProps) {
  return <ShadcnTable {...props} />;
}

function TableHeader(props: TableHeaderProps) {
  return <ShadcnTableHeader {...props} />;
}

function TableBody(props: TableBodyProps) {
  return <ShadcnTableBody {...props} />;
}

function TableFooter(props: TableFooterProps) {
  return <ShadcnTableFooter {...props} />;
}

function TableRow(props: TableRowProps) {
  return <ShadcnTableRow {...props} />;
}

function TableHead(props: TableHeadProps) {
  return <ShadcnTableHead {...props} />;
}

function TableCell(props: TableCellProps) {
  return <ShadcnTableCell {...props} />;
}

function TableCaption(props: TableCaptionProps) {
  return <ShadcnTableCaption {...props} />;
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
};
