import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type SetDefaultTeamSuccessResponse =
  paths['/api/v1/organizations/default-team']['put']['responses']['200']['content']['application/json'];

export const setDefaultTeamHandler = http.put<
  never,
  never,
  SetDefaultTeamSuccessResponse
>(buildBackendUrl('/api/v1/organizations/default-team'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['Default team updated'],
    },
    responseErrors: null,
  });
});
