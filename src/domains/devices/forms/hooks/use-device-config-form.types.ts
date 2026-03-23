import type { useUpdateDeviceConfigMutationType } from '@domains/terminal/services/update-device-config.http-service';

export interface UseDeviceConfigFormProps {
  updateConfigMutation: useUpdateDeviceConfigMutationType;
  organizationId: string;
  deviceId: number;
  defaultValues: {
    inactivityTimeoutMinutes: number | string;
    hardCapHours: number | string;
    defaultWorkingDirectory: string;
  };
  handleSuccess: () => void;
}
