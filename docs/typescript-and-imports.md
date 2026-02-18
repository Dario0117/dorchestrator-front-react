# TypeScript & Imports

## Import Rules

**Relative imports are strictly forbidden.** All imports must use path aliases:

| Alias | Maps to |
|---|---|
| `@components/*` | `/src/components/*` |
| `@services/*` | `/src/services/*` |
| `@hooks/*` | `/src/hooks/*` |
| `@lib/*` | `/src/lib/*` |
| `@context/*` | `/src/context/*` |
| `@stores/*` | `/src/stores/*` |
| `@/types/*` | `/src/types/*` (use `@/` prefix to avoid conflicts) |
| `@routes/*` | `/src/routes/*` |
| `@assets/*` | `/src/assets/*` |
| `@/*` | `/src/*` (fallback) |

```typescript
// Correct
import { Button } from '@components/ui/button';
import { useLogin } from '@services/users/login.http-service';
import { cn } from '@lib/utils';
import App from '@/app';

// Forbidden
import { Button } from './ui/button';
import { Button } from '../ui/button';
```

## Type Conventions

- Never add explicit return types — always let TypeScript infer
- Types go in `[filename].types.ts` alongside the source file
- Exception: `*.http-service.ts` files keep their types inline (in the service file)
- Shared types go in a `*.types.ts` in the global `types/` folder
- Zod schemas infer types automatically — don't duplicate type definitions
- Service hooks export their return type: `export type useLoginMutationType = ReturnType<typeof useLoginMutation>`
- When fixing TS issues: don't create new types if they were intentionally deleted

## Constants

- Place in `[filename].constants.ts` alongside the source file
- Shared constants go in a global `constants/` folder
- No magic values — always create a named constant

## API-Derived Types

**Never hardcode types, unions, or values that originate from the backend API.** Always derive them from the generated OpenAPI types in `@/types/api.generated.types`.

This applies to:
- Service param interfaces (e.g., status enums, action enums, resource types)
- Zod schemas in route files that validate API enum values
- Component constants/configs keyed by API enum values (e.g., status badge configs, filter options)
- Type assertions or casts to API union types

**Pattern:** Service files derive param types from `operations`. Shared constants and type aliases live in `[service].constants.ts` alongside the service file. Consumers import from the constants file.

```typescript
// In service file (list-commands.http-service.ts) — derive param types inline
import type { operations } from '@/types/api.generated.types';
type CommandsQuery = operations['getApiV1ByOrganizationIdCommands']['parameters']['query'];

export interface CommandsQueryParams {
  status?: CommandsQuery['status'];
}

// In constants file (list-commands.http-service.constants.ts) — shared types + runtime arrays
import type { CommandsQueryParams } from '@services/commands/list-commands.http-service';

export type CommandStatus = NonNullable<CommandsQueryParams['status']>;
export const COMMAND_STATUSES = ['pending', 'running', 'completed', 'failed'] as const satisfies readonly CommandStatus[];

// In route file — import constants for Zod schemas
import { COMMAND_STATUSES } from '@services/commands/list-commands.http-service.constants';
status: z.enum(COMMAND_STATUSES).optional().catch(undefined),

// In component file — import type for config objects
import type { CommandStatus } from '@services/commands/list-commands.http-service.constants';
const STATUS_CONFIG = { ... } as const satisfies Record<CommandStatus, { label: string }>;

// Forbidden — hardcoded union that duplicates API types
status?: 'pending' | 'running' | 'completed' | 'failed';
status: z.enum(['pending', 'running', 'completed', 'failed']);
status: status as 'pending' | 'running' | 'completed' | 'failed' | undefined;
```

## Enums

Never use TypeScript enums. Use `as const` objects or constant variables instead.
