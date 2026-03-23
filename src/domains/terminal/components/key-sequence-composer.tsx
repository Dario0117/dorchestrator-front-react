import { Button } from '@components/ds/atoms/button';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
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

const GRID_COLS: Record<KeyCategory, 3 | 4 | 6 | 9> = {
  letters: 9,
  common: 3,
  arrows: 4,
  navigation: 3,
  function: 6,
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
    <Grid
      gap="sm"
      data-testid="key-sequence-composer"
    >
      <HStack
        gap="xs"
        align="stretch"
      >
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
            size="xs"
            onClick={() => toggleMod(key)}
            aria-pressed={mods[key]}
            data-testid={`mod-${key}`}
          >
            {label}
          </Button>
        ))}
      </HStack>

      <HStack
        gap="xs"
        align="stretch"
        border="bottom"
        innerSpaceBelow="xs"
      >
        {KEY_CATEGORIES.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            variant={activeCategory === id ? 'secondary' : 'ghost'}
            size="compact"
            color={activeCategory === id ? undefined : 'muted'}
            onClick={() => setActiveCategory(id)}
            data-testid={`category-${id}`}
          >
            {label}
          </Button>
        ))}
      </HStack>

      <Grid
        fixedCols={GRID_COLS[activeCategory]}
        gap="xs"
      >
        {keysForCategory.map((keyDef) => {
          const label = buildKeyLabel(keyDef.key, mods);
          return (
            <Button
              key={keyDef.key}
              type="button"
              variant="ghost"
              size="sm"
              font="mono"
              onClick={() => handleKeyClick(keyDef.key)}
              title={label}
              data-testid={`key-${keyDef.key}`}
            >
              {keyDef.label}
            </Button>
          );
        })}
      </Grid>
    </Grid>
  );
}
