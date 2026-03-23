import { buttonVariants, Button as ShadcnButton } from '@components/ui/button';
import { cn } from '@lib/utils';

type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>;

type ButtonColor = 'success' | 'danger' | 'muted';

const BUTTON_COLOR: Record<ButtonColor, string> = {
  success: 'text-success hover:text-success/80',
  danger: 'text-muted-foreground hover:text-destructive',
  muted: 'text-muted-foreground',
};

type DsButtonSize = 'compact' | 'icon-compact' | 'inline' | 'toolbar';

const DS_BUTTON_SIZE: Record<DsButtonSize, string> = {
  compact: 'h-7 gap-1 px-2 text-xs',
  'icon-compact': 'size-6',
  inline: 'h-auto p-1 text-xs',
  toolbar:
    'min-w-11 shrink-0 text-base md:h-9 md:min-h-9 md:min-w-9 md:px-2 md:text-sm',
};

type ButtonFont = 'mono';

const BUTTON_FONT: Record<ButtonFont, string> = {
  mono: 'font-mono',
};

interface ButtonProps
  extends Omit<ShadcnButtonProps, 'className' | 'style' | 'size'> {
  color?: ButtonColor;
  accentColor?: string;
  size?: ShadcnButtonProps['size'] | DsButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  grow?: boolean;
  font?: ButtonFont;
}

function Button({
  color,
  accentColor,
  size,
  fullWidth,
  rounded,
  grow,
  font,
  ...props
}: ButtonProps) {
  const isDsSize = size != null && size in DS_BUTTON_SIZE;

  return (
    <ShadcnButton
      size={isDsSize ? undefined : (size as ShadcnButtonProps['size'])}
      className={cn(
        'text-base md:text-sm',
        color && BUTTON_COLOR[color],
        accentColor && 'border-[var(--accent)] text-[var(--accent)]',
        isDsSize && DS_BUTTON_SIZE[size as DsButtonSize],
        fullWidth && 'w-full',
        rounded && 'rounded-full',
        grow && 'flex-1',
        font && BUTTON_FONT[font],
      )}
      style={
        accentColor
          ? ({ '--accent': accentColor } as React.CSSProperties)
          : undefined
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
