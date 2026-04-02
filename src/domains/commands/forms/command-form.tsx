import type { SandboxState } from '@domains/commands/forms/command-form.types';
import { CommandFormInner } from '@domains/commands/forms/command-form-inner';
import { CommandFormWithDeviceQuery } from '@domains/commands/forms/command-form-with-device-query';
import type { CommandFormType } from '@domains/commands/forms/hooks/use-command-form';
import type { PinnedDevice } from '@domains/commands/modals/execute-command-modal';

interface CommandFormProps {
  form: CommandFormType;
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
  onDeviceChange?: (deviceId: number) => void;
  sandbox?: SandboxState;
}

export function CommandForm({
  form,
  pinnedDevice,
  onCancel,
  onDeviceChange,
  sandbox,
}: CommandFormProps) {
  if (pinnedDevice) {
    return (
      <CommandFormInner
        form={form}
        devices={[]}
        pinnedDevice={pinnedDevice}
        onCancel={onCancel}
        sandbox={sandbox}
      />
    );
  }

  return (
    <CommandFormWithDeviceQuery
      form={form}
      onCancel={onCancel}
      onDeviceChange={onDeviceChange}
      sandbox={sandbox}
    />
  );
}
