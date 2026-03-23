import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { TerminalConfigForm } from '@domains/terminal/forms/terminal-config.form';
import { useGetTerminalConfigSuspenseQuery } from '@domains/terminal/services/get-terminal-config.http-service';
import { useUpdateTerminalConfigMutation } from '@domains/terminal/services/update-terminal-config.http-service';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

export function TerminalConfigSection() {
  const currentOrganization = useCurrentOrganization();
  const { data: configData } = useGetTerminalConfigSuspenseQuery(
    currentOrganization.id,
  );
  const updateConfigMutation = useUpdateTerminalConfigMutation();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

  const config = configData.responseData?.results;
  const inactivityTimeoutMinutes = config
    ? Math.round(config.inactivityTimeoutMs / MS_PER_MINUTE)
    : 60;
  const hardCapHours =
    config?.hardCapMs != null ? Math.round(config.hardCapMs / MS_PER_HOUR) : '';

  return (
    <div className="space-y-4">
      {showSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Terminal configuration updated successfully.
          </AlertDescription>
        </Alert>
      )}
      <TerminalConfigForm
        updateConfigMutation={updateConfigMutation}
        organizationId={currentOrganization.id}
        defaultValues={{
          inactivityTimeoutMinutes,
          hardCapHours,
        }}
        handleSuccess={() => {
          clearTimeout(successTimeoutRef.current);
          setShowSuccess(true);
          successTimeoutRef.current = setTimeout(
            () => setShowSuccess(false),
            5000,
          );
        }}
      />
    </div>
  );
}
