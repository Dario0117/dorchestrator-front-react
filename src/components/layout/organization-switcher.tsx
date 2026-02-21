import { TeamSwitcher } from '@components/layout/team-switcher';
import type { TeamSwitcherProps } from '@components/layout/team-switcher.types';
import { CreateOrganizationForm } from '@components/org/forms/create-organization.form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { queryClient } from '@context/query.provider';
import { useCreateOrganizationMutation } from '@services/organizations/create-organization.http-service';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export function OrganizationSwitcher(
  props: Omit<TeamSwitcherProps, 'label' | 'addButtonLabel' | 'onAdd'>,
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createOrganizationMutation = useCreateOrganizationMutation();
  const navigate = useNavigate();

  const handleSuccess = async (
    data: NonNullable<typeof createOrganizationMutation.data>,
  ) => {
    await queryClient.invalidateQueries({
      queryKey: useUserOrganizationsQueryOptions.queryKey,
    });
    setIsModalOpen(false);

    const slug = data.responseData?.results.slug;
    if (slug) {
      navigate({
        to: '/$organizationSlug',
        params: { organizationSlug: slug },
      });
    }
  };

  return (
    <>
      <TeamSwitcher
        {...props}
        label="Organizations"
        addButtonLabel="Add organization"
        onAdd={() => setIsModalOpen(true)}
      />
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage a separate set of devices and
              commands.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm
            createOrganizationMutation={createOrganizationMutation}
            handleSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
