type MetadataLabelProps = Omit<
  React.ComponentProps<'dt'>,
  'className' | 'style'
>;

function MetadataLabel({ ref, ...props }: MetadataLabelProps) {
  return (
    <dt
      ref={ref}
      className="text-sm font-medium text-muted-foreground"
      {...props}
    />
  );
}

export { MetadataLabel };
export type { MetadataLabelProps };
