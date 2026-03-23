import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ResetPasswordRequestBody =
  operations['resetPassword']['requestBody']['content']['application/json'];
type ResetPasswordSuccessResponse =
  operations['resetPassword']['responses']['200']['content']['application/json'];

export const updatePasswordHandler = http.post<
  never,
  ResetPasswordRequestBody,
  ResetPasswordSuccessResponse
>(buildBackendUrl('/api/v1/reset-password'), () => {
  return HttpResponse.json({
    status: true,
  });
});
