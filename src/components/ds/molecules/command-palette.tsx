import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Box } from '@components/ds/atoms/box';
import { HStack } from '@components/ds/atoms/hstack';
import { Input } from '@components/ds/atoms/input';
import { Scrollable } from '@components/ds/atoms/scrollable';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import { SelectableList } from '@components/ds/atoms/selectable-list';
import type {
  CommandPaletteProps,
  CommandPaletteResult,
  DeviceActionId,
  DeviceResult,
} from '@components/ds/molecules/command-palette.types';
import {
  CommandPaletteDeviceSubmenu,
  DEVICE_ACTIONS_COUNT,
} from '@components/ds/molecules/command-palette-device-submenu';
import { CommandPaletteResultItem } from '@components/ds/molecules/command-palette-result-item';
import { useCommandPaletteSearch } from '@domains/shared/hooks/use-command-palette-search';
import { useRecentItemsStore } from '@domains/shared/stores/recent-items.store';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function CommandPalette({
  open,
  onOpenChange,
  onSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [submenuDevice, setSubmenuDevice] = useState<DeviceResult | null>(null);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const addRecentItem = useRecentItemsStore((s) => s.addRecentItem);
  const { groups } = useCommandPaletteSearch(query, open);

  const allResults = groups.flatMap((g) => g.results);

  const resetState = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setSubmenuDevice(null);
    setSubmenuActiveIndex(0);
  }, []);

  useEffect(() => {
    if (open) {
      resetState();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, resetState]);

  const handleSelect = useCallback(
    (item: CommandPaletteResult) => {
      if (item.type === 'device') {
        setSubmenuDevice(item);
        setSubmenuActiveIndex(0);
        return;
      }
      addRecentItem(item);
      onSelect(item);
      onOpenChange(false);
    },
    [addRecentItem, onSelect, onOpenChange],
  );

  const handleDeviceAction = useCallback(
    (device: DeviceResult, actionId: DeviceActionId) => {
      addRecentItem(device);
      onSelect({
        type: 'device',
        id: device.id,
        label: device.label,
        isOnline: device.isOnline,
        action: actionId,
      });
      onOpenChange(false);
    },
    [addRecentItem, onSelect, onOpenChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (submenuDevice) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSubmenuActiveIndex((i) =>
            i < DEVICE_ACTIONS_COUNT - 1 ? i + 1 : 0,
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSubmenuActiveIndex((i) =>
            i > 0 ? i - 1 : DEVICE_ACTIONS_COUNT - 1,
          );
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const actions: DeviceActionId[] = ['terminal', 'command', 'settings'];
          // biome-ignore lint/style/noNonNullAssertion: submenuActiveIndex is always 0-2, constrained by ArrowUp/Down logic
          handleDeviceAction(submenuDevice, actions[submenuActiveIndex]!);
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
          setSubmenuDevice(null);
          setSubmenuActiveIndex(0);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < allResults.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : allResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allResults[activeIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    },
    [
      submenuDevice,
      allResults,
      activeIndex,
      submenuActiveIndex,
      handleSelect,
      handleDeviceAction,
    ],
  );

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          role="dialog"
          aria-label="Command palette"
          className="fixed top-[20%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-lg bg-background shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          onKeyDown={handleKeyDown}
        >
          {!submenuDevice && (
            <HStack
              gap="sm"
              align="center"
              innerSpaceX="sm"
              innerSpaceY="sm"
            >
              <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search devices, actions, pages…"
                aria-label="Search"
                inputSize="sm"
                grow
              />
            </HStack>
          )}

          <Scrollable
            overflowY="auto"
            maxH="lg"
            innerSpaceX="sm"
            innerSpaceY="sm"
          >
            {submenuDevice ? (
              <CommandPaletteDeviceSubmenu
                deviceLabel={submenuDevice.label}
                activeIndex={submenuActiveIndex}
                onSelectAction={(actionId) =>
                  handleDeviceAction(submenuDevice, actionId)
                }
              />
            ) : allResults.length === 0 ? (
              <Box
                innerSpaceX="sm"
                innerSpaceY="lg"
              >
                <SecondaryText>No results found.</SecondaryText>
              </Box>
            ) : (
              groups.map((group) => (
                <Box key={group.label}>
                  <Box
                    innerSpaceX="sm"
                    innerSpaceY="xs"
                  >
                    <SecondaryText>{group.label}</SecondaryText>
                  </Box>
                  <SelectableList
                    role="listbox"
                    aria-label={group.label}
                  >
                    {group.results.map((item) => {
                      const flatIndex = allResults.indexOf(item);
                      return (
                        <CommandPaletteResultItem
                          key={item.id}
                          item={item}
                          active={flatIndex === activeIndex}
                          onSelect={() => handleSelect(item)}
                        />
                      );
                    })}
                  </SelectableList>
                </Box>
              ))
            )}
          </Scrollable>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
