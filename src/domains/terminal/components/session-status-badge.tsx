import { Badge } from '@components/ds/atoms/badge';
import type { TerminalSessionListItem } from '@domains/terminal/services/list-terminal-sessions.http-service';
import type { BadgeStyle } from '@lib/badge-styles';

const STATUS_COLOR_SCHEMES: Record<
  TerminalSessionListItem['status'],
  BadgeStyle
> = {
  active: 'success',
  created: 'info',
  locked: 'warning',
  terminated: 'neutral',
};

export function SessionStatusBadge({
  status,
}: {
  status: TerminalSessionListItem['status'];
}) {
  return (
    <Badge
      variant="outline"
      colorScheme={STATUS_COLOR_SCHEMES[status]}
    >
      {status}
    </Badge>
  );
}
