import { Badge } from '@components/ui/badge';
import type { ReactNode } from 'react';

export function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}
