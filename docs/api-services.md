# API Services & MSW Handlers

## One Request Per File

Each API endpoint gets two files:
- `src/services/[domain]/[action-description].http-service.ts` — service file
- `src/services/[domain]/[action-description].http-service.handlers.ts` — MSW handler file

### Service File Contains

- A single hook: `$api.useMutation()`, `$api.useQuery()`, or TanStack Query hooks
- Query options if applicable
- All related type exports (e.g., `export type useLoginMutationType = ReturnType<typeof useLoginMutation>`)

### Handler File Contains

- A single MSW handler with a descriptive export name (e.g., `loginHandler`)
- All handlers aggregated in `src/lib/test.utils.ts` via `MSWSuccessHandlers()`

## MSW Handler Typing

All handlers MUST use types from `@/types/api.generated.types.ts` via the `operations` interface. Never use inline hardcoded types.

```typescript
import type { operations } from '@/types/api.generated.types';

// Extract types from operations
type SignInRequestBody = operations['signInEmail']['requestBody']['content']['application/json'];
type SignInSuccessResponse = operations['signInEmail']['responses']['200']['content']['application/json'];

// POST — http.post<PathParams, RequestBody, ResponseBody>
export const loginHandler = http.post<never, SignInRequestBody, SignInSuccessResponse>(
  buildBackendUrl('/api/v1/sign-in/email'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ... });
  }
);

// GET with path params
type OrgPathParams = operations['getApiV1ByOrganizationIdOrganization']['parameters']['path'];
type OrgResponse = operations['getApiV1ByOrganizationIdOrganization']['responses']['200']['content']['application/json'];

export const getOrgHandler = http.get<OrgPathParams, never, OrgResponse>(
  buildBackendUrl('/api/v1/:organizationId/organization'),
  ({ params }) => {
    const { organizationId } = params;
    return HttpResponse.json({ ... });
  }
);

// Error responses
type SignInErrorResponse = operations['signInEmail']['responses']['400']['content']['application/json'];
return HttpResponse.json<SignInErrorResponse>({ message: 'Invalid credentials' }, { status: 400 });
```

## Examples

- `users/login.http-service.ts` + `users/login.http-service.handlers.ts`
- `organizations/create-organization.http-service.ts` + `organizations/create-organization.http-service.handlers.ts`
- `devices/list-devices.http-service.ts` + `devices/list-devices.http-service.handlers.ts`
