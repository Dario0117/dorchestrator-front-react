interface RangeSliderProps
  extends Omit<React.ComponentProps<'input'>, 'className' | 'style' | 'type'> {}

function RangeSlider({ ref, ...props }: RangeSliderProps) {
  return (
    <input
      ref={ref}
      type="range"
      className="w-full"
      {...props}
    />
  );
}

export { RangeSlider };
