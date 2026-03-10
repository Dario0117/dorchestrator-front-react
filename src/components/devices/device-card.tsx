import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { cn } from '@lib/utils';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';
import {
  Laptop,
  Monitor,
  Play,
  Settings,
  Terminal,
  Trash2,
} from 'lucide-react';

interface DeviceCardProps {
  device: ListDevicesDevice;
  onRemove: (deviceId: number) => void;
  onExecuteCommand: (deviceId: number) => void;
  onOpenTerminal: (deviceId: number) => void;
  onConfigure?: (deviceId: number) => void;
}

export function DeviceCard({
  device,
  onRemove,
  onExecuteCommand,
  onOpenTerminal,
  onConfigure,
}: DeviceCardProps) {
  const getStatusIndicator = () => {
    if (!device.lastSeenAt) {
      return {
        color: 'bg-red-500',
        borderColor: 'border-l-red-500',
        text: 'Never connected',
      };
    }

    const lastSeen = new Date(device.lastSeenAt);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastSeen.getTime()) / 1000;

    if (diffSeconds < 30) {
      return {
        color: 'bg-green-500',
        borderColor: 'border-l-green-500',
        text: 'Online',
      };
    }

    return {
      color: 'bg-gray-500',
      borderColor: 'border-l-gray-400',
      text: 'Offline',
    };
  };

  const formatLastSeen = () => {
    if (!device.lastSeenAt) {
      return 'Never';
    }

    const lastSeen = new Date(device.lastSeenAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / 60000,
    );

    if (diffMinutes < 1) {
      return 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }

    // Format as "Dec 21, 10:30 AM"
    return lastSeen.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPlatformIcon = () => {
    switch (device.platform) {
      case 'macos':
        return Laptop;
      default:
        return Monitor;
    }
  };

  const getPlatformLabel = () => {
    switch (device.platform) {
      case 'linux':
        return 'Linux';
      case 'macos':
        return 'macOS';
      case 'windows':
        return 'Windows';
      default:
        return device.platform;
    }
  };

  const status = getStatusIndicator();
  const PlatformIcon = getPlatformIcon();

  return (
    <Card className={cn('border-l-4 hover:shadow-md', status.borderColor)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{device.deviceName}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ID: {device.id}
            </p>
          </div>
          <Badge>
            <PlatformIcon className="mr-1 h-3 w-3" />
            {getPlatformLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${status.color}`} />
          <span className="text-sm text-muted-foreground">{status.text}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Last seen: {formatLastSeen()}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenTerminal(device.id)}
        >
          <Terminal className="mr-2 h-4 w-4" />
          Open Terminal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExecuteCommand(device.id)}
        >
          <Play className="mr-2 h-4 w-4" />
          Execute Command
        </Button>
        {onConfigure && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(device.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(device.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
