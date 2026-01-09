import type { FormFieldProps } from '@components/ui/form-field.types';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export function FormField({
  field,
  label,
  placeholder,
  type = 'text',
  required = false,
  children,
}: FormFieldProps) {
  const hasError = field.state.meta.errors?.length > 0;
  const errorMessage =
    field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0];

  return (
    <div className="grid gap-3">
      <div className="flex items-center">
        <Label htmlFor={field.name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {children}
      </div>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
      />
      {hasError && (
        <p
          id={`${field.name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {typeof errorMessage === 'string' ? errorMessage : 'Invalid input'}
        </p>
      )}
    </div>
  );
}
