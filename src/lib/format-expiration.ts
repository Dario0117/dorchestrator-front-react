function formatTimeRemaining(diffMs: number) {
  if (diffMs <= 0) {
    return '0m';
  }
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(' ');
}

export function formatExpirationDate(date: string, locale?: string) {
  const d = new Date(date);
  const formatted = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  const remaining = formatTimeRemaining(d.getTime() - Date.now());
  return `${formatted} (${remaining})`;
}
