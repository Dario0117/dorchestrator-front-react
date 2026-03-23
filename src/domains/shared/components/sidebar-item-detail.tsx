import { Stack } from '@components/ds/atoms/stack';
import type { ReactNode } from 'react';

interface SidebarItemDetailProps {
  children: ReactNode;
}

function SidebarItemDetail({ children }: SidebarItemDetailProps) {
  return (
    <Stack
      gap="none"
      grow
      textSize="sm"
      textAlign="left"
      leading="tight"
    >
      {children}
    </Stack>
  );
}

export { SidebarItemDetail };
