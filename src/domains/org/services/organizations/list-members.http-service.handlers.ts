import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListMembersPathParams =
  operations['getApiV1ByOrganizationIdMembers']['parameters']['path'];
type ListMembersSuccessResponse =
  operations['getApiV1ByOrganizationIdMembers']['responses']['200']['content']['application/json'];
type ListMembersMember = NonNullable<
  ListMembersSuccessResponse['responseData']
>['results'][0];

const mockMembers: ListMembersMember[] = [
  {
    id: 'member-1',
    userId: 'user-1',
    name: 'Alice Owner',
    email: 'alice@example.com',
    role: 'owner',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'member-2',
    userId: 'user-2',
    name: 'Bob Admin',
    email: 'bob@example.com',
    role: 'admin',
    createdAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: 'member-3',
    userId: 'user-3',
    name: 'Charlie Member',
    email: 'charlie@example.com',
    role: 'member',
    createdAt: '2025-03-01T00:00:00.000Z',
  },
];

export const listMembersHandler = http.get<
  ListMembersPathParams,
  never,
  ListMembersSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/members'), ({ request }) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const size = Number.parseInt(url.searchParams.get('size') ?? '10', 10);
  const search = url.searchParams.get('search') ?? undefined;

  const role = url.searchParams.get('role') ?? undefined;

  let filtered = search
    ? mockMembers.filter(
        (m) =>
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.name.toLowerCase().includes(search.toLowerCase()),
      )
    : mockMembers;

  if (role) {
    filtered = filtered.filter((m) => m.role === role);
  }

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const results = filtered.slice(startIndex, endIndex);

  return HttpResponse.json({
    responseData: {
      results,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      totalResults,
      totalPages,
      page,
      size,
    },
    responseErrors: null,
  });
});
