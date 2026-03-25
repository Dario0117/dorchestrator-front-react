import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { StatusDot } from '@components/ds/atoms/status-dot';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { formatRelativeTime } from '@lib/format-relative-time';
import { Play, Settings, Terminal, Trash2 } from 'lucide-react';

const ONLINE_THRESHOLD_MS = 30_000;

interface DeviceCardProps {
  device: ListDevicesDevice;
  onRemove: (deviceId: number) => void;
  onExecuteCommand: (deviceId: number) => void;
  onOpenTerminal: (deviceId: number) => void;
  onConfigure?: (deviceId: number) => void;
}

function getDeviceStatus(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return {
      status: 'offline' as const,
      text: 'Never connected',
      isOnline: false,
    };
  }

  const lastSeen = new Date(lastSeenAt);
  const diffMs = Date.now() - lastSeen.getTime();

  if (diffMs < ONLINE_THRESHOLD_MS) {
    return { status: 'online' as const, text: 'Online', isOnline: true };
  }

  return { status: 'offline' as const, text: 'Offline', isOnline: false };
}

function getPlatformLabel(platform: string) {
  switch (platform) {
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'macOS';
    case 'windows':
      return 'Windows';
    default:
      return platform;
  }
}

export function DeviceCard({
  device,
  onRemove,
  onExecuteCommand,
  onOpenTerminal,
  onConfigure,
}: DeviceCardProps) {
  const deviceStatus = getDeviceStatus(device.lastSeenAt);

  return (
    <Card interactive>
      <CardHeader>
        <HStack justify="between">
          <HStack gap="sm">
            <StatusDot
              status={deviceStatus.status}
              aria-label={deviceStatus.text}
            />
            <CardTitle size="lg">{device.deviceName}</CardTitle>
          </HStack>
          <Badge colorScheme="neutral">
            {getPlatformLabel(device.platform)}
          </Badge>
        </HStack>
        <SmallParagraph
          mono
          spaceAbove="xs"
        >
          ID: {device.id}
        </SmallParagraph>
      </CardHeader>
      <CardContent>
        <HStack gap="sm">
          <SecondaryText>{deviceStatus.text}</SecondaryText>
        </HStack>
        {!deviceStatus.isOnline && device.lastSeenAt && (
          <SmallParagraph spaceAbove="sm">
            Last seen: {formatRelativeTime(device.lastSeenAt)}
          </SmallParagraph>
        )}
        {!device.lastSeenAt && (
          <SmallParagraph spaceAbove="sm">Last seen: Never</SmallParagraph>
        )}
      </CardContent>
      <CardFooter>
        <Grid
          autoFill="sm"
          gap="sm"
          fullWidth
        >
          <Button
            variant="outline"
            size="sm"
            fullWidth
            disabled={!deviceStatus.isOnline}
            onClick={() => onOpenTerminal(device.id)}
          >
            <Terminal className="mr-2 h-4 w-4" />
            Terminal
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onExecuteCommand(device.id)}
          >
            <Play className="mr-2 h-4 w-4" />
            Command
          </Button>
          <HStack gap="sm">
            {onConfigure && (
              <Button
                variant="outline"
                size="sm"
                grow
                onClick={() => onConfigure(device.id)}
                aria-label="Configure device"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              grow
              onClick={() => onRemove(device.id)}
              aria-label="Remove device"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </HStack>
        </Grid>
      </CardFooter>
    </Card>
  );
}
