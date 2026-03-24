import { SelectableListItem } from '@components/ds/atoms/selectable-list';
import { SmallText } from '@components/ds/atoms/small-text';
import { StatusDot } from '@components/ds/atoms/status-dot';
import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';

const ONLINE_THRESHOLD_MS = 60_000;

function isDeviceOnline(lastSeenAt: string | undefined) {
  if (!lastSeenAt) {
    return false;
  }
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
}

interface CommandPaletteResultItemProps {
  item: CommandPaletteResult;
  active: boolean;
  onSelect: () => void;
}

export function CommandPaletteResultItem({
  item,
  active,
  onSelect,
}: CommandPaletteResultItemProps) {
  const online = item.type === 'device' && isDeviceOnline(item.lastSeenAt);
  const statusText = online ? 'Online' : 'Offline';

  return (
    <SelectableListItem
      role="option"
      aria-selected={active}
      active={active}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect();
        }
      }}
    >
      {item.type === 'device' && (
        <StatusDot
          size="sm"
          status={online ? 'online' : 'offline'}
          aria-label={statusText}
        />
      )}
      <SmallText>{item.label}</SmallText>
    </SelectableListItem>
  );
}
