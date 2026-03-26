import { Skeleton } from '@components/ds/atoms/skeleton';
import { Stack } from '@components/ds/atoms/stack';

export function DeviceConfigDialogSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton
        h="2.5rem"
        w="100%"
      />
      <Skeleton
        h="2.5rem"
        w="100%"
      />
      <Skeleton
        h="2.5rem"
        w="100%"
      />
    </Stack>
  );
}
