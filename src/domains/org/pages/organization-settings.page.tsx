import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Badge } from '@components/ds/atoms/badge';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { DefinitionList } from '@components/ds/atoms/definition-list';
import { DefinitionValue } from '@components/ds/atoms/definition-value';
import { Grid } from '@components/ds/atoms/grid';
import { MetadataLabel } from '@components/ds/atoms/metadata-label';
import { PageDescription } from '@components/ds/atoms/page-description';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { Stack } from '@components/ds/atoms/stack';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { TeamManagementSection } from '@domains/org/components/team-management-section';
import { useDeleteOrganizationMutation } from '@domains/org/services/organizations/delete-organization.http-service';
import { useOrganizationDetailsSuspenseQuery } from '@domains/org/services/organizations/get-organization-details.http-service';
import { useLeaveOrganizationMutation } from '@domains/org/services/organizations/leave-organization.http-service';
import {
  type ListMembersMember,
  useListMembersSuspenseQuery,
} from '@domains/org/services/organizations/list-members.http-service';
import type { MemberRole } from '@domains/org/services/organizations/list-members.http-service.constants';
import {
  useUserOrganizationsQueryOptions,
  useUserOrganizationsSuspendedQuery,
} from '@domains/org/services/organizations/list-user-organizations.http-service';
import { useRemoveMemberMutation } from '@domains/org/services/organizations/remove-member.http-service';
import { useSetDefaultOrganizationMutation } from '@domains/org/services/organizations/set-default-organization.http-service';
import { useTransferOwnershipMutation } from '@domains/org/services/organizations/transfer-ownership.http-service';
import { useProfileSuspendedQuery } from '@domains/org/services/users/get-profile.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { queryClient } from '@domains/shared/context/query.provider';
import { SearchInput } from '@domains/shared/filters/search-input';
import { SelectFilter } from '@domains/shared/filters/select-filter';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { TerminalConfigSection } from '@domains/terminal/components/terminal-config-section';
import { Route } from '@routes/(authenticated)/$organizationSlug/settings';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Info,
  LogOut,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

