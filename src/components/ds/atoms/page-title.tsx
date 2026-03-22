type PageTitleProps = Omit<React.ComponentProps<'h1'>, 'className'>;

export function PageTitle({ children, ...props }: PageTitleProps) {
  return (
    <h1
      className="text-3xl font-semibold"
      {...props}
    >
      {children}
    </h1>
  );
}

export type { PageTitleProps };
