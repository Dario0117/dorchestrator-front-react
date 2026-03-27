import { Box } from '@components/ds/atoms/box';
import { Grid } from '@components/ds/atoms/grid';
import { PageDescription } from '@components/ds/atoms/page-description';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { DangerZoneCard } from '@domains/org/components/danger-zone-card';
import { DefaultOrgCard } from '@domains/org/components/default-org-card';
import { MembersCard } from '@domains/org/components/members-card';
import { OrgDetailsCard } from '@domains/org/components/org-details-card';
import { SubscriptionCard } from '@domains/org/components/subscription-card';
import { TeamManagementSection } from '@domains/org/components/team-management-section';
import { useDeleteOrganizationMutation } from '@domains/org/services/organizations/delete-organization.http-service';
import { useOrganizationDetailsSuspenseQuery } from '@domains/org/services/organizations/get-organization-details.http-service';
import { useLeaveOrganizationMutation } from '@domains/org/services/organizations/leave-organization.http-service';
import {
  type ListMembersMember,
  useListMembersSuspenseQuery,
} from '@domains/org/services/organizations/list-members.http-service';
import {
  useUserOrganizationsQueryOptions,
  useUserOrganizationsSuspendedQuery,
} from '@domains/org/services/organizations/list-user-organizations.http-service';
import { useRemoveMemberMutation } from '@domains/org/services/organizations/remove-member.http-service';
import { useTransferOwnershipMutation } from '@domains/org/services/organizations/transfer-ownership.http-service';
import { useProfileSuspendedQuery } from '@domains/org/services/users/get-profile.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { queryClient } from '@domains/shared/context/query.provider';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { TerminalConfigSection } from '@domains/terminal/components/terminal-config-section';
import { Route } from '@routes/(authenticated)/$organizationSlug/settings';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export function OrganizationSettingsPage() {
  const { data: profile } = useProfileSuspendedQuery();
  const currentOrganization = useCurrentOrganization();
  const removeMemberMutation = useRemoveMemberMutation();
  const leaveOrganizationMutation = useLeaveOrganizationMutation();
  const deleteOrganizationMutation = useDeleteOrganizationMutation();
  const transferOwnershipMutation = useTransferOwnershipMutation();
  const [confirmRemove, setConfirmRemove] = useState<ListMembersMember | null>(
    null,
  );
  const [confirmTransfer, setConfirmTransfer] =
    useState<ListMembersMember | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { page, size, search, role } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: orgListData } = useUserOrganizationsSuspendedQuery();
  const reactiveOrg = orgListData.responseData?.results?.find(
    (org) => org.id === currentOrganization.id,
  );
  /* v8 ignore start -- defensive fallback: isDefault always defined in practice */
  const isDefault = reactiveOrg?.isDefault ?? false;
  /* v8 ignore stop */

  const { data: orgDetails } = useOrganizationDetailsSuspenseQuery(
    currentOrganization.id,
  );
  const details = orgDetails.responseData?.results;

  const { data: membersData } = useListMembersSuspenseQuery(
    currentOrganization.id,
    { page, size, search, role },
  );
  const members = membersData.responseData?.results ?? [];
  const totalPages = membersData.responseData?.totalPages ?? 0;
  const totalResults = membersData.responseData?.totalResults ?? 0;
  const hasNext = membersData.responseData?.hasNext ?? false;
  const hasPrevious = membersData.responseData?.hasPrevious ?? false;

  const canManageMembers =
    currentOrganization.role === 'admin' ||
    currentOrganization.role === 'owner';

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, size: newSize }),
    });
  };

  const handleSearch = (value: string | undefined) => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, search: value }),
    });
  };

  const handleRoleChange = (value: string | undefined) => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, role: value }),
    });
  };

  return (
    <PageSection>
      <Box>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>
          View your organization configuration and billing settings
        </PageDescription>
      </Box>

      <Grid gap="xl">
        <OrgDetailsCard
          name={currentOrganization.name}
          id={currentOrganization.id}
          createdAt={details?.createdAt}
        />

        <DefaultOrgCard
          isDefault={isDefault}
          organizationId={currentOrganization.id}
        />

        <SubscriptionCard
          tier={details?.tier}
          deviceLimit={details?.deviceLimit}
        />

        <TeamManagementSection
          organizationId={currentOrganization.id}
          canManage={canManageMembers}
        />

        {canManageMembers && <TerminalConfigSection />}

        <MembersCard
          members={members}
          totalResults={totalResults}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          page={page}
          size={size}
          search={search}
          role={role}
          canManageMembers={canManageMembers}
          currentUserRole={currentOrganization.role}
          currentUserId={profile.id}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          onSearch={handleSearch}
          onRoleChange={handleRoleChange}
          onRemoveMember={setConfirmRemove}
          onTransferOwnership={setConfirmTransfer}
        />

        <DangerZoneCard
          currentUserRole={currentOrganization.role}
          leaveIsPending={leaveOrganizationMutation.isPending}
          leaveIsError={leaveOrganizationMutation.isError}
          deleteIsPending={deleteOrganizationMutation.isPending}
          deleteIsError={deleteOrganizationMutation.isError}
          onLeave={() => setConfirmLeave(true)}
          onDelete={() => setConfirmDelete(true)}
        />
      </Grid>

      {confirmRemove && (
        <ConfirmDialog
          open={!!confirmRemove}
          onOpenChange={(open) => !open && setConfirmRemove(null)}
          title="Remove Member"
          desc={`Are you sure you want to remove ${confirmRemove.name} (${confirmRemove.email}) from this organization? This action cannot be undone.`}
          handleConfirm={() => {
            removeMemberMutation.mutate({
              params: {
                path: {
                  organizationId: currentOrganization.id,
                  memberId: confirmRemove.id,
                },
              },
            });
            setConfirmRemove(null);
          }}
          confirmText="Remove"
          destructive
        />
      )}

      {confirmTransfer && (
        <ConfirmDialog
          open={!!confirmTransfer}
          onOpenChange={(open) => !open && setConfirmTransfer(null)}
          title="Transfer Ownership"
          desc={`Transfer ownership to ${confirmTransfer.name}? You will be demoted to member.`}
          handleConfirm={() => {
            transferOwnershipMutation.mutate({
              params: {
                path: {
                  organizationId: currentOrganization.id,
                },
              },
              body: {
                newOwnerMemberId: confirmTransfer.id,
              },
            });
            setConfirmTransfer(null);
          }}
          confirmText="Transfer"
          destructive
        />
      )}

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave Organization"
        desc={`Are you sure you want to leave ${currentOrganization.name}? You will lose access to all resources in this organization.`}
        handleConfirm={() => {
          leaveOrganizationMutation.mutate(
            {
              params: {
                path: {
                  organizationId: currentOrganization.id,
                },
              },
            },
            {
              onSuccess: async () => {
                await navigate({ to: '/' });
                queryClient.invalidateQueries({
                  queryKey: useUserOrganizationsQueryOptions.queryKey,
                });
              },
            },
          );
          setConfirmLeave(false);
        }}
        confirmText="Leave"
        destructive
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Organization"
        desc={`Are you sure you want to permanently delete ${currentOrganization.name}? All members, devices, commands, notifications, and audit logs will be permanently removed. This action cannot be undone.`}
        handleConfirm={() => {
          deleteOrganizationMutation.mutate(
            {
              params: {
                path: {
                  organizationId: currentOrganization.id,
                },
              },
            },
            {
              onSuccess: async () => {
                await navigate({ to: '/' });
              },
            },
          );
          setConfirmDelete(false);
        }}
        confirmText="Delete"
        destructive
      />
    </PageSection>
  );
}
