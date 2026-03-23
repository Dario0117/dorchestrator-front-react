import type { GapSize } from '@components/ds/utils/tokens';
import { GAP } from '@components/ds/utils/tokens';
import {
  Card as ShadcnCard,
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from '@components/ui/card';
import { cn } from '@lib/utils';

type ShadcnCardProps = React.ComponentProps<typeof ShadcnCard>;

interface CardProps extends Omit<ShadcnCardProps, 'className' | 'style'> {
  interactive?: boolean;
  variant?: 'default' | 'destructive';
}

function Card({ interactive, variant = 'default', ...props }: CardProps) {
  return (
    <ShadcnCard
      className={cn(
        interactive &&
          'cursor-pointer transition-all duration-200 hover:-translate-y-px hover:ring-foreground/25 motion-reduce:hover:translate-y-0',
        variant === 'destructive' && 'ring-destructive',
      )}
      {...props}
    />
  );
}

type ShadcnCardHeaderProps = React.ComponentProps<typeof ShadcnCardHeader>;
interface CardHeaderProps
  extends Omit<ShadcnCardHeaderProps, 'className' | 'style'> {
  direction?: 'row';
  align?: 'center';
  paddingBottom?: 'sm';
}

function CardHeader({
  direction,
  align,
  paddingBottom,
  ...props
}: CardHeaderProps) {
  return (
    <ShadcnCardHeader
      className={cn(
        direction === 'row' && 'flex flex-row',
        direction === 'row' && align === 'center' && 'items-center',
        direction === 'row' && 'justify-between',
        paddingBottom === 'sm' && 'pb-2',
      )}
      {...props}
    />
  );
}

type ShadcnCardTitleProps = React.ComponentProps<typeof ShadcnCardTitle>;
type CardTitleSize = 'sm' | 'default' | 'lg';
type CardTitleColor = 'default' | 'muted' | 'destructive';

interface CardTitleProps
  extends Omit<ShadcnCardTitleProps, 'className' | 'style'> {
  size?: CardTitleSize;
  mono?: boolean;
  color?: CardTitleColor;
  icon?: boolean;
}

function CardTitle({
  size = 'default',
  mono,
  color,
  icon,
  ...props
}: CardTitleProps) {
  return (
    <ShadcnCardTitle
      className={cn(
        size === 'sm' && 'text-sm font-medium',
        size === 'lg' && 'text-lg',
        mono && 'font-mono',
        color === 'muted' && 'text-muted-foreground',
        color === 'destructive' && 'text-destructive',
        icon && 'flex items-center gap-2',
      )}
      {...props}
    />
  );
}

type ShadcnCardDescriptionProps = React.ComponentProps<
  typeof ShadcnCardDescription
>;
interface CardDescriptionProps extends ShadcnCardDescriptionProps {}

function CardDescription(props: CardDescriptionProps) {
  return <ShadcnCardDescription {...props} />;
}

type ShadcnCardActionProps = React.ComponentProps<typeof ShadcnCardAction>;
interface CardActionProps extends ShadcnCardActionProps {}

function CardAction(props: CardActionProps) {
  return <ShadcnCardAction {...props} />;
}

type ShadcnCardContentProps = React.ComponentProps<typeof ShadcnCardContent>;
interface CardContentProps
  extends Omit<ShadcnCardContentProps, 'className' | 'style'> {
  gap?: GapSize;
}

const SPACE_Y_MAP: Record<GapSize, string> = {
  none: '',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-3',
  lg: 'space-y-4',
  xl: 'space-y-6',
};

function CardContent({ gap, ...props }: CardContentProps) {
  return (
    <ShadcnCardContent
      className={cn(gap && SPACE_Y_MAP[gap])}
      {...props}
    />
  );
}

type ShadcnCardFooterProps = React.ComponentProps<typeof ShadcnCardFooter>;
interface CardFooterProps
  extends Omit<ShadcnCardFooterProps, 'className' | 'style'> {
  gap?: GapSize;
}

function CardFooter({ gap, ...props }: CardFooterProps) {
  return (
    <ShadcnCardFooter
      className={cn(gap && GAP[gap])}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardActionProps,
  CardContentProps,
  CardFooterProps,
};
