import { Box } from '@components/ds/atoms/box';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import {
  SelectableList,
  SelectableListItem,
} from '@components/ds/atoms/selectable-list';
import { SmallText } from '@components/ds/atoms/small-text';
import type { DeviceActionId } from '@components/ds/molecules/command-palette.types';

interface DeviceAction {
  id: DeviceActionId;
  label: string;
  shortcut: string;
}

const DEVICE_ACTIONS: DeviceAction[] = [
  { id: 'terminal', label: 'Terminal', shortcut: '⏎' },
  { id: 'command', label: 'Send Command', shortcut: 'C' },
  { id: 'settings', label: 'Device Settings', shortcut: 'S' },
];

interface CommandPaletteDeviceSubmenuProps {
  deviceLabel: string;
  activeIndex: number;
  onSelectAction: (actionId: DeviceActionId) => void;
}

export function CommandPaletteDeviceSubmenu({
  deviceLabel,
  activeIndex,
  onSelectAction,
}: CommandPaletteDeviceSubmenuProps) {
  return (
    <Box
      role="listbox"
      aria-label={`Actions for ${deviceLabel}`}
    >
      <Box
        innerSpaceX="sm"
        innerSpaceY="xs"
      >
        <SecondaryText>{deviceLabel}</SecondaryText>
      </Box>
      <SelectableList>
        {DEVICE_ACTIONS.map((action, index) => (
          <SelectableListItem
            key={action.id}
            role="option"
            aria-selected={index === activeIndex}
            active={index === activeIndex}
            onClick={() => onSelectAction(action.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSelectAction(action.id);
              }
            }}
          >
            <SmallText>{action.label}</SmallText>
          </SelectableListItem>
        ))}
      </SelectableList>
    </Box>
  );
}

export const DEVICE_ACTIONS_COUNT = DEVICE_ACTIONS.length;
