import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { Well } from '@components/ds/atoms/well';
import { NetworkHostEntriesSection } from '@domains/sandbox/components/network-host-entries-section';
import { useSandboxConfigForm } from '@domains/sandbox/forms/hooks/use-sandbox-config-form';
import type { SandboxTypeItem } from '@domains/sandbox/services/list-sandbox-types.http-service';
import {
  NETWORK_MODE_LABELS,
  NETWORK_POLICY_MODES,
} from '@domains/sandbox/services/sandbox.http-service.constants';

const NETWORK_MODE_OPTIONS = [
  { value: '', label: 'None' },
  ...NETWORK_POLICY_MODES.map((mode) => ({
    value: mode,
    label: NETWORK_MODE_LABELS[mode],
  })),
];

type SandboxConfigFormProps = {
  mode: 'create' | 'edit';
  createMutation: Parameters<typeof useSandboxConfigForm>[0]['createMutation'];
  updateMutation: Parameters<typeof useSandboxConfigForm>[0]['updateMutation'];
  organizationId: string;
  presetId?: number;
  defaultValues?: Parameters<typeof useSandboxConfigForm>[0]['defaultValues'];
  handleSuccess: () => void;
  sandboxTypes: SandboxTypeItem[];
};

export function SandboxConfigForm({
  mode,
  createMutation,
  updateMutation,
  organizationId,
  presetId,
  defaultValues,
  handleSuccess,
  sandboxTypes,
}: SandboxConfigFormProps) {
  const noSandboxTypeId =
    sandboxTypes.find((t) => t.category === 'none')?.id ?? 1;

  const sandboxFormOptions = sandboxTypes.map((t) => {
    const label =
      t.category === 'none' ? `${t.name} (direct host execution)` : t.name;
    return {
      value: String(t.id),
      label: t.available ? label : `${label} (not yet available)`,
      disabled: !t.available,
    };
  });

  const form = useSandboxConfigForm({
    mode,
    createMutation,
    updateMutation,
    organizationId,
    presetId,
    handleSuccess,
    defaultValues,
    noSandboxTypeId,
  });

  return (
    <Card>
      <CardHeader paddingBottom="sm">
        <CardTitle>{mode === 'edit' ? 'Edit Preset' : 'New Preset'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Stack gap="md">
            <form.AppField name="name">
              {(field) => (
                <field.AppFormField
                  label="Preset Name"
                  placeholder="e.g. Default Container"
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.AppFormField
                  label="Description"
                  placeholder="Optional description"
                />
              )}
            </form.AppField>

            <form.AppField name="requiresApproval">
              {(field) => (
                <field.AppFormSelect
                  label="Requires Approval"
                  options={[
                    { value: 'false', label: 'No' },
                    { value: 'true', label: 'Yes' },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField name="sandboxTypeId">
              {(field) => (
                <field.AppFormSelect
                  label="Sandbox Type"
                  options={sandboxFormOptions}
                  disabled={mode === 'edit'}
                />
              )}
            </form.AppField>

            <form.Subscribe
              selector={(state) => ({
                sandboxTypeId: state.values.sandboxTypeId,
                networkMode: state.values.networkMode,
              })}
            >
              {({ sandboxTypeId: currentTypeId, networkMode: currentMode }) => {
                const isNone = currentTypeId === noSandboxTypeId;
                const showAllow = currentMode === 'allow-list';
                const showDeny = currentMode === 'deny-list';

                return (
                  <>
                    {isNone && (
                      <Well bg="muted">
                        <SmallParagraph>
                          Commands run directly on the host with no isolation.
                          Network policies are not enforced. Consider using a
                          container or VM sandbox for secure execution.
                        </SmallParagraph>
                      </Well>
                    )}

                    {!isNone && (
                      <>
                        <form.AppField name="networkMode">
                          {(field) => (
                            <field.AppFormSelect
                              label="Network Policy"
                              options={NETWORK_MODE_OPTIONS}
                            />
                          )}
                        </form.AppField>

                        {showAllow && (
                          <NetworkHostEntriesSection
                            form={form}
                            externalFieldName="allowExternal"
                            localFieldName="allowLocal"
                          />
                        )}

                        {showDeny && (
                          <NetworkHostEntriesSection
                            form={form}
                            externalFieldName="denyExternal"
                            localFieldName="denyLocal"
                          />
                        )}

                        <form.AppField name="image">
                          {(field) => (
                            <field.AppFormField
                              label="Container Image"
                              placeholder="ubuntu:22.04"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="maxTimeoutMs">
                          {(field) => (
                            <field.AppFormField
                              label="Max Timeout (ms)"
                              type="number"
                              placeholder="300000"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="maxOutputSize">
                          {(field) => (
                            <field.AppFormField
                              label="Max Output Size (bytes)"
                              type="number"
                              placeholder="1048576"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="pidsLimit">
                          {(field) => (
                            <field.AppFormField
                              label="PIDs Limit"
                              type="number"
                              placeholder="100"
                            />
                          )}
                        </form.AppField>
                      </>
                    )}
                  </>
                );
              }}
            </form.Subscribe>

            <ResponsiveRow
              gap="md"
              justify="end"
            >
              <form.AppForm>
                <form.AppSubscribeSubmitButton
                  label={mode === 'edit' ? 'Save Changes' : 'Create Preset'}
                />
              </form.AppForm>
            </ResponsiveRow>

            <form.AppForm>
              <form.AppSubscribeErrorButton />
            </form.AppForm>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
