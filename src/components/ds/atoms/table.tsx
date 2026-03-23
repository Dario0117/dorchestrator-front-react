import type { BgOption, GapSize } from '@components/ds/utils/tokens';
import { BG, GAP } from '@components/ds/utils/tokens';
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
import { cn } from '@lib/utils';

type ShadcnTableProps = React.ComponentProps<typeof ShadcnTable>;
interface TableProps extends ShadcnTableProps {}

type ShadcnTableHeaderProps = React.ComponentProps<typeof ShadcnTableHeader>;
interface TableHeaderProps extends ShadcnTableHeaderProps {}

type ShadcnTableBodyProps = React.ComponentProps<typeof ShadcnTableBody>;
interface TableBodyProps extends ShadcnTableBodyProps {}

type ShadcnTableFooterProps = React.ComponentProps<typeof ShadcnTableFooter>;
interface TableFooterProps extends ShadcnTableFooterProps {}

type ShadcnTableRowProps = React.ComponentProps<typeof ShadcnTableRow>;
interface TableRowProps
  extends Omit<ShadcnTableRowProps, 'className' | 'style'> {
  clickable?: boolean;
  height?: 'default' | 'tall';
}

type ShadcnTableHeadProps = React.ComponentProps<typeof ShadcnTableHead>;
type TableHeadWidth = 'xs' | 'sm' | 'md' | 'lg';
const TABLE_HEAD_WIDTH: Record<TableHeadWidth, string> = {
  xs: 'w-8',
  sm: 'w-12',
  md: 'w-[40px]',
  lg: 'w-[80px]',
};
interface TableHeadProps
  extends Omit<ShadcnTableHeadProps, 'className' | 'style'> {
  width?: TableHeadWidth;
}

type ShadcnTableCellProps = React.ComponentProps<typeof ShadcnTableCell>;
type TableCellPaddingX = 'none' | 'lg';
const TABLE_CELL_PX: Record<TableCellPaddingX, string> = {
  none: 'p-0',
  lg: 'px-6',
};

interface TableCellProps
  extends Omit<ShadcnTableCellProps, 'className' | 'style'> {
  weight?: 'normal' | 'medium';
  bg?: BgOption;
  padding?: TableCellPaddingX;
  gap?: GapSize;
}

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

function TableRow({ clickable, height, ...props }: TableRowProps) {
  return (
    <ShadcnTableRow
      className={cn(
        clickable && 'cursor-pointer hover:bg-muted/50 transition-colors',
        height === 'tall' && 'h-14',
      )}
      {...props}
    />
  );
}

function TableHead({ width, ...props }: TableHeadProps) {
  return (
    <ShadcnTableHead
      className={cn(width && TABLE_HEAD_WIDTH[width])}
      {...props}
    />
  );
}

function TableCell({ weight, bg, padding, gap, ...props }: TableCellProps) {
  return (
    <ShadcnTableCell
      className={cn(
        weight === 'medium' && 'font-medium',
        bg && BG[bg],
        padding && TABLE_CELL_PX[padding],
        gap && `flex ${GAP[gap]}`,
      )}
      {...props}
    />
  );
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