export function OrganizationSettingsPage() {
  const { data: profile } = useProfileSuspendedQuery();
  const currentOrganization = useCurrentOrganization();
  const setDefaultMutation = useSetDefaultOrganizationMutation();
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
  const isDefault = reactiveOrg?.isDefault ?? false;

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
        <Card>
          <CardHeader>
            <CardTitle icon>
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList>
              <Box>
                <MetadataLabel>Organization Name</MetadataLabel>
                <DefinitionValue>{currentOrganization.name}</DefinitionValue>
              </Box>

              <Box>
                <MetadataLabel>Organization ID</MetadataLabel>
                <DefinitionValue mono>{currentOrganization.id}</DefinitionValue>
              </Box>

              <Box>
                <MetadataLabel>Created</MetadataLabel>
                <DefinitionValue>
                  {details?.createdAt
                    ? new Date(details.createdAt).toLocaleDateString()
                    : 'N/A'}
                </DefinitionValue>
              </Box>
            </DefinitionList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon>
              <Star className="h-5 w-5 text-muted-foreground" />
              Default Organization
            </CardTitle>
          </CardHeader>
          <CardContent gap="lg">
            {isDefault ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  This is your default organization. You will be redirected here
                  after logging in.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <SecondaryParagraph>
                  Set this organization as your default to be redirected here
                  after logging in.
                </SecondaryParagraph>
                <Button
                  variant="outline"
                  disabled={setDefaultMutation.isPending}
                  onClick={() =>
                    setDefaultMutation.mutate({
                      body: { organizationId: currentOrganization.id },
                    })
                  }
                >
                  {setDefaultMutation.isPending
                    ? 'Setting...'
                    : 'Set as default organization'}
                </Button>
              </>
            )}
            {setDefaultMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to set default organization. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent gap="lg">
            <DefinitionList>
              <Box>
                <MetadataLabel>Current Tier</MetadataLabel>
                <DefinitionValue>
                  {details?.tier ?? 'Free Tier'}
                </DefinitionValue>
              </Box>

              <Box>
                <MetadataLabel>Device Limit</MetadataLabel>
                <DefinitionValue>
                  {details?.deviceLimit ?? 'Unlimited'}
                </DefinitionValue>
              </Box>
            </DefinitionList>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Billing tiers and device limits will be enforced in a future
                release. For now, you can register unlimited devices.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <TeamManagementSection
          organizationId={currentOrganization.id}
          canManage={canManageMembers}
        />

        {canManageMembers && <TerminalConfigSection />}

        <Card>
          <CardHeader>
            <CardTitle icon>
              <Users className="h-5 w-5 text-muted-foreground" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent gap="lg">
            <ResponsiveRow gap="sm">
              <SearchInput
                value={search}
                onSearch={handleSearch}
                placeholder="Search by name or email..."
                ariaLabel="Search members by name or email"
              />
              <SelectFilter
                value={role}
                onChange={handleRoleChange}
                options={ROLE_OPTIONS}
                allLabel="All roles"
                placeholder="Filter by role"
                ariaLabel="Filter members by role"
              />
            </ResponsiveRow>

            {members.length === 0 ? (
              search !== undefined || role !== undefined ? (
                <SecondaryParagraph
                  centered
                  innerSpaceY="lg"
                >
                  No members match your filters
                </SecondaryParagraph>
              ) : (
                <SecondaryParagraph
                  centered
                  innerSpaceY="lg"
                >
                  No members found
                </SecondaryParagraph>
              )
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      {canManageMembers && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow
                        key={member.id}
                        height="tall"
                      >
                        <TableCell weight="medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === 'owner' ? 'default' : 'secondary'
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        {canManageMembers && (
                          <TableCell gap="xs">
                            {currentOrganization.role === 'owner' &&
                              member.role !== 'owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Transfer ownership"
                                  onClick={() => setConfirmTransfer(member)}
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </Button>
                              )}
                            {member.role !== 'owner' &&
                              member.userId !== profile.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmRemove(member)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <PaginatedFooter
                  totalResults={totalResults}
                  singularLabel="result"
                  pluralLabel="results"
                  page={page}
                  totalPages={totalPages}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  size={size}
                  onPageChange={handlePageChange}
                  onSizeChange={handleSizeChange}
                />
              </>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Member invitations will be available in a future release.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card variant="destructive">
          <CardHeader>
            <CardTitle
              icon
              color="destructive"
            >
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent gap="xl">
            <Stack gap="lg">
              <SectionTitle size="sm">Leave Organization</SectionTitle>
              {currentOrganization.role === 'owner' ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You must transfer ownership before you can leave this
                    organization.
                  </AlertDescription>
                </Alert>
              ) : currentOrganization.role === 'admin' ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Admins cannot leave an organization. Ask the owner to remove
                    you.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <SecondaryParagraph>
                    You will lose access to all devices, commands, and data in
                    this organization.
                  </SecondaryParagraph>
                  <Button
                    variant="destructive"
                    disabled={leaveOrganizationMutation.isPending}
                    onClick={() => setConfirmLeave(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {leaveOrganizationMutation.isPending
                      ? 'Leaving...'
                      : 'Leave Organization'}
                  </Button>
                </>
              )}
              {leaveOrganizationMutation.isError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to leave organization. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </Stack>

            <Stack gap="lg">
              <SectionTitle size="sm">Delete Organization</SectionTitle>
              {currentOrganization.role === 'owner' ? (
                <>
                  <SecondaryParagraph>
                    Deleting this organization will permanently remove all
                    devices, commands, and associated data. This action cannot
                    be undone.
                  </SecondaryParagraph>
                  <Button
                    variant="destructive"
                    disabled={deleteOrganizationMutation.isPending}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteOrganizationMutation.isPending
                      ? 'Deleting...'
                      : 'Delete Organization'}
                  </Button>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Only the organization owner can delete this organization.
                  </AlertDescription>
                </Alert>
              )}
              {deleteOrganizationMutation.isError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to delete organization. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
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
