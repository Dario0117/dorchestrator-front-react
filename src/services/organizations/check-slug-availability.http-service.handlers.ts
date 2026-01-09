import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

type CheckSlugResponse = {
  available: boolean;
};

export const checkSlugAvailabilityHandler = http.post(
  buildBackendUrl('/api/v1/organization/check-slug'),
  async ({ request }) => {
    const body = (await request.json()) as { slug: string };

    // For testing, consider any slug containing 'taken' as unavailable
    // Return 409 Conflict when slug is taken (better-auth will treat this as an error)
    const isTaken = body.slug.includes('taken');

    if (isTaken) {
      return HttpResponse.json(
        { message: 'Slug is already taken' },
        { status: 409 },
      );
    }

    const data: CheckSlugResponse = {
      available: true,
    };

    return HttpResponse.json(data);
  },
);
