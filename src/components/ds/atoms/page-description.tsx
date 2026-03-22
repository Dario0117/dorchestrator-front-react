type PageDescriptionProps = Omit<React.ComponentProps<'p'>, 'className'>;

export function PageDescription({ children, ...props }: PageDescriptionProps) {
  return (
    <p
      className="text-muted-foreground"
      {...props}
    >
      {children}
    </p>
  );
}

export type { PageDescriptionProps };
