import { CreateOrganizationModal } from '@domains/org/modals/create-organization.modal';
import {
  useUserOrganizationsQueryOptions,
  useUserOrganizationsSuspendedQuery,
} from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { useEffect, useState } from 'react';

interface OrganizationCheckWrapperProps {
  children: React.ReactNode;
}

export function OrganizationCheckWrapper({
  children,
}: OrganizationCheckWrapperProps) {
  const { data } = useUserOrganizationsSuspendedQuery();
  const organizations = data.responseData?.results ?? [];
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has at least one organization
    const hasOrganizations = organizations.length > 0;
    setShowModal(!hasOrganizations);
  }, [organizations]);

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
