type DefinitionListProps = Omit<
  React.ComponentProps<'dl'>,
  'className' | 'style'
>;

function DefinitionList({ ref, ...props }: DefinitionListProps) {
  return (
    <dl
      ref={ref}
      className="space-y-4"
      {...props}
    />
  );
}

export { DefinitionList };
export type { DefinitionListProps };
