import { Surface } from '@components/ds/atoms/surface';
import { Table } from '@components/ds/atoms/table';
import type { ReactNode } from 'react';

interface DataTableProps {
  children: ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return (
    <Surface
      rounded="md"
      border="all"
    >
      <Table>{children}</Table>
    </Surface>
  );
}
