import { Table } from '@components/ds/atoms/table';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('rounded-md border', className)}>
      <Table>{children}</Table>
    </div>
  );
}
