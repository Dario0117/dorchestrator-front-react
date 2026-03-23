import type { RoundedOption } from '@components/ds/utils/tokens';
import { ROUNDED } from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type ImageFit = 'contain' | 'cover' | 'fill';

const FIT: Record<ImageFit, string> = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
};

interface ImageProps
  extends Omit<React.ComponentProps<'img'>, 'className' | 'style'> {
  fit?: ImageFit;
  fullWidth?: boolean;
  fullHeight?: boolean;
  maxHeight?: string;
  rounded?: Exclude<RoundedOption, 'full'>;
}

function Image({
  fit,
  fullWidth,
  fullHeight,
  rounded,
  alt,
  ref,
  ...props
}: ImageProps) {
  return (
    <img
      ref={ref}
      alt={alt}
      className={cn(
        fit && FIT[fit],
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        rounded && ROUNDED[rounded],
      )}
      {...props}
    />
  );
}

export { Image };
export type { ImageProps };
