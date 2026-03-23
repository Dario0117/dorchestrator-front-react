import { Badge } from '@components/ds/atoms/badge';
import type { BadgeStyle } from '@lib/badge-styles';

const STATUS_COLOR_SCHEMES: Record<string, BadgeStyle> = {
  active: 'success',
  created: 'info',
  locked: 'warning',
  terminated: 'neutral',
};

export function BookmarkStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      colorScheme={STATUS_COLOR_SCHEMES[status] ?? 'neutral'}
    >
      {status}
    </Badge>
  );
}
