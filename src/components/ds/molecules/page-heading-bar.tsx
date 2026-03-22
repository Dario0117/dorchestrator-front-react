type PageHeadingBarProps = Omit<React.ComponentProps<'div'>, 'className'>;

export function PageHeadingBar({ children, ...props }: PageHeadingBarProps) {
  return (
    <div
      className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      {...props}
    >
      {children}
    </div>
  );
}

export type { PageHeadingBarProps };
