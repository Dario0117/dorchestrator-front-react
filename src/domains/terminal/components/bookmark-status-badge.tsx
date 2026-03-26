import { Badge } from '@components/ds/atoms/badge';
import type { TerminalSessionStatus } from '@domains/terminal/services/list-terminal-sessions.http-service.constants';
import type { BadgeStyle } from '@lib/badge-styles';

const STATUS_COLOR_SCHEMES: Record<TerminalSessionStatus, BadgeStyle> = {
  active: 'success',
  created: 'info',
  locked: 'warning',
  terminated: 'neutral',
};

export function BookmarkStatusBadge({ status }: { status: string }) {
  const colorScheme =
    STATUS_COLOR_SCHEMES[status as TerminalSessionStatus] ?? 'neutral';
  return (
    <Badge
      variant="outline"
      colorScheme={colorScheme}
    >
      {status}
    </Badge>
  );
}
