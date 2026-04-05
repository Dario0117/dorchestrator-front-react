import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { SandboxConfigForm } from '@domains/sandbox/forms/sandbox-config.form';
import { useCreateSandboxPresetMutation } from '@domains/sandbox/services/create-sandbox-preset.http-service';
import type { SandboxPresetItem } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import type { SandboxTypeItem } from '@domains/sandbox/services/list-sandbox-types.http-service';
import { useUpdateSandboxPresetMutation } from '@domains/sandbox/services/update-sandbox-preset.http-service';

interface SandboxPresetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  preset: SandboxPresetItem | null;
  sandboxTypes: SandboxTypeItem[];
}

export function SandboxPresetFormDialog({
  open,
  onOpenChange,
  organizationId,
  preset,
  sandboxTypes,
}: SandboxPresetFormDialogProps) {
  const createMutation = useCreateSandboxPresetMutation(organizationId);
  const updateMutation = useUpdateSandboxPresetMutation(organizationId);

  const isEditing = preset !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Preset' : 'Create Preset'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the "${preset.name}" sandbox preset configuration.`
              : 'Configure a new sandbox preset for your organization.'}
          </DialogDescription>
        </DialogHeader>
        <SandboxConfigForm
          mode={isEditing ? 'edit' : 'create'}
          createMutation={createMutation}
          updateMutation={updateMutation}
          organizationId={organizationId}
          presetId={preset?.id}
          defaultValues={
            preset
              ? {
                  name: preset.name,
                  description: preset.description ?? '',
                  requiresApproval: preset.requiresApproval,
                  sandboxTypeId: preset.sandboxTypeId,
                  networkMode: preset.networkPolicy?.mode,
                  image: (preset.providerConfig?.image as string) ?? undefined,
                  maxTimeoutMs:
                    preset.resourceLimits?.maxTimeoutMs ?? undefined,
                  maxOutputSize:
                    preset.resourceLimits?.maxOutputSize ?? undefined,
                  pidsLimit: preset.resourceLimits?.pidsLimit ?? undefined,
                  allowExternal: preset.networkPolicy?.allow?.external,
                  allowLocal: preset.networkPolicy?.allow?.local,
                  denyExternal: preset.networkPolicy?.deny?.external,
                  denyLocal: preset.networkPolicy?.deny?.local,
                }
              : undefined
          }
          handleSuccess={() => {
            onOpenChange(false);
          }}
          sandboxTypes={sandboxTypes}
        />
      </DialogContent>
    </Dialog>
  );
}
