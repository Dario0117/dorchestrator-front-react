import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

type PasswordResetRequestResponse = {
  status: boolean;
  message: string;
};

export const resetPasswordHandler = http.post(
  buildBackendUrl('/api/v1/request-password-reset'),
  () => {
    const data: PasswordResetRequestResponse = {
      status: true,
      message: 'Password reset email sent',
    };
    return HttpResponse.json(data);
  },
);
