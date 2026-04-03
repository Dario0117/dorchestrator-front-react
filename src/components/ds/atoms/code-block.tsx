import { cn } from '@lib/utils';

type CodeBlockVariant = 'default' | 'terminal';

const VARIANT: Record<CodeBlockVariant, string> = {
  default: 'rounded-md border bg-muted p-3 text-xs font-mono',
  terminal: 'overflow-auto bg-gray-950 p-4 font-mono text-sm',
};

type CodeBlockColor = 'success' | 'danger';

const COLOR: Record<CodeBlockColor, string> = {
  success: 'text-green-400',
  danger: 'text-red-400',
};

type CodeBlockMaxH = 'sm' | 'md' | 'lg';

const MAX_H: Record<CodeBlockMaxH, string> = {
  sm: 'max-h-[300px]',
  md: 'max-h-[500px]',
  lg: 'max-h-[700px]',
};

interface CodeBlockProps
  extends Omit<React.ComponentProps<'pre'>, 'className' | 'style'> {
  wrap?: boolean;
  variant?: CodeBlockVariant;
  color?: CodeBlockColor;
  maxH?: CodeBlockMaxH;
  spaceAbove?: 'sm';
  overflowAuto?: boolean;
  textSize?: 'sm';
}

function CodeBlock({
  wrap = true,
  variant = 'default',
  color,
  maxH,
  spaceAbove,
  overflowAuto,
  textSize,
  ref,
  ...props
}: CodeBlockProps) {
  return (
    <pre
      ref={ref}
      className={cn(
        VARIANT[variant],
        wrap && 'whitespace-pre-wrap',
        color && COLOR[color],
        maxH && MAX_H[maxH],
        spaceAbove === 'sm' && 'mt-1',
        overflowAuto && 'overflow-auto',
        textSize === 'sm' && 'text-sm',
      )}
      {...props}
    />
  );
}

export { CodeBlock };
