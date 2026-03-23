import { Center } from '@components/ds/atoms/center';
import { HStack } from '@components/ds/atoms/hstack';

export function TerminalHeader() {
  return (
    <HStack
      gap="xs"
      innerSpaceX="sm"
      innerSpaceY="xs"
      bg="black"
      rounded="md"
    >
      <Center
        size="xs"
        rounded="full"
        bg="destructive"
      />
      <Center
        size="xs"
        rounded="full"
        bg="muted"
      />
      <Center
        size="xs"
        rounded="full"
        bg="primary"
      />
    </HStack>
  );
}
