import type { AnyFieldApi as FieldApi } from '@tanstack/react-form';
import type React from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface FormFieldProps {
  field: FieldApi;
  label: string;
  placeholder?: string;
  type?: ComponentPropsWithoutRef<'input'>['type'];
  required?: boolean;
  children?: React.ReactNode;
}
