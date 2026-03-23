import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import type { TeamItem } from '@domains/org/services/teams/list-teams.http-service';
import { useUpdateTeamMutation } from '@domains/org/services/teams/update-team.http-service';
import { useState } from 'react';

interface EditTeamDialogProps {
  team: TeamItem;
  onClose: () => void;
}

export function EditTeamDialog({ team, onClose }: EditTeamDialogProps) {
  const updateTeamMutation = useUpdateTeamMutation();
  const [editTeamName, setEditTeamName] = useState(team.name);

  const handleUpdateTeam = () => {
    if (!editTeamName.trim()) {
      return;
    }
    updateTeamMutation.mutate(
      { teamId: team.id, name: editTeamName.trim() },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Team name"
          value={editTeamName}
          onChange={(e) => setEditTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdateTeam()}
        />
        <DialogFooter>
          <Button
            onClick={handleUpdateTeam}
            disabled={!editTeamName.trim() || updateTeamMutation.isPending}
          >
            {updateTeamMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
