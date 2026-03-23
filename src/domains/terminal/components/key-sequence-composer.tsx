import { Button } from '@components/ds/atoms/button';
import {
  buildKeyLabel,
  buildKeySequence,
  KEY_CATEGORIES,
  KEY_DEFINITIONS,
  type KeyCategory,
  type Modifiers,
} from '@lib/terminal-key-sequence.utils';
import { useCallback, useState } from 'react';

interface KeySequenceComposerProps {
  onInsert: (sequence: string) => void;
}

const GRID_COLS: Record<KeyCategory, string> = {
  letters: 'grid-cols-9',
  common: 'grid-cols-3',
  arrows: 'grid-cols-4',
  navigation: 'grid-cols-3',
  function: 'grid-cols-6',
};

export function KeySequenceComposer({ onInsert }: KeySequenceComposerProps) {
  const [mods, setMods] = useState<Modifiers>({
    ctrl: false,
    shift: false,
    alt: false,
  });
  const [activeCategory, setActiveCategory] = useState<KeyCategory>('letters');

  const toggleMod = useCallback((mod: keyof Modifiers) => {
    setMods((prev) => ({ ...prev, [mod]: !prev[mod] }));
  }, []);

  const handleKeyClick = useCallback(
    (key: string) => {
      const sequence = buildKeySequence(key, mods);
      onInsert(sequence);
    },
    [mods, onInsert],
  );

  const keysForCategory = KEY_DEFINITIONS.filter(
    (k) => k.category === activeCategory,
  );

  return (
    <div
      className="grid gap-2"
      data-testid="key-sequence-composer"
    >
      <div className="flex gap-1.5">
        {(
          [
            { key: 'ctrl', label: 'Ctrl' },
            { key: 'shift', label: 'Shift' },
            { key: 'alt', label: 'Alt' },
          ] as const
        ).map(({ key, label }) => (
          <Button
            key={key}
            type="button"
            variant={mods[key] ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => toggleMod(key)}
            aria-pressed={mods[key]}
            data-testid={`mod-${key}`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex gap-1 border-b pb-1">
        {KEY_CATEGORIES.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs ${activeCategory === id ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveCategory(id)}
            data-testid={`category-${id}`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className={`grid ${GRID_COLS[activeCategory]} gap-1`}>
        {keysForCategory.map((keyDef) => {
          const label = buildKeyLabel(keyDef.key, mods);
          return (
            <Button
              key={keyDef.key}
              type="button"
              variant="ghost"
              size="sm"
              className="font-mono"
              onClick={() => handleKeyClick(keyDef.key)}
              title={label}
              data-testid={`key-${keyDef.key}`}
            >
              {keyDef.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
