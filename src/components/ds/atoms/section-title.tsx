type SectionTitleProps = Omit<React.ComponentProps<'h1'>, 'className'>;

export function SectionTitle({ children, ...props }: SectionTitleProps) {
  return (
    <h1
      className="text-2xl font-semibold"
      {...props}
    >
      {children}
    </h1>
  );
}

export type { SectionTitleProps };
