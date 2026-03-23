import { Badge } from '@components/ds/atoms/badge';
import type { TerminalSessionListItem } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { badgeStyles } from '@lib/badge-styles';

const STATUS_BADGE_STYLES = {
  active: badgeStyles.green,
  created: badgeStyles.blue,
  locked: badgeStyles.yellow,
  terminated: badgeStyles.gray,
} as const;

export function SessionStatusBadge({
  status,
}: {
  status: TerminalSessionListItem['status'];
}) {
  return (
    <Badge
      variant="outline"
      className={STATUS_BADGE_STYLES[status]}
    >
      {status}
    </Badge>
  );
}
