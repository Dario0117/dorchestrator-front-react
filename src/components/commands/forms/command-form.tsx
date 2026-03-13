import type { PinnedDevice } from '@components/commands/execute-command-modal';
import { CommandFormInner } from '@components/commands/forms/command-form-inner';
import { CommandFormWithDeviceQuery } from '@components/commands/forms/command-form-with-device-query';
import type { CommandFormType } from '@components/commands/forms/hooks/use-command-form';

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
