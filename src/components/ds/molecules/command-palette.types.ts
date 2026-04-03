export type NavigationId =
  | 'nav-dashboard'
  | 'nav-devices'
  | 'nav-commands'
  | 'nav-terminal'
  | 'nav-terminal-bookmarks'
  | 'nav-audit-logs'
  | 'nav-settings';

type ActionId = 'action-new-command' | 'action-new-session';

export type DeviceActionId = 'terminal' | 'command' | 'settings';

interface NavigationResult {
  type: 'navigation';
  id: NavigationId;
  label: string;
}

interface ActionResult {
  type: 'action';
  id: ActionId;
  label: string;
}

export interface DeviceResult {
  type: 'device';
  id: string;
  label: string;
  isOnline: boolean;
  action?: DeviceActionId;
}

export type CommandPaletteResult =
  | NavigationResult
  | ActionResult
  | DeviceResult;

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: CommandPaletteResult) => void;
}
