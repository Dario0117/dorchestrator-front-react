import type { useUpdateTerminalConfigMutationType } from '@services/terminal/update-terminal-config.http-service';

export interface UseTerminalConfigFormProps {
  updateConfigMutation: useUpdateTerminalConfigMutationType;
  organizationId: string;
  defaultValues: {
    inactivityTimeoutMinutes: number | string;
    hardCapHours: number | string;
  };
  handleSuccess: () => void;
}
