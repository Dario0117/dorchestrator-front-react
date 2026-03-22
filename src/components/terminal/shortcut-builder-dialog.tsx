import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import { Label } from '@components/ds/atoms/label';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { KeySequenceComposer } from '@components/terminal/key-sequence-composer';
import type { ShortcutMode } from '@components/terminal/terminal-shortcut-panel.types';
import type { ShortcutItem } from '@services/terminal/list-shortcuts.http-service';
import { Loader2, Play, Plus, Save, Send, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ShortcutBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    label: string;
    keySequence: string;
    mode: ShortcutMode;
    color?: string | null;
    icon?: string | null;
    sortOrder?: number;
  }) => void;
  isSaving: boolean;
  editingShortcut?: ShortcutItem | null;
}

const PREVIEW_MAP: [RegExp, string][] = [
  [/\\n/g, '↵'],
  [/\\t/g, '⇥'],
  [/\\x1b/gi, 'Esc'],
  [/\\x([0-9a-fA-F]{2})/g, '^$1'],
];

function parseSequenceForPreview(sequence: string): string {
  let result = sequence;
  for (const [pattern, replacement] of PREVIEW_MAP) {
    result = result.replace(pattern, replacement);
  }
  result = result.replace(/\^([0-9a-fA-F]{2})/g, (_match, hex: string) => {
    const code = Number.parseInt(hex, 16);
    if (code >= 1 && code <= 26) {
      return `^${String.fromCharCode(code + 64)}`;
    }
    return `^${hex}`;
  });
  return result;
}

export function ShortcutBuilderDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
  editingShortcut,
}: ShortcutBuilderDialogProps) {
  const [label, setLabel] = useState('');
  const [keySequence, setKeySequence] = useState('');
  const [mode, setMode] = useState<ShortcutMode>('keystroke');
  const [autoSend, setAutoSend] = useState(false);
  const [color, setColor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sequenceInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingShortcut != null;

  useEffect(() => {
    if (open) {
      if (editingShortcut) {
        setLabel(editingShortcut.label);
        setMode(editingShortcut.mode);
        setColor(editingShortcut.color ?? '');
        const hasAutoSend =
          editingShortcut.mode === 'snippet' &&
          editingShortcut.keySequence.endsWith('\n');
        setAutoSend(hasAutoSend);
        setKeySequence(
          hasAutoSend
            ? editingShortcut.keySequence.slice(0, -1)
            : editingShortcut.keySequence,
        );
      } else {
        setLabel('');
        setKeySequence('');
        setMode('keystroke');
        setAutoSend(false);
        setColor('');
      }
      setError(null);
    }
  }, [open, editingShortcut]);

  const handleInsertSequence = useCallback((sequence: string) => {
    setKeySequence((prev) => prev + sequence);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      setError('Label is required');
      return;
    }

    if (label.length > 30) {
      setError('Label must be at most 30 characters');
      return;
    }

    if (!keySequence) {
      setError('Key sequence is required');
      return;
    }

    if (keySequence.length > 100) {
      setError('Key sequence must be at most 100 characters');
      return;
    }

    setError(null);
    const finalSequence =
      mode === 'snippet' && autoSend ? `${keySequence}\n` : keySequence;
    onSave({
      label: label.trim(),
      keySequence: finalSequence,
      mode,
      color: color || null,
      sortOrder: editingShortcut?.sortOrder,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Shortcut' : 'Add Custom Shortcut'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your custom shortcut button.'
              : 'Create a custom shortcut button for your terminal sessions.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="shortcut-label">Label</Label>
            <Input
              id="shortcut-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. ls -la"
              maxLength={30}
              data-testid="shortcut-label-input"
            />
            <SmallParagraph>
              Displayed on the button (max 30 characters)
            </SmallParagraph>
          </div>

          <div className="grid gap-2">
            <Label>Mode</Label>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Shortcut mode"
              data-testid="mode-selector"
            >
              <Button
                type="button"
                variant={mode === 'keystroke' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setMode('keystroke');
                  setAutoSend(false);
                }}
                aria-pressed={mode === 'keystroke'}
                data-testid="mode-keystroke-btn"
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Keystroke
              </Button>
              <Button
                type="button"
                variant={mode === 'snippet' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMode('snippet')}
                aria-pressed={mode === 'snippet'}
                data-testid="mode-snippet-btn"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Snippet
              </Button>
            </div>
            <SmallParagraph>
              {mode === 'keystroke'
                ? 'Sends a keyboard shortcut or escape sequence directly (e.g. Ctrl+C, Ctrl+L).'
                : 'Pastes the command text into the terminal without executing, so you can review or edit before pressing Enter.'}
            </SmallParagraph>
          </div>

          {mode === 'snippet' && (
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="grid gap-0.5">
                <Label
                  htmlFor="auto-send-toggle"
                  className="text-sm font-medium"
                >
                  Auto-send
                </Label>
                <SmallParagraph>
                  Automatically press Enter after pasting the command
                </SmallParagraph>
              </div>
              <Button
                id="auto-send-toggle"
                type="button"
                variant={autoSend ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoSend((v) => !v)}
                aria-pressed={autoSend}
                data-testid="auto-send-toggle"
              >
                <Play className="mr-1 h-3 w-3" />
                {autoSend ? 'On' : 'Off'}
              </Button>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="shortcut-sequence">
              {mode === 'keystroke' ? 'Key Sequence' : 'Command'}
            </Label>
            {mode === 'snippet' ? (
              <Input
                ref={sequenceInputRef}
                id="shortcut-sequence"
                value={keySequence}
                onChange={(e) => setKeySequence(e.target.value)}
                placeholder="e.g. docker ps"
                maxLength={100}
                data-testid="shortcut-sequence-input"
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className="flex min-h-9 flex-1 items-center rounded-md border bg-muted/50 px-3 py-1"
                    data-testid="shortcut-sequence-display"
                  >
                    {keySequence ? (
                      <code className="text-sm">
                        {parseSequenceForPreview(keySequence)}
                      </code>
                    ) : (
                      <SecondaryText>
                        Use the keys below to build a shortcut
                      </SecondaryText>
                    )}
                  </div>
                  {keySequence && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setKeySequence('')}
                      data-testid="clear-sequence-btn"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="rounded-md border p-2">
                  <KeySequenceComposer onInsert={handleInsertSequence} />
                </div>
              </>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortcut-color">Color (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="shortcut-color"
                type="color"
                value={color || '#6366f1'}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
                data-testid="shortcut-color-input"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
              {color && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          {label && keySequence && (
            <div className="rounded-md border p-3">
              <SmallParagraph className="mb-2">Button preview:</SmallParagraph>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-11"
                style={color ? { borderColor: color, color } : undefined}
              >
                {label}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Save Changes' : 'Add Shortcut'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
