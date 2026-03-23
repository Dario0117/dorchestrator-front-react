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

export function BookmarksTableSkeleton() {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Session Created</TableHead>
            <TableHead>Bookmarked</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Recording</TableHead>
            <TableHead width="lg" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((id) => (
            <TableRow key={id}>
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
                  w="5rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="5rem"
                />
              </TableCell>
              <TableCell>
                <Skeleton
                  h="1rem"
                  w="8rem"
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
