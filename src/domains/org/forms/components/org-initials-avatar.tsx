import { Center } from '@components/ds/atoms/center';

interface OrgInitialsAvatarProps {
  initials: string;
}

export function OrgInitialsAvatar({ initials }: OrgInitialsAvatarProps) {
  return (
    <Center
      size="xl"
      rounded="full"
      bg="primary"
      textSize="4xl"
    >
      {initials}
    </Center>
  );
}
