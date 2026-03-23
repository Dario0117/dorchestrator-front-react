import { SmallText } from '@components/ds/atoms/small-text';

export function RequiredAsterisk() {
  return (
    <SmallText
      color="destructive"
      spaceLeft="xs"
    >
      *
    </SmallText>
  );
}
