import { useTerminalReauthForm } from '@domains/terminal/forms/hooks/use-terminal-reauth-form';
import type { TerminalReauthFormProps } from '@domains/terminal/forms/terminal-reauth.form.types';

export function TerminalReauthForm({
  authMutation,
  organizationId,
  handleSuccess,
}: TerminalReauthFormProps) {
  const form = useTerminalReauthForm({
    authMutation,
    organizationId,
    handleSuccess,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4 py-4">
        <form.AppField name="password">
          {(field) => (
            <field.AppFormField
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />
          )}
        </form.AppField>
      </div>

      <div className="flex justify-end gap-2">
        <form.AppForm>
          <form.AppSubscribeSubmitButton label="Authenticate" />
        </form.AppForm>
      </div>

      <form.AppForm>
        <form.AppSubscribeErrorButton />
      </form.AppForm>
    </form>
  );
}
