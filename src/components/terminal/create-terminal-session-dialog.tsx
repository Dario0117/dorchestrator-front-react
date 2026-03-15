import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';

import { formatDurationHuman } from '@lib/format-duration';

import {
  type HardCapSelection,
  type InactivitySelection,
  MS_PER_HOUR,
  MS_PER_MINUTE,
} from './create-terminal-session-dialog.constants';
import { useCreateTerminalSessionDialog } from './use-create-terminal-session-dialog';

interface CreateTerminalSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  teamId: string;
  deviceId: number;
  deviceName: string;
  terminalAuthToken: string;
  onSessionCreated: (sessionId: number) => void;
}

export function CreateTerminalSessionDialog({
  open,
  onOpenChange,
  organizationId,
  teamId,
  deviceId,
  deviceName,
  terminalAuthToken,
  onSessionCreated,
}: CreateTerminalSessionDialogProps) {
  const {
    isLoading,
    ceiling,
    inactivityCeiling,
    hardCapCeiling,
    defaultWorkingDirectory,
    inactivitySelection,
    setInactivitySelection,
    customInactivityMinutes,
    setCustomInactivityMinutes,
    hardCapSelection,
    setHardCapSelection,
    customHardCapHours,
    setCustomHardCapHours,
    workingDirectory,
    setWorkingDirectory,
    error,
    setError,
    availableInactivityPresets,
    availableHardCapPresets,
    isPending,
    handleSubmit,
    handleOpenChange,
  } = useCreateTerminalSessionDialog({
    open,
    onOpenChange,
    organizationId,
    teamId,
    deviceId,
    terminalAuthToken,
    onSessionCreated,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Terminal Session</DialogTitle>
          <DialogDescription>
            Configure session timeout for {deviceName}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inactivity-timeout">Inactivity Timeout</Label>
              <Select
                value={inactivitySelection}
                onValueChange={(val: InactivitySelection) => {
                  setInactivitySelection(val);
                  setError(null);
                }}
              >
                <SelectTrigger id="inactivity-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="max">
                    Max ({formatDurationHuman(inactivityCeiling)})
                  </SelectItem>
                  {availableInactivityPresets.map((preset) => (
                    <SelectItem
                      key={preset.value}
                      value={preset.value}
                    >
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {inactivitySelection === 'custom' && (
                <Input
                  type="number"
                  placeholder="Minutes"
                  min={1}
                  max={Math.round(inactivityCeiling / MS_PER_MINUTE)}
                  value={customInactivityMinutes}
                  onChange={(e) => {
                    setCustomInactivityMinutes(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                />
              )}
              <p className="text-xs text-muted-foreground">
                Maximum allowed: {formatDurationHuman(inactivityCeiling)}
                {ceiling?.source === 'device'
                  ? ' (device policy)'
                  : ceiling?.source === 'org'
                    ? ' (organization policy)'
                    : ' (system default)'}
              </p>
            </div>

            {hardCapCeiling != null && (
              <div className="space-y-2">
                <Label htmlFor="hard-cap">Hard Cap</Label>
                <Select
                  value={hardCapSelection}
                  onValueChange={(val: HardCapSelection) => {
                    setHardCapSelection(val);
                    setError(null);
                  }}
                >
                  <SelectTrigger id="hard-cap">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max">
                      Max ({formatDurationHuman(hardCapCeiling)})
                    </SelectItem>
                    {availableHardCapPresets.map((preset) => (
                      <SelectItem
                        key={preset.value}
                        value={preset.value}
                      >
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {hardCapSelection === 'custom' && (
                  <Input
                    type="number"
                    placeholder="Hours"
                    min={1}
                    max={Math.round(hardCapCeiling / MS_PER_HOUR)}
                    value={customHardCapHours}
                    onChange={(e) => {
                      setCustomHardCapHours(e.target.value);
                      setError(null);
                    }}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Session terminates after this duration regardless of activity.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="working-directory">Working Directory</Label>
              <Input
                id="working-directory"
                type="text"
                placeholder={defaultWorkingDirectory || '/home/user'}
                value={workingDirectory}
                onChange={(e) => {
                  setWorkingDirectory(e.target.value);
                  setError(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Absolute path for the session working directory. Leave empty to
                use device default
                {defaultWorkingDirectory ? ` (${defaultWorkingDirectory})` : ''}
                .
              </p>
            </div>

            {error && (
              <p
                className="text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isPending}
          >
            {isPending ? 'Creating...' : 'Start Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
