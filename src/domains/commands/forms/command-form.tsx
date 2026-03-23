import { CommandFormInner } from '@domains/commands/forms/command-form-inner';
import { CommandFormWithDeviceQuery } from '@domains/commands/forms/command-form-with-device-query';
import type { CommandFormType } from '@domains/commands/forms/hooks/use-command-form';
import type { PinnedDevice } from '@domains/commands/modals/execute-command-modal';

interface CommandFormProps {
  form: CommandFormType;
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
}

export function CommandForm({
  form,
  pinnedDevice,
  onCancel,
}: CommandFormProps) {
  if (pinnedDevice) {
    return (
      <CommandFormInner
        form={form}
        devices={[]}
        pinnedDevice={pinnedDevice}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CommandFormWithDeviceQuery
      form={form}
      onCancel={onCancel}
    />
  );
}
