import { ConfirmDialog } from '@components/confirm-dialog';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { CreateTeamDialog } from '@components/org/create-team-dialog';
import { EditTeamDialog } from '@components/org/edit-team-dialog';
import { TeamMembersPanel } from '@components/org/team-members-panel';
import { useDefaultTeamQuery } from '@services/teams/get-default-team.http-service';
import type { TeamItem } from '@services/teams/list-teams.http-service';
import {
  getAllTeamsFromCache,
  getTeamsForOrg,
} from '@services/teams/list-teams.http-service';
import { useRemoveTeamMutation } from '@services/teams/remove-team.http-service';
import { useSetDefaultTeamMutation } from '@services/teams/set-default-team.http-service';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Star,
  Trash2,
  Users2,
} from 'lucide-react';
import { Suspense, useState } from 'react';

interface TeamManagementSectionProps {
  organizationId: string;
  canManage: boolean;
}

export function TeamManagementSection({
  organizationId,
  canManage,
}: TeamManagementSectionProps) {
  const teams = getTeamsForOrg(getAllTeamsFromCache(), organizationId);
  const removeTeamMutation = useRemoveTeamMutation(organizationId);
  const setDefaultTeamMutation = useSetDefaultTeamMutation();
  const { data: defaultTeamData } = useDefaultTeamQuery(organizationId);
  const defaultTeamId = defaultTeamData?.responseData?.results ?? null;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TeamItem | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const handleDeleteTeam = () => {
    if (!confirmDelete) {
      return;
    }
    removeTeamMutation.mutate(
      { teamId: confirmDelete.id },
      {
        onSuccess: () => {
          setConfirmDelete(null);
          if (expandedTeamId === confirmDelete.id) {
            setExpandedTeamId(null);
          }
        },
      },
    );
  };

  const handleSetDefault = (teamId: string) => {
    setDefaultTeamMutation.mutate({
      body: { organizationId, teamId },
    });
  };

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-muted-foreground" />
            Teams
          </CardTitle>
          {canManage && (
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Team
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {teams.length === 0 ? (
          <SecondaryParagraph className="py-6 text-center">
            No teams yet. Create a team to organize device access.
          </SecondaryParagraph>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <>
                  <TableRow key={team.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Toggle members"
                        onClick={() => toggleExpand(team.id)}
                      >
                        {expandedTeamId === team.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={
                          defaultTeamId === team.id
                            ? 'Default team'
                            : 'Set as default team'
                        }
                        disabled={
                          setDefaultTeamMutation.isPending ||
                          defaultTeamId === team.id
                        }
                        onClick={() => handleSetDefault(team.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${defaultTeamId === team.id ? 'fill-current text-yellow-500' : ''}`}
                        />
                      </Button>
                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit team name"
                            onClick={() => setEditTeam(team)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete team"
                            onClick={() => setConfirmDelete(team)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedTeamId === team.id && (
                    <TableRow key={`${team.id}-members`}>
                      <TableCell
                        colSpan={4}
                        className="bg-muted/30 px-6"
                      >
                        <Suspense
                          fallback={
                            <SecondaryParagraph className="py-4 text-center">
                              Loading members...
                            </SecondaryParagraph>
                          }
                        >
                          <TeamMembersPanel
                            teamId={team.id}
                            organizationId={organizationId}
                            canManage={canManage}
                          />
                        </Suspense>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}

        <CreateTeamDialog
          organizationId={organizationId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {editTeam && (
          <EditTeamDialog
            team={editTeam}
            onClose={() => setEditTeam(null)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            open={!!confirmDelete}
            onOpenChange={(open) => !open && setConfirmDelete(null)}
            title="Delete Team"
            desc={`Are you sure you want to delete "${confirmDelete.name}"? Members will be unassigned and devices in this team will become org-wide.`}
            handleConfirm={handleDeleteTeam}
            confirmText="Delete"
            destructive
          />
        )}
      </CardContent>
    </Card>
  );
}
