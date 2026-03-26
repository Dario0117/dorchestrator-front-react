import { Badge } from '@components/ds/atoms/badge';
import type { RecordingStorageTier } from '@domains/terminal/services/get-recording.http-service.constants';
import type { BadgeStyle } from '@lib/badge-styles';

const TIER_COLOR_SCHEMES: Record<RecordingStorageTier, BadgeStyle> = {
  hot: 'success',
  cold: 'info',
  restoring: 'warning',
};

export function StorageTierBadge({
  tier,
}: {
  tier: RecordingStorageTier | null;
}) {
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
