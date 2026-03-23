import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { CreateOrganizationForm } from '@domains/org/forms/create-organization.form';
import { useCreateOrganizationMutation } from '@domains/org/services/organizations/create-organization.http-service';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onSuccess,
}: CreateOrganizationModalProps) {
  const createOrganizationMutation = useCreateOrganizationMutation();

  return (
    <Dialog
      open={isOpen}
      modal
      // biome-ignore lint/suspicious/noEmptyBlockStatements: intentionally prevent close
      onOpenChange={() => {}}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            Before you can continue, you need to create an organization. This
            will be your workspace for managing devices, commands and more.
          </DialogDescription>
        </DialogHeader>

        <CreateOrganizationForm
          createOrganizationMutation={createOrganizationMutation}
          handleSuccess={() => {
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
