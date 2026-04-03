type TableWrapperProps = Omit<
  React.ComponentProps<'div'>,
  'className' | 'style'
>;

function TableWrapper({ ref, ...props }: TableWrapperProps) {
  return (
    <div
      ref={ref}
      className="rounded-md border"
      {...props}
    />
  );
}

export { TableWrapper };
