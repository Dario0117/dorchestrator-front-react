import { Box } from '@components/ds/atoms/box';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { Label } from '@components/ds/atoms/label';
import { List, ListItem } from '@components/ds/atoms/list';
import { SmallText } from '@components/ds/atoms/small-text';
import { Textarea } from '@components/ds/atoms/textarea';
import { normalizeFieldErrors } from '@domains/org/forms/components/normalize-field-errors';
import { RequiredAsterisk } from '@domains/org/forms/components/required-asterisk';
import { useFieldContext } from '@domains/org/forms/hooks/app-form';

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
    <Grid>
      <Label htmlFor={field.name}>
        {label}
        {required && <RequiredAsterisk />}
      </Label>
      <Textarea
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
      />
      <HStack justify="between">
        <Box>
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
        </Box>
        {maxLength !== undefined && (
          <SmallText
            size="sm"
            color={isOverLimit ? 'destructive' : 'muted'}
          >
            {charCount.toLocaleString()}/{maxLength.toLocaleString()}
          </SmallText>
        )}
      </HStack>
    </Grid>
  );
}
