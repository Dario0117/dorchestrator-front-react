const UNITS = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) {
    return '—';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i > 0 ? 1 : 0)} ${UNITS[i]}`;
}
