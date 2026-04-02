import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { SandboxPresetFormDialog } from '@domains/sandbox/components/sandbox-preset-form-dialog';
import { useDeleteSandboxPresetMutation } from '@domains/sandbox/services/delete-sandbox-preset.http-service';
import {
  type SandboxPresetItem,
  useListSandboxPresetsSuspenseQuery,
} from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { useSandboxTypesSuspenseQuery } from '@domains/sandbox/services/list-sandbox-types.http-service';
import { useSetOrgDefaultPresetMutation } from '@domains/sandbox/services/set-org-default-preset.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function SandboxPresetsSection() {
  const currentOrganization = useCurrentOrganization();
  const { data: presetsData } = useListSandboxPresetsSuspenseQuery(
    currentOrganization.id,
  );
  const { data: sandboxTypesData } = useSandboxTypesSuspenseQuery(
    currentOrganization.id,
  );
  const deleteMutation = useDeleteSandboxPresetMutation(currentOrganization.id);
  const setDefaultMutation = useSetOrgDefaultPresetMutation(
    currentOrganization.id,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<SandboxPresetItem | null>(
    null,
  );
  const [confirmDeletePreset, setConfirmDeletePreset] =
    useState<SandboxPresetItem | null>(null);

  const presets = presetsData?.responseData?.results ?? [];
  const sandboxTypes = sandboxTypesData?.responseData?.results ?? [];

  const getSandboxTypeLabel = (sandboxTypeId: number) =>
    sandboxTypes.find((t) => t.id === sandboxTypeId)?.name ?? 'Unknown';

  const handleCreate = () => {
    setEditingPreset(null);
    setDialogOpen(true);
  };

  const handleEdit = (preset: SandboxPresetItem) => {
    setEditingPreset(preset);
    setDialogOpen(true);
  };

  const handleSetDefault = (presetId: number) => {
    setDefaultMutation.mutate({
      params: {
        path: {
          organizationId: currentOrganization.id,
          presetId: String(presetId),
        },
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate({
      params: {
        path: {
          organizationId: currentOrganization.id,
          presetId: String(confirmDeletePreset?.id),
        },
      },
    });
    setConfirmDeletePreset(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <ResponsiveRow
            gap="sm"
            align="center"
            justify="between"
          >
            <CardTitle>Sandbox Presets</CardTitle>
            <Button
              size="sm"
              onClick={handleCreate}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Preset
            </Button>
          </ResponsiveRow>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <SmallParagraph>
              No sandbox presets configured. Create one to get started.
            </SmallParagraph>
          ) : (
            <Stack gap="md">
              {presets.map((preset) => (
                <Stack
                  key={preset.id}
                  gap="sm"
                  border="all"
                  rounded="md"
                  innerSpaceX="md"
                  innerSpaceY="md"
                >
                  <ResponsiveRow
                    gap="sm"
                    align="center"
                  >
                    <SmallParagraph weight="medium">
                      {preset.name}
                    </SmallParagraph>
                    <SmallParagraph>
                      {getSandboxTypeLabel(preset.sandboxTypeId)}
                    </SmallParagraph>
                    {preset.isOrgDefault && <Badge>Default</Badge>}
                    {preset.requiresApproval && (
                      <Badge variant="secondary">Requires Approval</Badge>
                    )}
                  </ResponsiveRow>
                  {preset.description && (
                    <SmallParagraph>{preset.description}</SmallParagraph>
                  )}
                  <ResponsiveRow gap="sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(preset)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    {!preset.isOrgDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(preset.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmDeletePreset(preset)}
                      disabled={preset.isOrgDefault}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </ResponsiveRow>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <SandboxPresetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organizationId={currentOrganization.id}
        preset={editingPreset}
        sandboxTypes={sandboxTypes}
      />

      {confirmDeletePreset && (
        <ConfirmDialog
          open={!!confirmDeletePreset}
          onOpenChange={(open) => !open && setConfirmDeletePreset(null)}
          title="Delete Preset"
          desc={`Are you sure you want to delete the preset "${confirmDeletePreset.name}"? This action cannot be undone.`}
          handleConfirm={handleDeleteConfirm}
          confirmText="Delete"
          destructive
        />
      )}
    </>
  );
}
