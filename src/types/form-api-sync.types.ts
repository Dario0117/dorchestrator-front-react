import type { operations } from '@/types/api.generated.types';

// Compile-time utilities for asserting form schemas match API contracts.
// Usage in schema files:
//
//   export type FormApiSync = Expect<IsExact<MyFormData, MyApiRequestBody>>;
//
// If the types diverge, TypeScript will error:
//   "Type 'false' does not satisfy the constraint 'true'"

export type IsExact<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

export type Expect<T extends true> = T;

export type ApiRequestBody<Op extends keyof operations> =
  operations[Op] extends {
    requestBody: { content: { 'application/json': infer B } };
  }
    ? B
    : never;
