import { Center } from '@components/ds/atoms/center';
import { Skeleton } from '@components/ds/atoms/skeleton';
import { Stack } from '@components/ds/atoms/stack';

export function SharedSessionPageSkeleton() {
  return (
    <Center fullHeight>
      <Stack
        gap="lg"
        textAlign="center"
      >
        <Skeleton
          centered
          h="2rem"
          w="12rem"
        />
        <Skeleton
          centered
          h="1rem"
          w="16rem"
        />
      </Stack>
    </Center>
  );
}
