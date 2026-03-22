import { CommandForm } from '@components/commands/forms/command-form';
import { useCommandForm } from '@components/commands/forms/hooks/use-command-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { useSubmitCommandMutation } from '@services/commands/submit-command.http-service';

export interface PinnedDevice {
  id: number;
  name: string;
}

interface ExecuteCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  teamId: string;
  pinnedDevice?: PinnedDevice;
}

export function ExecuteCommandModal({
  open,
  onOpenChange,
  organizationId,
  teamId,
  pinnedDevice,
}: ExecuteCommandModalProps) {
  const submitCommandMutation = useSubmitCommandMutation();

  const form = useCommandForm({
    submitCommandMutation,
    organizationId,
    teamId,
    initialDeviceId: pinnedDevice?.id,
    handleSuccess() {
      form.reset();
      onOpenChange(false);
    },
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Execute Command</DialogTitle>
          <DialogDescription>
            {pinnedDevice
              ? `Execute a command on ${pinnedDevice.name}.`
              : 'Select a device and enter the command to execute.'}
          </DialogDescription>
        </DialogHeader>
        <CommandForm
          form={form}
          pinnedDevice={pinnedDevice}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
