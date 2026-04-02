import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import { Label } from '@components/ds/atoms/label';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { SandboxSelector } from '@domains/sandbox/components/sandbox-selector';
import { useCreateTerminalSessionDialog } from '@domains/terminal/hooks/use-create-terminal-session-dialog';
import { CreateTerminalSessionDialogSkeleton } from '@domains/terminal/modals/create-terminal-session-dialog.skeleton';
import { formatDurationHuman } from '@lib/format-duration';
import {
  type HardCapSelection,
  type InactivitySelection,
  MS_PER_HOUR,
  MS_PER_MINUTE,
} from './create-terminal-session-dialog.constants';

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
    shell,
    setShell,
    workingDirectory,
    setWorkingDirectory,
    activePresetId,
    setSelectedPresetId,
    effectivePresetId,
    isSandboxOverride,
    approvalPending,
    presets,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Terminal Session</DialogTitle>
          <DialogDescription>
            Configure session timeout for {deviceName}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <CreateTerminalSessionDialogSkeleton />
        ) : (
          <Stack
            gap="lg"
            innerSpaceY="sm"
          >
            <Stack gap="sm">
              <Label htmlFor="inactivity-timeout">Inactivity Timeout</Label>
              <Select
                value={inactivitySelection}
                onValueChange={(val) => {
                  /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
                  if (val === null) {
                    return;
                  }
                  /* v8 ignore stop */
                  setInactivitySelection(val as InactivitySelection);
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
              <SmallParagraph>
                Maximum allowed: {formatDurationHuman(inactivityCeiling)}
                {ceiling?.source === 'device'
                  ? ' (device policy)'
                  : ceiling?.source === 'org'
                    ? ' (organization policy)'
                    : ' (system default)'}
              </SmallParagraph>
            </Stack>

            {hardCapCeiling != null && (
              <Stack gap="sm">
                <Label htmlFor="hard-cap">Hard Cap</Label>
                <Select
                  value={hardCapSelection}
                  onValueChange={(val) => {
                    /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
                    if (val === null) {
                      return;
                    }
                    /* v8 ignore stop */
                    setHardCapSelection(val as HardCapSelection);
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
                <SmallParagraph>
                  Session terminates after this duration regardless of activity.
                </SmallParagraph>
              </Stack>
            )}

            <SandboxSelector
              value={activePresetId}
              onChange={(val) => {
                setSelectedPresetId(val);
                setError(null);
              }}
              effectivePresetId={effectivePresetId}
              presets={presets}
            />

            <Stack gap="sm">
              <Label htmlFor="shell">Shell</Label>
              <Select
                value={shell}
                onValueChange={(val) => {
                  /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
                  if (val === null) {
                    return;
                  }
                  /* v8 ignore stop */
                  setShell(val);
                  setError(null);
                }}
              >
                <SelectTrigger id="shell">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/bin/bash">/bin/bash</SelectItem>
                  <SelectItem value="/bin/zsh">/bin/zsh</SelectItem>
                  <SelectItem value="/bin/sh">/bin/sh</SelectItem>
                </SelectContent>
              </Select>
              <SmallParagraph>
                Shell to use for the terminal session.
              </SmallParagraph>
            </Stack>

            <Stack gap="sm">
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
              <SmallParagraph>
                Absolute path for the session working directory. Leave empty to
                use device default
                {defaultWorkingDirectory ? ` (${defaultWorkingDirectory})` : ''}
                .
              </SmallParagraph>
            </Stack>

            {error && (
              <SecondaryParagraph
                color="destructive"
                role="alert"
              >
                {error}
              </SecondaryParagraph>
            )}
          </Stack>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {approvalPending ? 'Close' : 'Cancel'}
          </Button>
          {approvalPending ? (
            <Button
              type="button"
              disabled
            >
              Pending Approval
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isPending}
            >
              {isPending
                ? isSandboxOverride
                  ? 'Requesting...'
                  : 'Creating...'
                : isSandboxOverride
                  ? 'Request Approval'
                  : 'Start Session'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
