import { ConfirmDialog } from '@components/confirm-dialog';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { formatExpirationDate } from '@lib/format-expiration';
import { useListMembersSuspenseQuery } from '@services/organizations/list-members.http-service';
import { useAddTeamMemberMutation } from '@services/teams/add-team-member.http-service';
import { useListTeamMembersSuspenseQuery } from '@services/teams/list-team-members.http-service';
import { useRemoveTeamMemberMutation } from '@services/teams/remove-team-member.http-service';
import { AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TeamMembersPanelProps {
  teamId: string;
  organizationId: string;
  canManage: boolean;
}

export function TeamMembersPanel({
  teamId,
  organizationId,
  canManage,
}: TeamMembersPanelProps) {
  const { data: teamMembersData } = useListTeamMembersSuspenseQuery(
    organizationId,
    teamId,
  );
  const { data: orgMembersData } = useListMembersSuspenseQuery(organizationId, {
    page: 1,
    size: 100,
  });
  const addMemberMutation = useAddTeamMemberMutation(organizationId, teamId);
  const removeMemberMutation = useRemoveTeamMemberMutation(
    organizationId,
    teamId,
  );

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [confirmRemove, setConfirmRemove] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const orgMembers = orgMembersData.responseData?.results ?? [];
  const teamMembers = teamMembersData?.responseData?.results ?? [];
  const teamMemberUserIds = new Set(teamMembers.map((tm) => tm.userId));

  const availableMembers = orgMembers.filter(
    (m) => !teamMemberUserIds.has(m.userId),
  );

  const handleAddMember = () => {
    if (!selectedUserId) {
      return;
    }
    addMemberMutation.mutate(
      {
        params: {
          path: { organizationId, teamId },
        },
        body: {
          userId: selectedUserId,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedUserId('');
          setExpiresAt('');
        },
      },
    );
  };

  const handleRemoveMember = () => {
    if (!confirmRemove) {
      return;
    }
    removeMemberMutation.mutate(
      {
        params: {
          path: {
            organizationId,
            teamId,
            memberUserId: confirmRemove.userId,
          },
        },
      },
      { onSuccess: () => setConfirmRemove(null) },
    );
  };

  return (
    <div className="space-y-3 border-t pt-3">
      {canManage && availableMembers.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={selectedUserId}
              onValueChange={(value) =>
                value !== null && setSelectedUserId(value)
              }
            >
              <SelectTrigger
                className="flex-1"
                aria-label="Select member to add"
              >
                <SelectValue placeholder="Select a member to add..." />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((m) => (
                  <SelectItem
                    key={m.userId}
                    value={m.userId}
                  >
                    {m.name} ({m.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!selectedUserId || addMemberMutation.isPending}
              onClick={handleAddMember}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="flex-1"
              aria-label="Access expiration date"
              placeholder="Optional expiration"
              min={new Date().toISOString().slice(0, 16)}
            />
            {expiresAt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpiresAt('')}
                aria-label="Clear expiration"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {teamMembers.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          No members in this team yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Access</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((tm) => (
              <TableRow key={tm.id}>
                <TableCell className="font-medium">
                  {tm.name ?? tm.userId}
                </TableCell>
                <TableCell>{tm.email ?? '-'}</TableCell>
                <TableCell>
                  {tm.expiresAt ? (
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      Expires {formatExpirationDate(tm.expiresAt)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Permanent</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Remove from team"
                      onClick={() =>
                        setConfirmRemove({
                          userId: tm.userId,
                          name: tm.name ?? tm.userId,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {(addMemberMutation.isError || removeMemberMutation.isError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to update team members. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {confirmRemove && (
        <ConfirmDialog
          open={!!confirmRemove}
          onOpenChange={(open) => !open && setConfirmRemove(null)}
          title="Remove Team Member"
          desc={`Remove ${confirmRemove.name} from this team?`}
          handleConfirm={handleRemoveMember}
          confirmText="Remove"
          destructive
        />
      )}
    </div>
  );
}
