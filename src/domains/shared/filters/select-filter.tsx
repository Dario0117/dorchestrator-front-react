import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';

interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: SelectFilterOption[];
  allLabel?: string;
  placeholder?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
}

const ALL_VALUE = '__all__';

export function SelectFilter({
  value,
  onChange,
  options,
  allLabel = 'All',
  placeholder,
  ariaLabel,
  fullWidth,
}: SelectFilterProps) {
  const handleChange = (selected: string | null) => {
    /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
    if (selected === null) {
      return;
    }
    /* v8 ignore stop */
    onChange(selected === ALL_VALUE ? undefined : selected);
  };

  // Base UI's SelectValue can't resolve the label when items are in a Portal
  // and the dropdown hasn't been opened yet. Look up the label from options
  // as a fallback so pre-existing URL filter values display correctly.
  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label
    : undefined;

  return (
    <Select
      value={value ?? null}
      onValueChange={handleChange}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        width={fullWidth ? 'full' : undefined}
      >
        <SelectValue placeholder={placeholder ?? allLabel}>
          {selectedLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
