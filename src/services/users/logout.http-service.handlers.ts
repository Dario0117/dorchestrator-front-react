import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

type SignOutResponse = {
  success: boolean;
};

export const logoutHandler = http.post(
  buildBackendUrl('/api/v1/sign-out'),
  () => {
    const data: SignOutResponse = {
      success: true,
    };
    return HttpResponse.json(data);
  },
);
