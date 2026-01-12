import { CreateOrganizationModal } from '@components/org/modals/create-organization.modal';
import { queryClient } from '@context/query.provider';
import {
  useUserOrganizationsQueryOptions,
  useUserOrganizationsSuspendedQuery,
} from '@services/organizations/list-user-organizations.http-service';
import { useOrganizationStore } from '@stores/organization.store';
import { useEffect, useState } from 'react';

interface OrganizationCheckWrapperProps {
  children: React.ReactNode;
}

export function OrganizationCheckWrapper({
  children,
}: OrganizationCheckWrapperProps) {
  const { data: organizations } = useUserOrganizationsSuspendedQuery();
  const { setOrganizations } = useOrganizationStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has at least one organization
    const hasOrganization = organizations.length > 0;
    setOrganizations(organizations);
    setShowModal(!hasOrganization);
  }, [organizations, setOrganizations]);

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
