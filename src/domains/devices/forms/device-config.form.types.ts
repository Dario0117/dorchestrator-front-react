import type { useUpdateDeviceConfigMutationType } from '@domains/terminal/services/update-device-config.http-service';

export interface DeviceConfigFormProps {
  updateConfigMutation: useUpdateDeviceConfigMutationType;
  organizationId: string;
  deviceId: number;
  defaultValues: {
    inactivityTimeoutMinutes: number | string;
    hardCapHours: number | string;
    defaultWorkingDirectory: string;
  };
  orgCeiling: {
    inactivityTimeoutMinutes: number;
    hardCapHours: number | null;
  } | null;
  handleSuccess: () => void;
}
