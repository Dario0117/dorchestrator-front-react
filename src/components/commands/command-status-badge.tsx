import { Badge } from '@components/ui/badge';

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'secondary' },
  running: {
    label: 'Running',
    className: 'bg-blue-500 text-white border-transparent',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-600 text-white border-transparent',
  },
  failed: { label: 'Failed', variant: 'destructive' },
} as const;

interface CommandStatusBadgeProps {
  status: string;
}

export function CommandStatusBadge({ status }: CommandStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  if ('variant' in config) {
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return <Badge className={config.className}>{config.label}</Badge>;
}
