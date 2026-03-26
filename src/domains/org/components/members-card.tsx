import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import type { ListMembersMember } from '@domains/org/services/organizations/list-members.http-service';
import type { MemberRole } from '@domains/org/services/organizations/list-members.http-service.constants';
import { SearchInput } from '@domains/shared/filters/search-input';
import { SelectFilter } from '@domains/shared/filters/select-filter';
import { ArrowRightLeft, Info, Trash2, Users } from 'lucide-react';

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

interface MembersCardProps {
  members: ListMembersMember[];
  totalResults: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  size: number;
  search: string | undefined;
  role: string | undefined;
  canManageMembers: boolean;
  currentUserRole: string;
  currentUserId: string;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSearch: (value: string | undefined) => void;
  onRoleChange: (value: string | undefined) => void;
  onRemoveMember: (member: ListMembersMember) => void;
  onTransferOwnership: (member: ListMembersMember) => void;
}

export function MembersCard({
  members,
  totalResults,
  totalPages,
  hasNext,
  hasPrevious,
  page,
  size,
  search,
  role,
  canManageMembers,
  currentUserRole,
  currentUserId,
  onPageChange,
  onSizeChange,
  onSearch,
  onRoleChange,
  onRemoveMember,
  onTransferOwnership,
}: MembersCardProps) {
  return (
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
            onSearch={onSearch}
            placeholder="Search by name or email..."
            ariaLabel="Search members by name or email"
          />
          <SelectFilter
            value={role}
            onChange={onRoleChange}
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
                        {currentUserRole === 'owner' &&
                          member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Transfer ownership"
                              onClick={() => onTransferOwnership(member)}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          )}
                        {member.role !== 'owner' &&
                          member.userId !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveMember(member)}
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
              onPageChange={onPageChange}
              onSizeChange={onSizeChange}
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
  );
}
