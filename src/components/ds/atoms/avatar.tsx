import {
  Avatar as ShadcnAvatar,
  AvatarBadge as ShadcnAvatarBadge,
  AvatarFallback as ShadcnAvatarFallback,
  AvatarGroup as ShadcnAvatarGroup,
  AvatarGroupCount as ShadcnAvatarGroupCount,
  AvatarImage as ShadcnAvatarImage,
} from '@components/ui/avatar';

type ShadcnAvatarProps = React.ComponentProps<typeof ShadcnAvatar>;
interface AvatarProps extends ShadcnAvatarProps {}

type ShadcnAvatarImageProps = React.ComponentProps<typeof ShadcnAvatarImage>;
interface AvatarImageProps extends ShadcnAvatarImageProps {}

type ShadcnAvatarFallbackProps = React.ComponentProps<
  typeof ShadcnAvatarFallback
>;
interface AvatarFallbackProps extends ShadcnAvatarFallbackProps {}

type ShadcnAvatarBadgeProps = React.ComponentProps<typeof ShadcnAvatarBadge>;
interface AvatarBadgeProps extends ShadcnAvatarBadgeProps {}

type ShadcnAvatarGroupProps = React.ComponentProps<typeof ShadcnAvatarGroup>;
interface AvatarGroupProps extends ShadcnAvatarGroupProps {}

type ShadcnAvatarGroupCountProps = React.ComponentProps<
  typeof ShadcnAvatarGroupCount
>;
interface AvatarGroupCountProps extends ShadcnAvatarGroupCountProps {}

function Avatar(props: AvatarProps) {
  return <ShadcnAvatar {...props} />;
}

function AvatarImage(props: AvatarImageProps) {
  return <ShadcnAvatarImage {...props} />;
}

function AvatarFallback(props: AvatarFallbackProps) {
  return <ShadcnAvatarFallback {...props} />;
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
export type {
  AvatarBadgeProps,
  AvatarFallbackProps,
  AvatarGroupCountProps,
  AvatarGroupProps,
  AvatarImageProps,
  AvatarProps,
};
