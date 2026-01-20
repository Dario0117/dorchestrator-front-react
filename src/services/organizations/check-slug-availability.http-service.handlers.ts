import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type CheckSlugRequestBody =
  paths['/api/v1/organization/check-slug']['post']['requestBody']['content']['application/json'];

// The OpenAPI schema doesn't define a 200 response for this endpoint,
// but the actual API returns { status: true } on success
type CheckSlugSuccessResponse = {
  status: boolean;
};

export const checkSlugAvailabilityHandler = http.post<
  never,
  CheckSlugRequestBody,
  CheckSlugSuccessResponse
>(buildBackendUrl('/api/v1/organization/check-slug'), async ({ request }) => {
  const body = await request.json();

  // For testing, consider any slug containing 'taken' as unavailable
  // Return 409 Conflict when slug is taken (better-auth will treat this as an error)
  const isTaken = body.slug.includes('taken');

  if (isTaken) {
    return HttpResponse.json({ message: 'Slug is already taken' } as never, {
      status: 409,
    });
  }

  return HttpResponse.json({
    status: true,
  });
});
