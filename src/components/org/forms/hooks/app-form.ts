import { AppFormField } from '@components/org/forms/components/app-form-field';
import { AppFormSelect } from '@components/org/forms/components/app-form-select';
import { AppSubscribeErrorButton } from '@components/org/forms/components/app-form-subscribe-error';
import { AppSubscribeSubmitButton } from '@components/org/forms/components/app-form-subscribe-submit';
import { AppFormTextarea } from '@components/org/forms/components/app-form-textarea';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    AppFormField,
    AppFormSelect,
    AppFormTextarea,
  },
  formComponents: {
    AppSubscribeSubmitButton,
    AppSubscribeErrorButton,
  },
});
