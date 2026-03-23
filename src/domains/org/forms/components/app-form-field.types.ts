import type React from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface FormFieldProps {
  label: string;
  placeholder?: string;
  helperText?: string;
  type?: ComponentPropsWithoutRef<'input'>['type'];
  required?: boolean;
  children?: React.ReactNode;
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}
