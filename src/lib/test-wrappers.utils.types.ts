import type { Theme } from '@domains/shared/context/theme.provider.types';

export interface ProviderWrapperOptions {
  storageKey?: string;
  defaultTheme?: Theme;
}
