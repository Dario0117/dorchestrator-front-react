import { Badge } from '@components/ds/atoms/badge';
import type { ReactNode } from 'react';

export function NavBadge({ children }: { children: ReactNode }) {
  return <Badge compact>{children}</Badge>;
}
