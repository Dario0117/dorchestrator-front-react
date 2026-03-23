import { HStack } from '@components/ds/atoms/hstack';
import { Stack } from '@components/ds/atoms/stack';
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
      <Stack
        gap="lg"
        innerSpaceY="md"
      >
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
      </Stack>

      <HStack
        gap="sm"
        align="stretch"
        justify="end"
      >
        <form.AppForm>
          <form.AppSubscribeSubmitButton label="Authenticate" />
        </form.AppForm>
      </HStack>

      <form.AppForm>
        <form.AppSubscribeErrorButton />
      </form.AppForm>
    </form>
  );
}
