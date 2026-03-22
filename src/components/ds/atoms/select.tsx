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

const Select = ShadcnSelect;
const SelectGroup = ShadcnSelectGroup;
const SelectValue = ShadcnSelectValue;
const SelectTrigger = ShadcnSelectTrigger;
const SelectContent = ShadcnSelectContent;
const SelectLabel = ShadcnSelectLabel;
const SelectItem = ShadcnSelectItem;
const SelectSeparator = ShadcnSelectSeparator;
const SelectScrollUpButton = ShadcnSelectScrollUpButton;
const SelectScrollDownButton = ShadcnSelectScrollDownButton;

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
type SelectTriggerProps = React.ComponentProps<typeof ShadcnSelectTrigger>;
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
