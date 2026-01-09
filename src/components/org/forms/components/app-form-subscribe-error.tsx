import { useFormContext } from '@components/org/forms/hooks/app-form';
import { FormErrorDisplay } from '@components/ui/form-error-display';

export function AppSubscribeErrorButton() {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.errorMap]}>
      {([errorMap]) => {
        return <FormErrorDisplay errors={errorMap?.onSubmit} />;
      }}
    </form.Subscribe>
  );
}
