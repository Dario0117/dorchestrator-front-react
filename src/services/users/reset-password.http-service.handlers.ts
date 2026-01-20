import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RequestPasswordResetRequestBody =
  operations['requestPasswordReset']['requestBody']['content']['application/json'];
type RequestPasswordResetSuccessResponse =
  operations['requestPasswordReset']['responses']['200']['content']['application/json'];

export const resetPasswordHandler = http.post<
  never,
  RequestPasswordResetRequestBody,
  RequestPasswordResetSuccessResponse
>(buildBackendUrl('/api/v1/request-password-reset'), () => {
  return HttpResponse.json({
    status: true,
    message: 'Password reset email sent',
  });
});
