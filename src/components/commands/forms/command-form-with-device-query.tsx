import { CommandFormInner } from '@components/commands/forms/command-form-inner';
import type { CommandFormType } from '@components/commands/forms/hooks/use-command-form';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useDevicesSuspenseQuery } from '@services/devices/list-devices.http-service';

interface CommandFormWithDeviceQueryProps {
  form: CommandFormType;
  onCancel?: () => void;
}

export function CommandFormWithDeviceQuery({
  form,
  onCancel,
}: CommandFormWithDeviceQueryProps) {
  const currentOrganization = useCurrentOrganization();
  const { data } = useDevicesSuspenseQuery(currentOrganization.id, 1, 100);
  const devices = data.responseData?.results || [];

  return (
    <CommandFormInner
      form={form}
      devices={devices}
      onCancel={onCancel}
    />
  );
}
