import { Badge } from '@components/ds/atoms/badge';
import type { CommandStatus } from '@domains/commands/services/list-commands.http-service.constants';
import type { BadgeStyle } from '@lib/badge-styles';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    colorScheme: 'warning' as BadgeStyle,
  },
  running: {
    label: 'Running',
    icon: Loader2,
    colorScheme: 'info' as BadgeStyle,
    iconClassName: 'animate-spin',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    colorScheme: 'success' as BadgeStyle,
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
    colorScheme?: BadgeStyle;
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
    <Badge colorScheme={config.colorScheme}>
      <Icon
        className={`mr-1 h-3 w-3 ${'iconClassName' in config ? config.iconClassName : ''}`}
      />
      {config.label}
    </Badge>
  );
}
