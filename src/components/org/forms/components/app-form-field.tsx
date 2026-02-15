import type { FormFieldProps } from '@components/org/forms/components/app-form-field.types';
import { useFieldContext } from '@components/org/forms/hooks/app-form';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { PasswordInput } from '@components/ui/password-input';

function normalizeFieldErrors(errors: unknown[]) {
  const messages: string[] = [];
  for (const error of errors) {
    if (typeof error === 'string') {
      messages.push(error);
    } else if (Array.isArray(error)) {
      messages.push(...error.filter((e): e is string => typeof e === 'string'));
    } else if (
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      messages.push((error as { message: string }).message);
    } else {
      messages.push('Invalid input');
    }
  }
  return messages;
}

export function AppFormField({
  label,
  placeholder,
  type = 'text',
  helperText,
  required = false,
  children,
  onChange,
}: FormFieldProps) {
  const field = useFieldContext<string | number>();
  const errorMessages = normalizeFieldErrors(field.state.meta.errors);
  const hasError = errorMessages.length > 0;

  return (
    <div className="grid gap-3">
      <div className="flex items-center">
        <Label htmlFor={field.name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {children}
      </div>
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
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
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
