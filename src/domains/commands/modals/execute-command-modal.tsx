import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { CommandForm } from '@domains/commands/forms/command-form';
import { useCommandForm } from '@domains/commands/forms/hooks/use-command-form';
import { useSubmitCommandMutation } from '@domains/commands/services/submit-command.http-service';
import { useDeviceSandboxConfigQueryOptions } from '@domains/sandbox/services/get-device-sandbox-config.http-service';
import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { useRequestSandboxOverrideMutation } from '@domains/sandbox/services/request-sandbox-override.http-service';
import type { ApprovalRequestType } from '@domains/sandbox/services/sandbox.http-service.constants';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface PinnedDevice {
  id: number;
  name: string;
}

interface ExecuteCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  teamId: string;
  pinnedDevice?: PinnedDevice;
}

export function ExecuteCommandModal({
  open,
  onOpenChange,
  organizationId,
  teamId,
  pinnedDevice,
}: ExecuteCommandModalProps) {
  const submitCommandMutation = useSubmitCommandMutation();
  const requestOverrideMutation = useRequestSandboxOverrideMutation();
  const { data: presetsData } = useQuery({
    ...useListSandboxPresetsQueryOptions(organizationId),
    enabled: open,
  });
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [approvalPending, setApprovalPending] = useState(false);

  const presets = presetsData?.responseData?.results ?? [];
  const [formDeviceId, setFormDeviceId] = useState<number>(0);
  const activeDeviceId = pinnedDevice?.id ?? formDeviceId;

  const { data: sandboxConfigData } = useQuery({
    ...useDeviceSandboxConfigQueryOptions(organizationId, activeDeviceId),
    enabled: open && activeDeviceId > 0,
  });

  const effectivePresetId =
    sandboxConfigData?.responseData?.results?.presetId ?? 0;
  const activePresetId = selectedPresetId ?? effectivePresetId;
  const activePreset = presets.find((p) => p.id === activePresetId);
  const isSandboxOverride = activePreset?.requiresApproval === true;

  const form = useCommandForm({
    submitCommandMutation,
    organizationId,
    teamId,
    initialDeviceId: pinnedDevice?.id,
    sandboxPresetId: activePresetId,
    handleSuccess() {
      form.reset();
      setSelectedPresetId(null);
      setApprovalPending(false);
      onOpenChange(false);
    },
    onBeforeSubmit: isSandboxOverride
      ? (deviceId) => {
          requestOverrideMutation.mutate(
            {
              params: { path: { organizationId, teamId } },
              body: {
                deviceId,
                requestType: 'command' satisfies ApprovalRequestType,
                presetId: activePresetId,
              },
            },
            {
              onSuccess: () => {
                setApprovalPending(true);
              },
            },
          );
          return false;
        }
      : undefined,
  });

  useEffect(() => {
    form.setFieldValue('sandboxPresetId', activePresetId);
  }, [activePresetId, form]);

  const handleCancel = () => {
    form.reset();
    setSelectedPresetId(null);
    setApprovalPending(false);
    requestOverrideMutation.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute Command</DialogTitle>
          <DialogDescription>
            {pinnedDevice
              ? `Execute a command on ${pinnedDevice.name}.`
              : 'Select a device and enter the command to execute.'}
          </DialogDescription>
        </DialogHeader>
        <CommandForm
          form={form}
          pinnedDevice={pinnedDevice}
          onCancel={handleCancel}
          onDeviceChange={setFormDeviceId}
          sandbox={{
            activePresetId,
            effectivePresetId,
            isSandboxOverride,
            approvalPending,
            onPresetChange: setSelectedPresetId,
            presets,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
