import { Input as ShadcnInput } from '@components/ui/input';
import { cn } from '@lib/utils';

type ShadcnInputProps = React.ComponentProps<typeof ShadcnInput>;

type InputFont = 'mono';
type InputSize = 'xs' | 'sm' | 'default';

interface InputProps extends Omit<ShadcnInputProps, 'className' | 'style'> {
  font?: InputFont;
  inputSize?: InputSize;
  fullWidth?: boolean;
  padding?: 'search';
  grow?: boolean;
  colorPicker?: boolean;
}

function Input({
  font,
  inputSize,
  fullWidth = true,
  padding,
  grow,
  colorPicker,
  ...props
}: InputProps) {
  return (
    <ShadcnInput
      className={cn(
        font === 'mono' && 'font-mono text-xs',
        inputSize === 'xs' && 'h-8 text-xs',
        inputSize === 'sm' && 'h-7 w-48 text-xs',
        !fullWidth && 'w-auto',
        padding === 'search' && 'pl-9 pr-9',
        grow && 'flex-1',
        colorPicker && 'h-10 w-14 cursor-pointer p-1',
      )}
      {...props}
    />
  );
}

export { Input };
