import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

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
