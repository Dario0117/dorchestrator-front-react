import type { FixedSpacingSize, GapSize } from '@components/ds/utils/tokens';
import { GAP, INNER_Y } from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface FormProps
  extends Omit<React.ComponentProps<'form'>, 'className' | 'style'> {
  gap?: GapSize;
  innerSpaceY?: FixedSpacingSize;
}

function Form({ gap = 'md', innerSpaceY, ref, ...props }: FormProps) {
  return (
    <form
      ref={ref}
      className={cn('grid', GAP[gap], innerSpaceY && INNER_Y[innerSpaceY])}
      {...props}
    />
  );
}

export { Form };
