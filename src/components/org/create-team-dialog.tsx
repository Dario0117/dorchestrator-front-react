import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { useCreateTeamForm } from '@components/org/forms/hooks/use-create-team-form';
import { generateSlugSuggestion } from '@lib/organization-logo.utils';
import { useCreateTeamMutation } from '@services/teams/create-team.http-service';

interface CreateTeamDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({
  organizationId,
  open,
  onOpenChange,
}: CreateTeamDialogProps) {
  const createTeamMutation = useCreateTeamMutation();

  const form = useCreateTeamForm({
    organizationId,
    createTeamMutation,
    handleSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-3">
            <form.AppField name="name">
              {(field) => (
                <field.AppFormField
                  label="Team Name"
                  placeholder="Team name"
                  required
                  onChange={(e) => {
                    const slugSuggestion = generateSlugSuggestion(
                      e.target.value,
                    );
                    if (slugSuggestion) {
                      form.setFieldValue('slug', slugSuggestion);
                    }
                  }}
                />
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => (
                <field.AppFormField
                  label="Team Slug"
                  placeholder="team-slug"
                  required
                  helperText="Used in URLs. Only lowercase letters, numbers, and hyphens."
                />
              )}
            </form.AppField>
          </div>
          <DialogFooter className="mt-4">
            <form.AppForm>
              <form.AppSubscribeSubmitButton label="Create" />
            </form.AppForm>
          </DialogFooter>
          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
