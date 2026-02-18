import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

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
  className?: string;
}

const ALL_VALUE = '__all__';

export function SelectFilter({
  value,
  onChange,
  options,
  allLabel = 'All',
  placeholder,
  ariaLabel,
  className = 'h-11 w-full text-base md:w-auto md:text-sm',
}: SelectFilterProps) {
  const handleChange = (selected: string) => {
    onChange(selected === ALL_VALUE ? undefined : selected);
  };

  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={handleChange}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={className}
      >
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
