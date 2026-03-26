import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { Stack } from '@components/ds/atoms/stack';
import { AlertTriangle, Info, LogOut, Trash2 } from 'lucide-react';

interface DangerZoneCardProps {
  currentUserRole: string;
  leaveIsPending: boolean;
  leaveIsError: boolean;
  deleteIsPending: boolean;
  deleteIsError: boolean;
  onLeave: () => void;
  onDelete: () => void;
}

export function DangerZoneCard({
  currentUserRole,
  leaveIsPending,
  leaveIsError,
  deleteIsPending,
  deleteIsError,
  onLeave,
  onDelete,
}: DangerZoneCardProps) {
  return (
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
          {currentUserRole === 'owner' ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You must transfer ownership before you can leave this
                organization.
              </AlertDescription>
            </Alert>
          ) : currentUserRole === 'admin' ? (
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
                You will lose access to all devices, commands, and data in this
                organization.
              </SecondaryParagraph>
              <Button
                variant="destructive"
                disabled={leaveIsPending}
                onClick={onLeave}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {leaveIsPending ? 'Leaving...' : 'Leave Organization'}
              </Button>
            </>
          )}
          {leaveIsError && (
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
          {currentUserRole === 'owner' ? (
            <>
              <SecondaryParagraph>
                Deleting this organization will permanently remove all devices,
                commands, and associated data. This action cannot be undone.
              </SecondaryParagraph>
              <Button
                variant="destructive"
                disabled={deleteIsPending}
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteIsPending ? 'Deleting...' : 'Delete Organization'}
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
          {deleteIsError && (
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
  );
}
