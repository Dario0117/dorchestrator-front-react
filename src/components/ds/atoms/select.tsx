import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@components/ui/select';
import { cn } from '@lib/utils';

const Select = ShadcnSelect;
const SelectValue = ShadcnSelectValue;
const SelectContent = ShadcnSelectContent;
const SelectItem = ShadcnSelectItem;

type ShadcnSelectTriggerProps = React.ComponentProps<
  typeof ShadcnSelectTrigger
>;

type SelectTriggerWidth = 'auto' | 'full' | 'compact';

interface SelectTriggerProps
  extends Omit<ShadcnSelectTriggerProps, 'className' | 'style'> {
  width?: SelectTriggerWidth;
  grow?: boolean;
}

function SelectTrigger({ width, grow, ...props }: SelectTriggerProps) {
  return (
    <ShadcnSelectTrigger
      className={cn(
        width === 'auto' && 'w-auto',
        width === 'full' && 'w-full',
        width === 'compact' && 'h-9 w-20',
        grow && 'flex-1',
      )}
      {...props}
    />
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
