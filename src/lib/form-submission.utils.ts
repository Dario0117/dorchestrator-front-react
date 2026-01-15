import { logError } from '@lib/logger.utils';
import type { UseMutationResult } from '@tanstack/react-query';
import type { z } from 'zod/v4';

export interface FormSubmissionErrors {
  form: string[];
  fields: Partial<Record<string, string>>;
}

interface FormSubmissionOptions<
  TSchema extends z.ZodTypeAny,
  TData = unknown,
  TError = Error,
  TVariables = unknown,
  TContext = unknown,
> {
  formValues: unknown;
  schema: TSchema;
  mutation: UseMutationResult<TData, TError, TVariables, TContext>;
  mapToMutationData: (validatedData: z.infer<TSchema>) => TVariables;
  handleSuccess: (data: TData) => void;
  errorContext?: string;
  customErrorHandler?: (error: TError) => FormSubmissionErrors;
}

export async function handleFormSubmission<
  TSchema extends z.ZodTypeAny,
  TData = unknown,
  TError = Error,
  TVariables = unknown,
  TContext = unknown,
>({
  formValues,
  schema,
  mutation,
  mapToMutationData,
  handleSuccess,
  errorContext = 'Form submission failed',
  customErrorHandler,
}: FormSubmissionOptions<TSchema, TData, TError, TVariables, TContext>) {
  const result = schema.safeParse(formValues);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      fieldErrors[path] = issue.message;
    }
    return {
      form: ['Please fix the errors below'],
      fields: fieldErrors,
    };
  }

  try {
    const mutationData = mapToMutationData(result.data);
    const results = await mutation.mutateAsync(mutationData);

    // Handle response that might have error/data properties (e.g., from better-auth)
    if (results && typeof results === 'object') {
      if ('error' in results && results.error) {
        throw results.error;
      }
      if ('data' in results) {
        handleSuccess(results.data as TData);
        return;
      }
    }

    // Handle direct data response
    if (results !== undefined && results !== null) {
      handleSuccess(results);
    }
  } catch (exception: unknown) {
    const error = exception as TError;

    if (customErrorHandler) {
      return customErrorHandler(error);
    }

    const hasMessage = error && typeof error === 'object' && 'message' in error;

    if (!hasMessage) {
      logError({
        message: errorContext,
        error,
      });
      return {
        form: ['Something went wrong, please try again later.'],
        fields: {},
      };
    }

    return {
      form: [(error as { message: string }).message],
      fields: {},
    };
  }
}
