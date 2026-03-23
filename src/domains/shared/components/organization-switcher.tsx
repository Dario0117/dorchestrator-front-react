import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { CreateOrganizationForm } from '@domains/org/forms/create-organization.form';
import { useCreateOrganizationMutation } from '@domains/org/services/organizations/create-organization.http-service';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { TeamSwitcher } from '@domains/shared/components/team-switcher';
import type { TeamSwitcherProps } from '@domains/shared/components/team-switcher.types';
import { queryClient } from '@domains/shared/context/query.provider';
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
