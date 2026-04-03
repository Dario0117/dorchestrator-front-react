import {
  Avatar as ShadcnAvatar,
  AvatarBadge as ShadcnAvatarBadge,
  AvatarFallback as ShadcnAvatarFallback,
  AvatarGroup as ShadcnAvatarGroup,
  AvatarGroupCount as ShadcnAvatarGroupCount,
  AvatarImage as ShadcnAvatarImage,
} from '@components/ui/avatar';
import { cn } from '@lib/utils';

type ShadcnAvatarProps = React.ComponentProps<typeof ShadcnAvatar>;
type AvatarSize = 'sm' | 'default';
type AvatarRounded = 'lg' | 'full';

const AVATAR_SIZE: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  default: '',
};

const AVATAR_ROUNDED: Record<AvatarRounded, string> = {
  lg: 'rounded-lg',
  full: 'rounded-full',
};

interface AvatarProps extends Omit<ShadcnAvatarProps, 'className' | 'style'> {
  size?: AvatarSize;
  rounded?: AvatarRounded;
}

type ShadcnAvatarImageProps = React.ComponentProps<typeof ShadcnAvatarImage>;
interface AvatarImageProps extends ShadcnAvatarImageProps {}

type ShadcnAvatarFallbackProps = React.ComponentProps<
  typeof ShadcnAvatarFallback
>;
interface AvatarFallbackProps
  extends Omit<ShadcnAvatarFallbackProps, 'className' | 'style'> {
  rounded?: AvatarRounded;
}

type ShadcnAvatarBadgeProps = React.ComponentProps<typeof ShadcnAvatarBadge>;
interface AvatarBadgeProps extends ShadcnAvatarBadgeProps {}

type ShadcnAvatarGroupProps = React.ComponentProps<typeof ShadcnAvatarGroup>;
interface AvatarGroupProps extends ShadcnAvatarGroupProps {}

type ShadcnAvatarGroupCountProps = React.ComponentProps<
  typeof ShadcnAvatarGroupCount
>;
interface AvatarGroupCountProps extends ShadcnAvatarGroupCountProps {}

function Avatar({ size, rounded, ...props }: AvatarProps) {
  return (
    <ShadcnAvatar
      className={cn(
        size && AVATAR_SIZE[size],
        rounded && AVATAR_ROUNDED[rounded],
      )}
      {...props}
    />
  );
}

function AvatarImage(props: AvatarImageProps) {
  return <ShadcnAvatarImage {...props} />;
}

function AvatarFallback({ rounded, ...props }: AvatarFallbackProps) {
  return (
    <ShadcnAvatarFallback
      className={cn(
        'dark:bg-foreground/15 dark:text-foreground',
        rounded && AVATAR_ROUNDED[rounded],
      )}
      {...props}
    />
  );
}

function AvatarBadge(props: AvatarBadgeProps) {
  return <ShadcnAvatarBadge {...props} />;
}

function AvatarGroup(props: AvatarGroupProps) {
  return <ShadcnAvatarGroup {...props} />;
}

function AvatarGroupCount(props: AvatarGroupCountProps) {
  return <ShadcnAvatarGroupCount {...props} />;
}

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
};
