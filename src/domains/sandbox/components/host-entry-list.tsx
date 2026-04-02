import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Input } from '@components/ds/atoms/input';
import { Label } from '@components/ds/atoms/label';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { Plus, Trash2 } from 'lucide-react';

export type HostEntryFormValue = { id: string; host: string; ports: string };

type HostEntryListProps = {
  label: string;
  entries: HostEntryFormValue[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangeHost: (index: number, value: string) => void;
  onChangePorts: (index: number, value: string) => void;
};

export function HostEntryList({
  label,
  entries,
  onAdd,
  onRemove,
  onChangeHost,
  onChangePorts,
}: HostEntryListProps) {
  return (
    <Stack gap="sm">
      <Label>{label}</Label>
      {entries.map((entry, index) => (
        <HStack
          key={entry.id}
          gap="sm"
        >
          <Input
            inputSize="xs"
            placeholder="Host (e.g. api.github.com)"
            value={entry.host}
            onChange={(e) => onChangeHost(index, e.target.value)}
            aria-label={`${label} host ${index + 1}`}
          />
          <Input
            inputSize="xs"
            placeholder="Ports (e.g. 80, 443)"
            value={entry.ports}
            onChange={(e) => onChangePorts(index, e.target.value)}
            aria-label={`${label} ports ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-compact"
            color="danger"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${label} entry ${index + 1}`}
          >
            <Trash2 />
          </Button>
        </HStack>
      ))}
      {entries.length === 0 && (
        <SmallText color="muted">No entries. Add one below.</SmallText>
      )}
      <HStack>
        <Button
          type="button"
          variant="outline"
          size="compact"
          onClick={onAdd}
        >
          <Plus />
          Add Entry
        </Button>
      </HStack>
    </Stack>
  );
}
