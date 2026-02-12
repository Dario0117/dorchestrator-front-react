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

## Enums

Never use TypeScript enums. Use `as const` objects or constant variables instead.
