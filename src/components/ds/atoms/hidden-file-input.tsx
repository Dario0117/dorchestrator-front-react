interface HiddenFileInputProps
  extends Omit<React.ComponentProps<'input'>, 'className' | 'style' | 'type'> {}

function HiddenFileInput({ ref, ...props }: HiddenFileInputProps) {
  return (
    <input
      ref={ref}
      type="file"
      className="hidden"
      {...props}
    />
  );
}

export { HiddenFileInput };
