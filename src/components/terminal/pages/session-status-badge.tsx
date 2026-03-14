import { Badge } from '@components/ui/badge';
import { badgeStyles } from '@lib/badge-styles';
import type { TerminalSessionListItem } from '@services/terminal/list-terminal-sessions.http-service';

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
