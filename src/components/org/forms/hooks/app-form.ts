import { AppFormField } from '@components/org/forms/components/app-form-field';
import { AppSubscribeErrorButton } from '@components/org/forms/components/app-form-subscribe-error';
import { AppSubscribeSubmitButton } from '@components/org/forms/components/app-form-subscribe-submit';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    AppFormField,
  },
  formComponents: {
    AppSubscribeSubmitButton,
    AppSubscribeErrorButton,
  },
});
