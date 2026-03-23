import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { Skeleton } from '@components/ds/atoms/skeleton';

export function RecordingPlaybackSkeleton() {
  return (
    <PageSection>
      <Box innerSpaceY="lg">
        <Skeleton
          spaceBelow="lg"
          h="2rem"
          w="8rem"
        />
        <Skeleton
          spaceBelow="lg"
          h="2rem"
          w="16rem"
        />
        <Skeleton
          rounded
          h="500px"
          w="100%"
        />
        <Skeleton
          spaceAbove="md"
          rounded
          h="5rem"
          w="100%"
        />
      </Box>
    </PageSection>
  );
}
