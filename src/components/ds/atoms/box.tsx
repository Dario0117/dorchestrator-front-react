import { cn } from '@lib/utils';

type FixedSpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpacingSize = FixedSpacingSize | 'auto';

// Margin (outer spacing)
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

interface BoxProps extends Omit<React.ComponentProps<'div'>, 'className'> {
  spaceAbove?: SpacingSize;
  spaceBelow?: SpacingSize;
  spaceLeft?: SpacingSize;
  spaceRight?: SpacingSize;
  spaceX?: SpacingSize;
  spaceY?: SpacingSize;
  innerSpaceAbove?: FixedSpacingSize;
  innerSpaceBelow?: FixedSpacingSize;
  innerSpaceLeft?: FixedSpacingSize;
  innerSpaceRight?: FixedSpacingSize;
  innerSpaceX?: FixedSpacingSize;
  innerSpaceY?: FixedSpacingSize;
}

function Box({
  spaceAbove,
  spaceBelow,
  spaceLeft,
  spaceRight,
  spaceX,
  spaceY,
  innerSpaceAbove,
  innerSpaceBelow,
  innerSpaceLeft,
  innerSpaceRight,
  innerSpaceX,
  innerSpaceY,
  ...props
}: BoxProps) {
  return (
    <div
      className={cn(
        spaceAbove && SPACE_ABOVE[spaceAbove],
        spaceBelow && SPACE_BELOW[spaceBelow],
        spaceLeft && SPACE_LEFT[spaceLeft],
        spaceRight && SPACE_RIGHT[spaceRight],
        spaceX && SPACE_X[spaceX],
        spaceY && SPACE_Y[spaceY],
        innerSpaceAbove && INNER_TOP[innerSpaceAbove],
        innerSpaceBelow && INNER_BOTTOM[innerSpaceBelow],
        innerSpaceLeft && INNER_LEFT[innerSpaceLeft],
        innerSpaceRight && INNER_RIGHT[innerSpaceRight],
        innerSpaceX && INNER_X[innerSpaceX],
        innerSpaceY && INNER_Y[innerSpaceY],
      )}
      {...props}
    />
  );
}

export { Box };
export type { BoxProps, SpacingSize };
