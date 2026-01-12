import { CreateOrganizationModal } from '@components/org/modals/create-organization.modal';
import { queryClient } from '@context/query.provider';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { useOrganizationStore } from '@stores/organization.store';
import { DEFAULT_ORGANIZATION_ID } from '@stores/organization.store.constants';
import { useEffect, useState } from 'react';

interface OrganizationCheckWrapperProps {
  children: React.ReactNode;
}

export function OrganizationCheckWrapper({
  children,
}: OrganizationCheckWrapperProps) {
  const { currentOrganization } = useOrganizationStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has at least one organization
    const hasDefaultOrganization =
      currentOrganization.id !== DEFAULT_ORGANIZATION_ID;
    setShowModal(!hasDefaultOrganization);
  }, [currentOrganization]);

  const handleOrganizationCreated = () => {
    // Refetch organizations to update the list
    queryClient.invalidateQueries({
      queryKey: useUserOrganizationsQueryOptions.queryKey,
    });
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <CreateOrganizationModal
          isOpen={showModal}
          onSuccess={handleOrganizationCreated}
        />
      )}
      {children}
    </>
  );
}
