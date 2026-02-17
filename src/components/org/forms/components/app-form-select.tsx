import { normalizeFieldErrors } from '@components/org/forms/components/normalize-field-errors';
import { useFieldContext } from '@components/org/forms/hooks/app-form';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import type React from 'react';

interface AppFormSelectProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function AppFormSelect({
  label,
  required = false,
  disabled = false,
  children,
}: AppFormSelectProps) {
  const field = useFieldContext<string | number>();
  const errorMessages = normalizeFieldErrors(field.state.meta.errors);
  const hasError = errorMessages.length > 0;

  return (
    <div className="grid gap-3">
      <Label htmlFor={field.name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const rawValue = e.target.value;
          if (typeof field.state.value === 'number') {
            field.handleChange(Number(rawValue));
          } else {
            field.handleChange(rawValue);
          }
        }}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        className={cn(
          'border-input flex h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'dark:bg-input/30',
        )}
      >
        {children}
      </select>
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
