import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useOrganizationDetailsSuspenseQuery } from '@services/organizations/get-organization-details.http-service';
import { useUserOrganizationsSuspendedQuery } from '@services/organizations/list-user-organizations.http-service';
import { useSetDefaultOrganizationMutation } from '@services/organizations/set-default-organization.http-service';
import { useProfileSuspendedQuery } from '@services/users/get-profile.http-service';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  Info,
  Star,
  Users,
} from 'lucide-react';

export function OrganizationSettingsPage() {
  const { data: profile } = useProfileSuspendedQuery();
  const currentOrganization = useCurrentOrganization();
  const setDefaultMutation = useSetDefaultOrganizationMutation();

  const { data: orgListData } = useUserOrganizationsSuspendedQuery();
  const reactiveOrg = orgListData.responseData?.results?.find(
    (org) => org.id === currentOrganization.id,
  );
  const isDefault = reactiveOrg?.isDefault ?? false;

  const { data: orgDetails } = useOrganizationDetailsSuspenseQuery(
    currentOrganization.id,
  );

  const details = orgDetails.responseData?.results;

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif">
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          View your organization configuration and billing settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Organization Name
                </dt>
                <dd className="text-base">{currentOrganization.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Organization ID
                </dt>
                <dd className="text-base font-mono">
                  {currentOrganization.id}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="text-base">
                  {details?.createdAt
                    ? new Date(details.createdAt).toLocaleDateString()
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              Default Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <p className="text-sm text-muted-foreground">
                  Set this organization as your default to be redirected here
                  after logging in.
                </p>
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
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Current Tier
                </dt>
                <dd className="text-base">{details?.tier ?? 'Free Tier'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Device Limit
                </dt>
                <dd className="text-base">
                  {details?.deviceLimit ?? 'Unlimited'}
                </dd>
              </div>
            </dl>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Billing tiers and device limits will be enforced in a future
                release. For now, you can register unlimited devices.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Member Count
                </dt>
                <dd className="text-base tabular-nums">
                  {details?.memberCount ?? 1}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Current User
                </dt>
                <dd className="text-base">{profile.email ?? 'Unknown'}</dd>
              </div>
            </dl>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Member invitations will be available in a future release.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deleting this organization will permanently remove all devices,
              commands, and associated data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              disabled
            >
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
