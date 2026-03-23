import { CommandFormInner } from '@domains/commands/forms/command-form-inner';
import type { CommandFormType } from '@domains/commands/forms/hooks/use-command-form';
import { useDevicesSuspenseQuery } from '@domains/devices/services/list-devices.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';

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
