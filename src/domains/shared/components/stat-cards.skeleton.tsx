import { Card, CardContent, CardHeader } from '@components/ds/atoms/card';
import { Skeleton } from '@components/ds/atoms/skeleton';

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader
        direction="row"
        align="center"
        paddingBottom="sm"
      >
        <Skeleton
          w="80px"
          h="16px"
          rounded
        />
        <Skeleton
          w="20px"
          h="20px"
          rounded
        />
      </CardHeader>
      <CardContent>
        <Skeleton
          w="60px"
          h="28px"
          rounded
        />
      </CardContent>
    </Card>
  );
}
