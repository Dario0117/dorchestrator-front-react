import { ShortcutHint } from '@components/ds/atoms/shortcut-hint';
import { SmallText } from '@components/ds/atoms/small-text';
import { Button } from '@components/ui/button';
import { Search } from 'lucide-react';

interface CommandPaletteTriggerProps {
  onClick: () => void;
}

function CommandPaletteTrigger({ onClick }: CommandPaletteTriggerProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      aria-label="Search"
      className="hidden items-center gap-2 text-muted-foreground md:inline-flex"
    >
      <Search className="size-4" />
      <SmallText>Search...</SmallText>
      <ShortcutHint keys="Mod+K" />
    </Button>
  );
}

export { CommandPaletteTrigger };
export type { CommandPaletteTriggerProps };
