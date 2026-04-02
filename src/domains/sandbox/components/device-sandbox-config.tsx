import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Label } from '@components/ds/atoms/label';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { useClearDeviceDefaultPresetMutation } from '@domains/sandbox/services/clear-device-default-preset.http-service';
import { useListSandboxPresetsSuspenseQuery } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { useSetDeviceDefaultPresetMutation } from '@domains/sandbox/services/set-device-default-preset.http-service';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DeviceSandboxConfigProps = {
  organizationId: string;
  deviceId: number;
  effectivePresetId?: number | null;
  effectivePresetName?: string | null;
};

export function DeviceSandboxConfig({
  organizationId,
  deviceId,
  effectivePresetId,
  effectivePresetName,
}: DeviceSandboxConfigProps) {
  const { data: presetsData } =
    useListSandboxPresetsSuspenseQuery(organizationId);
  const setDefaultMutation = useSetDeviceDefaultPresetMutation();
  const clearDefaultMutation = useClearDeviceDefaultPresetMutation();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    effectivePresetId != null ? String(effectivePresetId) : '',
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

  const presets = presetsData?.responseData?.results ?? [];
  const orgDefault = presets.find((p) => p.isOrgDefault);

  const showSuccessMessage = () => {
    clearTimeout(successTimeoutRef.current);
    setShowSuccess(true);
    successTimeoutRef.current = setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleSave = () => {
    if (!selectedPresetId) {
      return;
    }
    setDefaultMutation.mutate(
      {
        body: { presetId: Number(selectedPresetId) },
        params: {
          path: {
            organizationId,
            deviceId: String(deviceId),
          },
        },
      },
      {
        onSuccess: showSuccessMessage,
      },
    );
  };

  const handleClearOverride = () => {
    clearDefaultMutation.mutate(
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
          setSelectedPresetId(orgDefault ? String(orgDefault.id) : '');
          showSuccessMessage();
        },
      },
    );
  };

  const isPending =
    setDefaultMutation.isPending || clearDefaultMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sandbox Preset</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <SmallParagraph>
            Override the organization default sandbox preset for this device.
            Leave as the org default to inherit.
          </SmallParagraph>
          {showSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Device sandbox preset updated.
              </AlertDescription>
            </Alert>
          )}
          <Stack gap="sm">
            <Label>Preset</Label>
            <Select
              value={selectedPresetId}
              onValueChange={(val) => {
                if (val !== null) {
                  setSelectedPresetId(val);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a preset">
                  {presets.find((p) => String(p.id) === selectedPresetId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem
                    key={preset.id}
                    value={String(preset.id)}
                  >
                    {preset.name}
                    {preset.isOrgDefault && ' (org default)'}
                    {preset.requiresApproval && ' - requires approval'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {effectivePresetName && (
              <SmallParagraph>
                Current effective preset: {effectivePresetName}
              </SmallParagraph>
            )}
          </Stack>
          <ResponsiveRow gap="sm">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !selectedPresetId}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearOverride}
              disabled={isPending}
            >
              Clear Override
            </Button>
          </ResponsiveRow>
        </Stack>
      </CardContent>
    </Card>
  );
}
