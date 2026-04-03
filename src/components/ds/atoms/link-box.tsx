import { cn } from '@lib/utils';

type LinkBoxVariant = 'thumbnail' | 'icon';

const VARIANT: Record<LinkBoxVariant, string> = {
  thumbnail:
    'block h-10 w-10 shrink-0 overflow-hidden rounded border hover:ring-2 hover:ring-primary',
  icon: 'flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted hover:ring-2 hover:ring-primary',
};

interface LinkBoxProps
  extends Omit<React.ComponentProps<'a'>, 'className' | 'style'> {
  variant: LinkBoxVariant;
  href: string;
}

function LinkBox({ variant, ref, ...props }: LinkBoxProps) {
  return (
    <a
      ref={ref}
      className={cn(VARIANT[variant])}
      {...props}
    />
  );
}

export { LinkBox };
