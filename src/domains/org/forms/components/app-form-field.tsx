import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { Input } from '@components/ds/atoms/input';
import { Label } from '@components/ds/atoms/label';
import { List, ListItem } from '@components/ds/atoms/list';
import { PasswordInput } from '@components/ds/atoms/password-input';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import type { FormFieldProps } from '@domains/org/forms/components/app-form-field.types';
import { normalizeFieldErrors } from '@domains/org/forms/components/normalize-field-errors';
import { RequiredAsterisk } from '@domains/org/forms/components/required-asterisk';
import { useFieldContext } from '@domains/org/forms/hooks/app-form';
import { useIsFieldRequired } from '@domains/org/forms/hooks/use-is-field-required';

export function AppFormField({
  label,
  placeholder,
  type = 'text',
  helperText,
  children,
  onChange,
}: FormFieldProps) {
  const field = useFieldContext<string | number>();
  const required = useIsFieldRequired();
  const errorMessages = normalizeFieldErrors(field.state.meta.errors);
  const hasError = errorMessages.length > 0;

  return (
    <Grid gap="xs">
      <HStack>
        <Label htmlFor={field.name}>
          {label}
          {required && <RequiredAsterisk />}
        </Label>
        {children}
      </HStack>
      {type === 'password' ? (
        <PasswordInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field.name}-error` : undefined}
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field.name}-error` : undefined}
        />
      )}
      {helperText && <SecondaryParagraph>{helperText}</SecondaryParagraph>}
      {hasError && (
        <List
          id={`${field.name}-error`}
          variant="error"
          role="alert"
        >
          {errorMessages.map((message, index) => (
            <ListItem key={`${field.name}-error-${index}`}>{message}</ListItem>
          ))}
        </List>
      )}
    </Grid>
  );
}
