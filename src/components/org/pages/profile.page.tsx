import { PageDescription } from '@components/layout/page-description';
import { PageSection } from '@components/layout/page-section';
import { PageTitle } from '@components/layout/page-title';
import { ChangePasswordForm } from '@components/org/forms/change-password.form';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useChangePasswordMutation } from '@services/users/change-password.http-service';
import { useProfileSuspendedQuery } from '@services/users/get-profile.http-service';
import { CheckCircle2, User } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const { data: profile } = useProfileSuspendedQuery();
  const changePasswordMutation = useChangePasswordMutation();
  const [passwordChanged, setPasswordChanged] = useState(false);

  return (
    <PageSection>
      <div>
        <PageTitle>Profile</PageTitle>
        <PageDescription>
          Manage your account and security settings
        </PageDescription>
      </div>

      <div className="grid gap-6 md:grid-cols-1 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Name
                </dt>
                <dd className="text-base">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="text-base">{profile.email}</dd>
              </div>
            </dl>
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
      </div>
    </PageSection>
  );
}
