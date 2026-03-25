import { ShortcutHint } from '@components/ds/atoms/shortcut-hint';
import { SmallText } from '@components/ds/atoms/small-text';
import { Button } from '@components/ui/button';
import { Search } from 'lucide-react';

interface CommandPaletteTriggerProps {
  onClick: () => void;
}

function CommandPaletteTrigger({ onClick }: CommandPaletteTriggerProps) {
  return (
    <>
      {/* Mobile: icon-only search button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        aria-label="Search"
        className="inline-flex cursor-pointer text-muted-foreground md:hidden"
      >
        <Search className="size-4" />
      </Button>

      {/* Desktop: full search trigger with text and shortcut hint */}
      <Button
        variant="outline"
        onClick={onClick}
        aria-label="Search"
        className="hidden cursor-pointer items-center gap-2 text-muted-foreground md:inline-flex"
      >
        <Search className="size-4" />
        <SmallText>Search...</SmallText>
        <ShortcutHint keys="Mod+K" />
      </Button>
    </>
  );
}

export { CommandPaletteTrigger };
export type { CommandPaletteTriggerProps };
