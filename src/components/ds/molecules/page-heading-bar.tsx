import { ResponsiveRow } from '@components/ds/atoms/responsive-row';

type PageHeadingBarProps = Omit<
  React.ComponentProps<'div'>,
  'className' | 'style'
>;

export function PageHeadingBar({ children, ...props }: PageHeadingBarProps) {
  return (
    <ResponsiveRow
      justify="between"
      align="center"
      gap="sm"
      {...props}
    >
      {children}
    </ResponsiveRow>
  );
}
