# Testing

## General Rules

- Unit and integration tests only — no e2e tests
- Co-located test files: `[filename].test.ts` or `[filename].test.tsx` alongside source
- Target >85% coverage per component, aim for 100% — applies to `components/ds/`, `components/layout/`, and domain components. Does not apply to `components/ui/` (shadcn-managed)
- Vitest globals are enabled — don't import from `vitest`
- Test wrappers: use `renderWithProviders()` and `createQueryThemeWrapper()` from `@lib/test-wrappers.utils.tsx` — never create new wrappers, update existing ones if needed
- MSW handlers aggregated in `@lib/test.utils.ts` via `MSWSuccessHandlers()`
- Global setup in `testsSetup.ts`
- Don't test CSS classes or Tailwind directives — test behavior on user interactions

## What NOT to Test

- TypeScript types
- Zod schemas (in `**/validation/` folders)
- HTTP service files (`*.http-service.ts`) unless they have custom logic beyond query/mutation exposure — create the test file with a comment explaining no meaningful logic exists
- Exceptions without custom code (simple wrappers extending base exceptions)
- shadcn components in `components/ui/` — these are third-party managed. We test our ds/ wrappers instead, which exercise the shadcn internals we actually use. Don't enforce coverage on `components/ui/` directly.

## Mocking Rules

- Only mock external HTTP requests using MSW
- Never mock internal modules, functions, or components
- Use real implementations for everything internal

## Test Writing

- Write tests after implementation is complete, then run quality checks
- Don't introduce new warnings or errors in tests — fix immediately
- When testing composed components, test the inner component in isolation. If the outer component (e.g., `login.page.tsx`) is just a wrapper, create its test file with a comment noting the internals are tested separately. Re-evaluate this whenever the outer component changes.
- When asked to fix or add tests: accommodate the tests to match the code, never change the tested code

## Clicking Interactive Elements (act warnings)

Use `clickTrigger(element)` from `@lib/test-wrappers.utils` instead of `userEvent.click()` or raw `element.click()` when clicking any element that triggers asynchronous state updates in Base UI components (Select triggers, dropdown triggers, dialog openers, buttons that fire mutations affecting `disabled`/`isPending` on sibling components, etc.).

`clickTrigger` wraps `fireEvent.click` inside `act()` with a microtask flush, ensuring floating-ui position calculations and React state updates settle before the assertion phase. Without it, Base UI's async internals cause "not wrapped in act(...)" warnings.

```typescript
import { clickTrigger } from '@lib/test-wrappers.utils';

// Correct — no act warnings
await clickTrigger(screen.getByRole('button', { name: 'Save' }));
await clickTrigger(screen.getByRole('combobox'));

// Incorrect — produces act warnings with Base UI components
await user.click(screen.getByRole('button', { name: 'Save' }));
trigger.click();
```

For selecting an option in a Base UI Select, use `selectOption(trigger, optionName)` which handles the full open → select → close lifecycle.

## Coverage Workflow

Run `mise run coverageForAgents`, then find untested files:

```bash
jq -r 'first(to_entries[] | select(any(.value.s[]; . == 0)) | .value)' coverage/coverage-final.json
```

Add tests for that file, then repeat.
