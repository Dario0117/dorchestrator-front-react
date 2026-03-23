import { Surface, type SurfaceProps } from '@components/ds/atoms/surface';
import type {
  BorderOption,
  FixedSpacingSize,
  RoundedOption,
} from '@components/ds/utils/tokens';

interface InsetPanelProps
  extends Omit<
    SurfaceProps,
    'border' | 'rounded' | 'innerSpaceX' | 'innerSpaceY'
  > {
  border?: BorderOption;
  rounded?: RoundedOption;
  innerSpace?: FixedSpacingSize;
}

function InsetPanel({
  border = 'all',
  rounded = 'md',
  innerSpace = 'sm',
  ...props
}: InsetPanelProps) {
  return (
    <Surface
      border={border}
      rounded={rounded}
      innerSpaceX={innerSpace}
      innerSpaceY={innerSpace}
      {...props}
    />
  );
}

export { InsetPanel };
export type { InsetPanelProps };
