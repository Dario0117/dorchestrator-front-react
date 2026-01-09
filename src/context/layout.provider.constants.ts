import type { Collapsible, Variant } from '@context/layout.provider.types';

// Cookie constants following the pattern from sidebar.tsx
export const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible';
export const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant';
export const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Default values
export const DEFAULT_VARIANT: Variant = 'sidebar';
export const DEFAULT_COLLAPSIBLE: Collapsible = 'icon';
