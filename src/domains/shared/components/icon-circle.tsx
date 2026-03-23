import { Center } from '@components/ds/atoms/center';
import type { ReactNode } from 'react';

interface IconCircleProps {
  children: ReactNode;
}

export function IconCircle({ children }: IconCircleProps) {
  return (
    <Center
      size="lg"
      rounded="full"
      bg="muted"
      spaceX="auto"
    >
      {children}
    </Center>
  );
}
