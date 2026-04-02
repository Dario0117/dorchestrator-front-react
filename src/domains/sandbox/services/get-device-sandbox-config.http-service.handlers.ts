import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetDeviceSandboxConfigPathParams =
  operations['getApiV1ByOrganizationIdDevicesByDeviceIdSandboxConfig']['parameters']['path'];
type GetDeviceSandboxConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdDevicesByDeviceIdSandboxConfig']['responses']['200']['content']['application/json'];

export const getDeviceSandboxConfigHandler = http.get<
  GetDeviceSandboxConfigPathParams,
  never,
  GetDeviceSandboxConfigSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/devices/{deviceId}/sandbox/config'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          presetId: 1,
          presetName: 'Default Docker',
          sandboxTypeId: 2,
          category: 'container',
          networkPolicy: {
            mode: 'allow-all',
            allow: undefined,
            deny: undefined,
          },
          resourceLimits: {
            maxTimeoutMs: 60000,
            maxOutputSize: 2097152,
            pidsLimit: 50,
          },
          volumeMounts: [
            {
              hostPath: '/var/data/device-workspace',
              containerPath: '/workspace',
              readOnly: false,
            },
          ],
          pluginConfig: {
            image: 'dorchestrator/sandbox:latest',
          },
        },
      },
      responseErrors: null,
    });
  },
);
