import { Separator } from '@components/ds/atoms/separator';
import { Stack } from '@components/ds/atoms/stack';
import { HostEntryList } from '@domains/sandbox/components/host-entry-list';
import type { SandboxConfigFormType } from '@domains/sandbox/forms/hooks/use-sandbox-config-form';
import { useEffect, useRef } from 'react';

function createEmptyEntry() {
  return { id: crypto.randomUUID(), host: '', ports: '' };
}

function createDefaultEntry(host: string) {
  return { id: crypto.randomUUID(), host, ports: '' };
}

const DEFAULT_LOCAL_HOSTS = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '100.64.0.0/10',
  'fc00::/7',
];

type NetworkHostEntriesSectionProps = {
  form: SandboxConfigFormType;
  externalFieldName: 'allowExternal' | 'denyExternal';
  localFieldName: 'allowLocal' | 'denyLocal';
};

export function NetworkHostEntriesSection({
  form,
  externalFieldName,
  localFieldName,
}: NetworkHostEntriesSectionProps) {
  const hasSeededDefaults = useRef(false);

  useEffect(() => {
    if (hasSeededDefaults.current) {
      return;
    }
    const localEntries = form.getFieldValue(localFieldName);
    if (localEntries.length === 0) {
      form.setFieldValue(
        localFieldName,
        DEFAULT_LOCAL_HOSTS.map(createDefaultEntry),
      );
      hasSeededDefaults.current = true;
    }
  }, [form, localFieldName]);

  return (
    <form.Subscribe
      selector={(state) => ({
        externalEntries: state.values[externalFieldName],
        localEntries: state.values[localFieldName],
      })}
    >
      {({ externalEntries, localEntries }) => (
        <Stack gap="sm">
          <Separator />
          <HostEntryList
            label="External Hosts"
            entries={externalEntries}
            onAdd={() =>
              form.setFieldValue(externalFieldName, [
                ...externalEntries,
                createEmptyEntry(),
              ])
            }
            onRemove={(index) =>
              form.setFieldValue(
                externalFieldName,
                externalEntries.filter((_, i) => i !== index),
              )
            }
            onChangeHost={(index, value) =>
              form.setFieldValue(
                externalFieldName,
                externalEntries.map((e, i) =>
                  i === index ? { ...e, host: value } : e,
                ),
              )
            }
            onChangePorts={(index, value) =>
              form.setFieldValue(
                externalFieldName,
                externalEntries.map((e, i) =>
                  i === index ? { ...e, ports: value } : e,
                ),
              )
            }
          />
          <HostEntryList
            label="Local Hosts"
            entries={localEntries}
            onAdd={() =>
              form.setFieldValue(localFieldName, [
                ...localEntries,
                createEmptyEntry(),
              ])
            }
            onRemove={(index) =>
              form.setFieldValue(
                localFieldName,
                localEntries.filter((_, i) => i !== index),
              )
            }
            onChangeHost={(index, value) =>
              form.setFieldValue(
                localFieldName,
                localEntries.map((e, i) =>
                  i === index ? { ...e, host: value } : e,
                ),
              )
            }
            onChangePorts={(index, value) =>
              form.setFieldValue(
                localFieldName,
                localEntries.map((e, i) =>
                  i === index ? { ...e, ports: value } : e,
                ),
              )
            }
          />
        </Stack>
      )}
    </form.Subscribe>
  );
}
