// Gap
type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const GAP: Record<GapSize, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
};

// Align
type AlignOption = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
const ALIGN: Record<AlignOption, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

// Justify
type JustifyOption =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';
const JUSTIFY: Record<JustifyOption, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

// Spacing (margins)
type FixedSpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpacingSize = FixedSpacingSize | 'auto';

const SPACE_ABOVE: Record<SpacingSize, string> = {
  xs: 'mt-1',
  sm: 'mt-2',
  md: 'mt-4',
  lg: 'mt-6',
  xl: 'mt-8',
  auto: 'mt-auto',
};

const SPACE_BELOW: Record<SpacingSize, string> = {
  xs: 'mb-1',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-6',
  xl: 'mb-8',
  auto: 'mb-auto',
};

const SPACE_LEFT: Record<SpacingSize, string> = {
  xs: 'ml-1',
  sm: 'ml-2',
  md: 'ml-4',
  lg: 'ml-6',
  xl: 'ml-8',
  auto: 'ml-auto',
};

const SPACE_RIGHT: Record<SpacingSize, string> = {
  xs: 'mr-1',
  sm: 'mr-2',
  md: 'mr-4',
  lg: 'mr-6',
  xl: 'mr-8',
  auto: 'mr-auto',
};

const SPACE_X: Record<SpacingSize, string> = {
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
  xl: 'mx-8',
  auto: 'mx-auto',
};

const SPACE_Y: Record<SpacingSize, string> = {
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8',
  auto: 'my-auto',
};

// Padding (inner spacing)
const INNER_TOP: Record<FixedSpacingSize, string> = {
  xs: 'pt-1',
  sm: 'pt-2',
  md: 'pt-4',
  lg: 'pt-6',
  xl: 'pt-8',
};

const INNER_BOTTOM: Record<FixedSpacingSize, string> = {
  xs: 'pb-1',
  sm: 'pb-2',
  md: 'pb-4',
  lg: 'pb-6',
  xl: 'pb-8',
};

const INNER_LEFT: Record<FixedSpacingSize, string> = {
  xs: 'pl-1',
  sm: 'pl-2',
  md: 'pl-4',
  lg: 'pl-6',
  xl: 'pl-8',
};

const INNER_RIGHT: Record<FixedSpacingSize, string> = {
  xs: 'pr-1',
  sm: 'pr-2',
  md: 'pr-4',
  lg: 'pr-6',
  xl: 'pr-8',
};

const INNER_X: Record<FixedSpacingSize, string> = {
  xs: 'px-1',
  sm: 'px-2',
  md: 'px-4',
  lg: 'px-6',
  xl: 'px-8',
};

const INNER_Y: Record<FixedSpacingSize, string> = {
  xs: 'py-1',
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-6',
  xl: 'py-8',
};

// Text color
type TextColor =
  | 'default'
  | 'muted'
  | 'destructive'
  | 'success'
  | 'error'
  | 'inherit';
const TEXT_COLOR: Record<TextColor, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-success',
  error: 'text-destructive',
  inherit: '',
};

// Font weight
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
const FONT_WEIGHT: Record<FontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

// Text size
type TextSize = 'xs' | 'sm' | 'base';
const TEXT_SIZE: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
};

// Text align
type TextAlign = 'left' | 'center' | 'right';
const TEXT_ALIGN: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

// Border
type BorderOption = 'all' | 'top' | 'bottom' | 'left' | 'right';
const BORDER: Record<BorderOption, string> = {
  all: 'border',
  top: 'border-t',
  bottom: 'border-b',
  left: 'border-l',
  right: 'border-r',
};

// Rounded
type RoundedOption = 'sm' | 'md' | 'lg' | 'full';
const ROUNDED: Record<RoundedOption, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

// Background
type BgOption =
  | 'muted'
  | 'background'
  | 'primary'
  | 'destructive'
  | 'black'
  | 'muted/30'
  | 'muted/50'
  | 'destructive/10';
const BG: Record<BgOption, string> = {
  muted: 'bg-muted',
  background: 'bg-background',
  primary: 'bg-primary',
  destructive: 'bg-destructive',
  black: 'bg-black',
  'muted/30': 'bg-muted/30',
  'muted/50': 'bg-muted/50',
  'destructive/10': 'bg-destructive/10',
};

// Max width
type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
const MAX_WIDTH: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

// Leading
type LeadingOption = 'none' | 'tight';
const LEADING: Record<LeadingOption, string> = {
  none: 'leading-none',
  tight: 'leading-tight',
};

export {
  ALIGN,
  BG,
  BORDER,
  FONT_WEIGHT,
  GAP,
  INNER_BOTTOM,
  INNER_LEFT,
  INNER_RIGHT,
  INNER_TOP,
  INNER_X,
  INNER_Y,
  JUSTIFY,
  LEADING,
  MAX_WIDTH,
  ROUNDED,
  SPACE_ABOVE,
  SPACE_BELOW,
  SPACE_LEFT,
  SPACE_RIGHT,
  SPACE_X,
  SPACE_Y,
  TEXT_ALIGN,
  TEXT_COLOR,
  TEXT_SIZE,
};

export type {
  AlignOption,
  BgOption,
  BorderOption,
  FixedSpacingSize,
  FontWeight,
  GapSize,
  JustifyOption,
  LeadingOption,
  MaxWidth,
  RoundedOption,
  SpacingSize,
  TextAlign,
  TextColor,
  TextSize,
};
