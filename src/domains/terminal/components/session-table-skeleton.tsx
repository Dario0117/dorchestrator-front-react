import { Skeleton } from '@components/ds/atoms/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { TableWrapper } from '@components/ds/atoms/table-wrapper';

export function SessionTableSkeleton() {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Terminated</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Recording</TableHead>
            <TableHead width="sm" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="6rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="7rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1.25rem"
                  w="4rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="4rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="4rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="4rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="3.5rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="3.5rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="2rem"
                  w="2rem"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
