import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectGroup as ShadcnSelectGroup,
  SelectItem as ShadcnSelectItem,
  SelectLabel as ShadcnSelectLabel,
  SelectScrollDownButton as ShadcnSelectScrollDownButton,
  SelectScrollUpButton as ShadcnSelectScrollUpButton,
  SelectSeparator as ShadcnSelectSeparator,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@components/ui/select';
import { cn } from '@lib/utils';

const Select = ShadcnSelect;
const SelectGroup = ShadcnSelectGroup;
const SelectValue = ShadcnSelectValue;
const SelectContent = ShadcnSelectContent;
const SelectLabel = ShadcnSelectLabel;
const SelectItem = ShadcnSelectItem;
const SelectSeparator = ShadcnSelectSeparator;
const SelectScrollUpButton = ShadcnSelectScrollUpButton;
const SelectScrollDownButton = ShadcnSelectScrollDownButton;

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

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
export type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
};

type SelectProps = React.ComponentProps<typeof ShadcnSelect>;
type SelectGroupProps = React.ComponentProps<typeof ShadcnSelectGroup>;
type SelectValueProps = React.ComponentProps<typeof ShadcnSelectValue>;
type SelectContentProps = React.ComponentProps<typeof ShadcnSelectContent>;
type SelectLabelProps = React.ComponentProps<typeof ShadcnSelectLabel>;
type SelectItemProps = React.ComponentProps<typeof ShadcnSelectItem>;
type SelectSeparatorProps = React.ComponentProps<typeof ShadcnSelectSeparator>;
type SelectScrollUpButtonProps = React.ComponentProps<
  typeof ShadcnSelectScrollUpButton
>;
type SelectScrollDownButtonProps = React.ComponentProps<
  typeof ShadcnSelectScrollDownButton
>;
