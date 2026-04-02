import { Grid } from '@components/ds/atoms/grid';
import { Label } from '@components/ds/atoms/label';
import { List, ListItem } from '@components/ds/atoms/list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { normalizeFieldErrors } from '@domains/org/forms/components/normalize-field-errors';
import { RequiredAsterisk } from '@domains/org/forms/components/required-asterisk';
import { useFieldContext } from '@domains/org/forms/hooks/app-form';
import { useIsFieldRequired } from '@domains/org/forms/hooks/use-is-field-required';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AppFormSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function AppFormSelect({
  label,
  placeholder = 'Select an option...',
  options,
  disabled = false,
}: AppFormSelectProps) {
  const field = useFieldContext<string | number>();
  const required = useIsFieldRequired();
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

  const selectedLabel =
    options.find((o) => o.value === currentValue)?.label ?? null;

  return (
    <Grid>
      <Label htmlFor={field.name}>
        {label}
        {required && <RequiredAsterisk />}
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
          width="full"
        >
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasError && (
        <List
          id={`${field.name}-error`}
          variant="error"
          role="alert"
        >
          {errorMessages.map((message) => (
            <ListItem key={message}>{message}</ListItem>
          ))}
        </List>
      )}
    </Grid>
  );
}
