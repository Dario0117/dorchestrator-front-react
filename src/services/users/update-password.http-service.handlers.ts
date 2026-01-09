import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

type PasswordResetResponse = {
  status: boolean;
};

export const updatePasswordHandler = http.post(
  buildBackendUrl('/api/v1/reset-password'),
  () => {
    const data: PasswordResetResponse = {
      status: true,
    };
    return HttpResponse.json(data);
  },
);
