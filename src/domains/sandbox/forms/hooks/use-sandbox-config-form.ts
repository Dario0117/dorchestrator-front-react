import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { sandboxConfigFormSchema } from '@domains/sandbox/forms/validation/sandbox-config-form.schema';
import type { useCreateSandboxPresetMutationType } from '@domains/sandbox/services/create-sandbox-preset.http-service';
import type { NetworkPolicyMode } from '@domains/sandbox/services/sandbox.http-service.constants';
import type { useUpdateSandboxPresetMutationType } from '@domains/sandbox/services/update-sandbox-preset.http-service';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

type HostEntry = { host: string; ports: number[] };
type HostEntryFormValue = { id: string; host: string; ports: string };

type UseSandboxConfigFormProps = {
  mode: 'create' | 'edit';
  createMutation: useCreateSandboxPresetMutationType;
  updateMutation: useUpdateSandboxPresetMutationType;
  organizationId: string;
  presetId?: number;
  handleSuccess: () => void;
  noSandboxTypeId: number;
  defaultValues?: {
    name?: string;
    description?: string;
    requiresApproval?: boolean;
    sandboxTypeId?: number;
    networkMode?: string;
    image?: string;
    maxTimeoutMs?: number;
    maxOutputSize?: number;
    pidsLimit?: number;
    allowExternal?: HostEntry[];
    allowLocal?: HostEntry[];
    denyExternal?: HostEntry[];
    denyLocal?: HostEntry[];
  };
};

function portsToString(ports: number[]): string {
  return ports.join(', ');
}

function parsePortsString(portsStr: string | undefined): number[] {
  if (!portsStr || portsStr.trim() === '') {
    return [];
  }
  return portsStr
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

function hostEntriesToFormEntries(entries?: HostEntry[]): HostEntryFormValue[] {
  if (!entries || entries.length === 0) {
    return [];
  }
  return entries.map((e) => ({
    id: crypto.randomUUID(),
    host: e.host,
    ports: portsToString(e.ports),
  }));
}

function formEntriesToHostEntries(entries: HostEntryFormValue[]): HostEntry[] {
  return entries
    .filter((e) => e.host.trim() !== '')
    .map((e) => ({
      host: e.host.trim(),
      ports: parsePortsString(e.ports),
    }));
}

export function useSandboxConfigForm({
  mode,
  createMutation,
  updateMutation,
  organizationId,
  presetId,
  handleSuccess,
  defaultValues,
  noSandboxTypeId,
}: UseSandboxConfigFormProps) {
  const form = useAppForm({
    validators: {
      // Schema used for required field asterisks via useIsFieldRequired
      onSubmit: sandboxConfigFormSchema as never,
    },
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      requiresApproval: defaultValues?.requiresApproval ? 'true' : 'false',
      sandboxTypeId: defaultValues?.sandboxTypeId ?? noSandboxTypeId,
      networkMode: defaultValues?.networkMode ?? '',
      image: defaultValues?.image ?? '',
      maxTimeoutMs: defaultValues?.maxTimeoutMs ?? ('' as number | string),
      maxOutputSize: defaultValues?.maxOutputSize ?? ('' as number | string),
      pidsLimit: defaultValues?.pidsLimit ?? ('' as number | string),
      allowExternal: hostEntriesToFormEntries(defaultValues?.allowExternal),
      allowLocal: hostEntriesToFormEntries(defaultValues?.allowLocal),
      denyExternal: hostEntriesToFormEntries(defaultValues?.denyExternal),
      denyLocal: hostEntriesToFormEntries(defaultValues?.denyLocal),
    },
    onSubmit({ value }) {
      const maxTimeoutMs =
        value.maxTimeoutMs !== '' ? Number(value.maxTimeoutMs) : undefined;
      const maxOutputSize =
        value.maxOutputSize !== '' ? Number(value.maxOutputSize) : undefined;
      const pidsLimit =
        value.pidsLimit !== '' ? Number(value.pidsLimit) : undefined;

      const networkMode = value.networkMode as NetworkPolicyMode | '';

      const buildNetworkPolicy = () => {
        if (!networkMode) {
          return undefined;
        }

        const base = { mode: networkMode as NetworkPolicyMode };

        if (networkMode === 'allow-list') {
          const external = formEntriesToHostEntries(value.allowExternal);
          const local = formEntriesToHostEntries(value.allowLocal);
          return {
            ...base,
            allow: { external, local },
          };
        }

        if (networkMode === 'deny-list') {
          const external = formEntriesToHostEntries(value.denyExternal);
          const local = formEntriesToHostEntries(value.denyLocal);
          return {
            ...base,
            deny: { external, local },
          };
        }

        return base;
      };

      const networkPolicy = buildNetworkPolicy();

      const body = {
        name: value.name,
        ...(value.description && { description: value.description }),
        sandboxTypeId: value.sandboxTypeId,
        requiresApproval: value.requiresApproval === 'true',
        ...(networkPolicy && { networkPolicy }),
        ...(value.image && { pluginConfig: { image: value.image } }),
        ...((maxTimeoutMs || maxOutputSize || pidsLimit) && {
          resourceLimits: {
            ...(maxTimeoutMs && { maxTimeoutMs }),
            ...(maxOutputSize && { maxOutputSize }),
            ...(pidsLimit && { pidsLimit }),
          },
        }),
      };

      const onMutateSuccess = () => {
        handleSuccess();
      };

      const onMutateError = (error: unknown) => {
        logError({ error }, 'Sandbox preset save failed');
        setFormErrorsFromResponse(
          error as { responseErrors?: Record<string, unknown> | null },
          form,
        );
      };

      if (mode === 'edit' && presetId != null) {
        updateMutation.mutate(
          {
            body,
            params: {
              path: { organizationId, presetId: String(presetId) },
            },
          },
          {
            onSuccess: onMutateSuccess,
            onError: onMutateError,
          },
        );
      } else {
        createMutation.mutate(
          {
            body,
            params: { path: { organizationId } },
          },
          {
            onSuccess: onMutateSuccess,
            onError: onMutateError,
          },
        );
      }
    },
  });

  return form;
}

export type SandboxConfigFormType = ReturnType<typeof useSandboxConfigForm>;
