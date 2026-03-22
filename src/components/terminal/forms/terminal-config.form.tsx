import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { useTerminalConfigForm } from '@components/terminal/forms/hooks/use-terminal-config-form';
import type { TerminalConfigFormProps } from '@components/terminal/forms/terminal-config.form.types';

export function TerminalConfigForm({
  updateConfigMutation,
  organizationId,
  defaultValues,
  handleSuccess,
}: TerminalConfigFormProps) {
  const form = useTerminalConfigForm({
    updateConfigMutation,
    organizationId,
    defaultValues,
    handleSuccess,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terminal Session Timeouts</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-6">
            <form.AppField name="inactivityTimeoutMinutes">
              {(field) => (
                <field.AppFormField
                  label="Inactivity Timeout (minutes)"
                  type="number"
                  placeholder="60"
                  required
                  helperText="Sessions will lock after this period of inactivity. Maximum: 4320 minutes (3 days)."
                />
              )}
            </form.AppField>

            <form.AppField name="hardCapHours">
              {(field) => (
                <field.AppFormField
                  label="Hard Cap (hours)"
                  type="number"
                  placeholder="Leave empty for no hard cap"
                  helperText="Maximum session lifetime regardless of activity. Leave empty to disable. Maximum: 72 hours (3 days)."
                />
              )}
            </form.AppField>

            <div className="flex flex-col gap-3">
              <form.AppForm>
                <form.AppSubscribeSubmitButton label="Save Configuration" />
              </form.AppForm>
            </div>
          </div>

          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
