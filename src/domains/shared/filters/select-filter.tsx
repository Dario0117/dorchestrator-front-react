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
}

const ALL_VALUE = '__all__';

export function SelectFilter({
  value,
  onChange,
  options,
  allLabel = 'All',
  placeholder,
  ariaLabel,
}: SelectFilterProps) {
  const handleChange = (selected: string | null) => {
    /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
    if (selected === null) {
      return;
    }
    /* v8 ignore stop */
    onChange(selected === ALL_VALUE ? undefined : selected);
  };

  return (
    <Select
      value={value ?? null}
      onValueChange={handleChange}
    >
      <SelectTrigger aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder ?? allLabel} />
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
