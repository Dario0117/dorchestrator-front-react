import { usePlatform } from '@domains/shared/hooks/use-platform';

interface ShortcutHintProps {
  keys: string;
}

function ShortcutHint({ keys }: ShortcutHintProps) {
  const { modLabel } = usePlatform();
  const display = keys.replace('Mod', modLabel);

  return (
    <kbd className="ml-1 inline-flex items-center rounded bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
      {display}
    </kbd>
  );
}

export { ShortcutHint };
export type { ShortcutHintProps };
