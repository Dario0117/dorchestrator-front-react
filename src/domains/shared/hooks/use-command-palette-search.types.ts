import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';

export interface CommandPaletteGroup {
  label: string;
  results: readonly CommandPaletteResult[];
}
