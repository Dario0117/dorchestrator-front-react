const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;

/**
 * Compact format: "500ms", "45s", "5m 30s", "2h 15m"
 * Used for displaying elapsed durations in tables/cards.
 */
export function formatDurationCompact(ms: number): string {
  if (ms < MS_PER_SECOND) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / MS_PER_SECOND);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Human-readable format: "30 minutes", "2 hours", "1h 30m"
 * Used for displaying timeout/ceiling values in forms.
 */
export function formatDurationHuman(ms: number): string {
  const totalMinutes = Math.round(ms / MS_PER_MINUTE);
  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Computes duration between two timestamps and formats it compactly.
 * Returns null if either timestamp is missing.
 */
export function formatDurationBetween(
  startedAt: string | null,
  completedAt: string | null,
): string | null {
  if (!startedAt || !completedAt) {
    return null;
  }
  const durationMs =
    new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return formatDurationCompact(durationMs);
}
