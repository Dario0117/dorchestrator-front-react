import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Box } from '@components/ds/atoms/box';
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
import { ChangePasswordForm } from '@domains/org/forms/change-password.form';
import { useChangePasswordMutation } from '@domains/org/services/users/change-password.http-service';
import { useProfileSuspendedQuery } from '@domains/org/services/users/get-profile.http-service';
import { CheckCircle2, User } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const { data: profile } = useProfileSuspendedQuery();
  const changePasswordMutation = useChangePasswordMutation();
  const [passwordChanged, setPasswordChanged] = useState(false);

  return (
    <PageSection>
      <Box>
        <PageTitle>Profile</PageTitle>
        <PageDescription>
          Manage your account and security settings
        </PageDescription>
      </Box>

      <Grid
        gap="xl"
        maxWidth="2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle icon>
              <User className="h-5 w-5 text-muted-foreground" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList>
              <Box>
                <MetadataLabel>Name</MetadataLabel>
                <DefinitionValue>{profile.name}</DefinitionValue>
              </Box>
              <Box>
                <MetadataLabel>Email</MetadataLabel>
                <DefinitionValue>{profile.email}</DefinitionValue>
              </Box>
            </DefinitionList>
          </CardContent>
        </Card>

        {passwordChanged && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your password has been changed successfully.
            </AlertDescription>
          </Alert>
        )}

        <ChangePasswordForm
          changePasswordMutation={changePasswordMutation}
          handleSuccess={() => {
            setPasswordChanged(true);
          }}
        />
      </Grid>
    </PageSection>
  );
}
