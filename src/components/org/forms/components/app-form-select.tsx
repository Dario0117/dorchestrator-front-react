import { normalizeFieldErrors } from '@components/org/forms/components/normalize-field-errors';
import { useFieldContext } from '@components/org/forms/hooks/app-form';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface AppFormSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
}

export function AppFormSelect({
  label,
  placeholder = 'Select an option...',
  options,
  required = false,
  disabled = false,
}: AppFormSelectProps) {
  const field = useFieldContext<string | number>();
  const errorMessages = normalizeFieldErrors(field.state.meta.errors);
  const hasError = errorMessages.length > 0;

  const currentValue = field.state.value ? String(field.state.value) : '';

  const handleChange = (value: string | null) => {
    /* v8 ignore start -- Base UI types onValueChange as string | null but never emits null */
    if (value === null) {
      return;
    }
    /* v8 ignore stop */
    if (typeof field.state.value === 'number') {
      field.handleChange(Number(value));
    } else {
      field.handleChange(value);
    }
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor={field.name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Select
        value={currentValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          onBlur={field.handleBlur}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field.name}-error` : undefined}
          className="h-11 w-full text-base md:text-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
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
      {hasError && (
        <ul
          id={`${field.name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {errorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
