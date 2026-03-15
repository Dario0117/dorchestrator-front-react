import { CommandFormInner } from '@components/commands/forms/command-form-inner';
import type { CommandFormType } from '@components/commands/forms/hooks/use-command-form';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useCurrentTeam } from '@hooks/use-current-team';
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
  const currentTeam = useCurrentTeam();
  const { data } = useDevicesSuspenseQuery(
    currentOrganization.id,
    // biome-ignore lint/style/noNonNullAssertion: Team is always defined in team-scoped routes (validated in route loader)
    currentTeam!.id,
    1,
    100,
  );
  const devices = data.responseData?.results || [];

  return (
    <CommandFormInner
      form={form}
      devices={devices}
      onCancel={onCancel}
    />
  );
}
