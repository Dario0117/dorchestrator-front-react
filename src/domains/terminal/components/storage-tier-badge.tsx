import { Badge } from '@components/ds/atoms/badge';
import { badgeStyles } from '@lib/badge-styles';

const TIER_BADGE_STYLES = {
  hot: badgeStyles.green,
  cold: badgeStyles.blue,
  restoring: badgeStyles.yellow,
} as const;

export function StorageTierBadge({ tier }: { tier: string | null }) {
  const style =
    TIER_BADGE_STYLES[tier as keyof typeof TIER_BADGE_STYLES] ??
    badgeStyles.gray;
  return (
    <Badge
      variant="outline"
      className={style}
    >
      {tier ?? 'unknown'}
    </Badge>
  );
}
