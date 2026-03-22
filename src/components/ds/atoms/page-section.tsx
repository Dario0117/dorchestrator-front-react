type PageSectionProps = Omit<React.ComponentProps<'section'>, 'className'>;

export function PageSection({ children, ...props }: PageSectionProps) {
  return (
    <section
      className="space-y-6 p-6 md:p-10"
      {...props}
    >
      {children}
    </section>
  );
}

export type { PageSectionProps };
