import { Badge } from '@components/ui/badge';
import { badgeStyles } from '@lib/badge-styles';

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: badgeStyles.green,
  created: badgeStyles.blue,
  locked: badgeStyles.yellow,
  terminated: badgeStyles.gray,
};

export function BookmarkStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_BADGE_STYLES[status] ?? badgeStyles.gray}
    >
      {status}
    </Badge>
  );
}
