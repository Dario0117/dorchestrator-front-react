import { Alert, AlertDescription } from '@components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useOrganizationDetailsSuspenseQuery } from '@services/organizations/get-organization-details.http-service';
import { useProfileSuspendedQuery } from '@services/users/get-profile.http-service';
import { Info } from 'lucide-react';

export function OrganizationSettingsPage() {
  const { data: profile } = useProfileSuspendedQuery();
  const currentOrganization = useCurrentOrganization();

  const { data: orgDetails } = useOrganizationDetailsSuspenseQuery(
    currentOrganization.id,
  );

  const details = orgDetails.responseData?.results;

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          View your organization configuration and billing settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
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

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
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

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Devices Registered
                </dt>
                <dd className="text-base">{details?.deviceCount ?? 0}</dd>
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

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Member Count
                </dt>
                <dd className="text-base">{details?.memberCount ?? 1}</dd>
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
      </div>
    </section>
  );
}
