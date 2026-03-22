import { Badge } from '@components/ds/atoms/badge';
import { badgeStyles } from '@lib/badge-styles';
import type { CommandStatus } from '@services/commands/list-commands.http-service.constants';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: `${badgeStyles.amber} border-transparent`,
  },
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-blue-500 text-white border-transparent animate-pulse',
    iconClassName: 'animate-spin',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-600 text-white border-transparent',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    variant: 'destructive' as const,
  },
} as const satisfies Record<
  CommandStatus,
  {
    label: string;
    icon: React.ElementType;
    className?: string;
    iconClassName?: string;
    variant?: string;
  }
>;

interface CommandStatusBadgeProps {
  status: string;
}

export function CommandStatusBadge({ status }: CommandStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  const Icon = config.icon;

  if ('variant' in config) {
    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge className={config.className}>
      <Icon
        className={`mr-1 h-3 w-3 ${'iconClassName' in config ? config.iconClassName : ''}`}
      />
      {config.label}
    </Badge>
  );
}
