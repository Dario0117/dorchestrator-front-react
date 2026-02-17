import { normalizeFieldErrors } from '@components/org/forms/components/normalize-field-errors';
import { useFieldContext } from '@components/org/forms/hooks/app-form';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';

interface AppFormTextareaProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

export function AppFormTextarea({
  label,
  placeholder,
  required = false,
  rows = 4,
  maxLength,
}: AppFormTextareaProps) {
  const field = useFieldContext<string>();
  const errorMessages = normalizeFieldErrors(field.state.meta.errors);
  const hasError = errorMessages.length > 0;
  const charCount =
    typeof field.state.value === 'string' ? field.state.value.length : 0;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  return (
    <div className="grid gap-3">
      <Label htmlFor={field.name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        className={cn(
          'placeholder:text-muted-foreground border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none resize-y disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'dark:bg-input/30',
        )}
      />
      <div className="flex items-center justify-between">
        <div>
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
        {maxLength !== undefined && (
          <span
            className={cn(
              'text-sm text-muted-foreground',
              isOverLimit && 'text-destructive',
            )}
          >
            {charCount.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
