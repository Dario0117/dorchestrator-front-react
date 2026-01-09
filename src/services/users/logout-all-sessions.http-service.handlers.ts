import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

type RevokeSessionsResponse = {
  status: boolean;
};

export const logoutAllSessionsHandler = http.post(
  buildBackendUrl('/api/v1/revoke-sessions'),
  () => {
    const data: RevokeSessionsResponse = {
      status: true,
    };
    return HttpResponse.json(data);
  },
);
