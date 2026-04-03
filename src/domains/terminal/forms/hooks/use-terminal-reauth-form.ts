import { useAppForm } from '@domains/org/forms/hooks/app-form';
import type { UseTerminalReauthFormProps } from '@domains/terminal/forms/hooks/use-terminal-reauth-form.types';
import { terminalReauthFormSchema } from '@domains/terminal/forms/validation/terminal-reauth-form.schema';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

export function useTerminalReauthForm({
  authMutation,
  organizationId,
  handleSuccess,
}: UseTerminalReauthFormProps) {
  const form = useAppForm({
    defaultValues: {
      password: '',
    },
    validators: {
      onSubmit: terminalReauthFormSchema,
    },
    onSubmit({ value }) {
      authMutation.mutate(
        {
          params: { path: { organizationId } },
          body: { password: value.password },
        },
        {
          onSuccess(data) {
            form.reset();
            handleSuccess(data.responseData.results.sessionToken);
          },
          onError(error) {
            logError({ error }, 'Terminal re-authentication failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}
