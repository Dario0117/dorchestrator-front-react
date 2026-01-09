import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

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
