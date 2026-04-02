import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { useDevicePluginsSuspenseQuery } from '@domains/sandbox/services/get-device-plugins.http-service';
import { useRefreshDevicePluginsMutation } from '@domains/sandbox/services/refresh-device-plugins.http-service';
import { useUninstallDevicePluginMutation } from '@domains/sandbox/services/uninstall-device-plugin.http-service';
import { useCallback, useEffect, useState } from 'react';

type DevicePluginsSectionProps = {
  organizationId: string;
  deviceId: string;
  canManage: boolean;
};

export function DevicePluginsSection({
  organizationId,
  deviceId,
  canManage,
}: DevicePluginsSectionProps) {
  const { data } = useDevicePluginsSuspenseQuery(organizationId, deviceId, {
    page: 1,
    size: 50,
  });
  const uninstallMutation = useUninstallDevicePluginMutation(
    organizationId,
    deviceId,
  );
  const refreshMutation = useRefreshDevicePluginsMutation();
  const [refreshRequested, setRefreshRequested] = useState(false);

  useEffect(() => {
    if (!refreshRequested) {
      return;
    }
    const timer = setTimeout(() => setRefreshRequested(false), 5000);
    return () => clearTimeout(timer);
  }, [refreshRequested]);

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate(
      {
        params: {
          path: {
            organizationId,
            deviceId: String(deviceId),
          },
        },
      },
      {
        onSuccess: () => {
          setRefreshRequested(true);
        },
      },
    );
  }, [refreshMutation, organizationId, deviceId]);

  const plugins = data.responseData.results;

  return (
    <Card>
      <CardHeader>
        <ResponsiveRow
          align="center"
          justify="between"
        >
          <CardTitle>Sandbox Plugins</CardTitle>
          {canManage && (
            <Stack gap="sm">
              <Button
                variant="outline"
                size="sm"
                disabled={refreshMutation.isPending}
                onClick={handleRefresh}
              >
                {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Status'}
              </Button>
              {refreshRequested && (
                <SmallText>
                  Refresh requested — you will receive a notification when it
                  completes.
                </SmallText>
              )}
            </Stack>
          )}
        </ResponsiveRow>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          {plugins.length === 0 && (
            <SmallParagraph>
              No plugins installed on this device.
            </SmallParagraph>
          )}
          {plugins.map((plugin) => (
            <ResponsiveRow
              key={plugin.sandboxTypeId}
              gap="md"
              align="center"
              justify="between"
            >
              <ResponsiveRow
                gap="sm"
                align="center"
              >
                <SmallText weight="medium">{plugin.sandboxTypeId}</SmallText>
                {plugin.status === 'failed' && (
                  <Badge variant="destructive">
                    Failed: {plugin.statusReason ?? ''}
                  </Badge>
                )}
              </ResponsiveRow>
              {canManage && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    uninstallMutation.mutate({
                      params: {
                        path: {
                          organizationId,
                          deviceId,
                          sandboxTypeId: String(plugin.sandboxTypeId),
                        },
                      },
                    })
                  }
                >
                  Uninstall
                </Button>
              )}
            </ResponsiveRow>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
