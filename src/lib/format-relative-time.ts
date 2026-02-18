const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export function formatRelativeTime(date: Date | string, locale?: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - d.getTime());

  if (diffMs < DAY_MS) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (diffMs < 60_000) {
      return rtf.format(-Math.floor(diffMs / 1000), 'second');
    }
    if (diffMs < HOUR_MS) {
      return rtf.format(-Math.floor(diffMs / 60_000), 'minute');
    }
    return rtf.format(-Math.floor(diffMs / HOUR_MS), 'hour');
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}
