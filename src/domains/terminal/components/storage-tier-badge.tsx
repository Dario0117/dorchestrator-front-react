import { Badge } from '@components/ds/atoms/badge';
import type { BadgeStyle } from '@lib/badge-styles';

type StorageTier = 'hot' | 'cold' | 'restoring';

const TIER_COLOR_SCHEMES: Record<StorageTier, BadgeStyle> = {
  hot: 'success',
  cold: 'info',
  restoring: 'warning',
};

export function StorageTierBadge({ tier }: { tier: StorageTier | null }) {
  const colorScheme = tier ? TIER_COLOR_SCHEMES[tier] : 'neutral';
  return (
    <Badge
      variant="outline"
      colorScheme={colorScheme}
    >
      {tier ?? 'unknown'}
    </Badge>
  );
}

export type { StorageTier };
