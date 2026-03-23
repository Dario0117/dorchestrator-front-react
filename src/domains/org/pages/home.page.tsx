import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { CodeText } from '@components/ds/atoms/code-text';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageDescription } from '@components/ds/atoms/page-description';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { SmallText } from '@components/ds/atoms/small-text';
import { CommandStatusBadge } from '@domains/commands/components/command-status-badge';
import { StatCard } from '@domains/org/components/stat-card';
import { useOrganizationDetailsSuspenseQuery } from '@domains/org/services/organizations/get-organization-details.http-service';
import { useOrganizationStatsSuspenseQuery } from '@domains/org/services/organizations/get-organization-stats.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { Link, useParams } from '@tanstack/react-router';
import { Building2, HardDrive, Terminal } from 'lucide-react';

export function HomePage() {
  const currentOrganization = useCurrentOrganization();
  const params = useParams({ strict: false });
  const teamSlug = 'teamSlug' in params ? (params.teamSlug as string) : '';
  const organizationId = currentOrganization.id;

  const { data: orgDetails } =
    useOrganizationDetailsSuspenseQuery(organizationId);
  const { data: stats } = useOrganizationStatsSuspenseQuery(organizationId);

  return (
    <PageSection>
      <div>
        <PageTitle>Welcome to {currentOrganization.name}</PageTitle>
        <PageDescription>
          Manage your devices and execute remote commands
        </PageDescription>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Devices"
          value={stats.responseData?.results?.deviceCount ?? 0}
          icon={HardDrive}
          iconClassName="text-teal-600 dark:text-teal-400"
        />
        <StatCard
          title="Commands (24h)"
          value={stats.responseData?.results?.recentCommandCount ?? 0}
          icon={Terminal}
          iconClassName="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Tier"
          value={orgDetails.responseData?.results?.tier ?? 'free'}
          icon={Building2}
          iconClassName="text-purple-600 dark:text-purple-400"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Button
          size="lg"
          render={
            <Link
              to="/$organizationSlug/t/$teamSlug/devices"
              params={{ organizationSlug: currentOrganization.slug, teamSlug }}
            />
          }
        >
          Add Device
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={
            <Link
              to="/$organizationSlug/t/$teamSlug/commands"
              params={{ organizationSlug: currentOrganization.slug, teamSlug }}
              search={{ executeModal: 'open' }}
            />
          }
        >
          Execute Command
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.responseData?.results?.recentCommands &&
          stats.responseData.results.recentCommands.length > 0 ? (
            <div className="space-y-2">
              {stats.responseData.results.recentCommands.map((command) => (
                <Link
                  key={command.id}
                  to="/$organizationSlug/t/$teamSlug/commands/$commandId"
                  params={{
                    organizationSlug: currentOrganization.slug,
                    teamSlug,
                    commandId: String(command.id),
                  }}
                  className="flex justify-between items-center p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SmallText mono>#{command.id}</SmallText>
                    <CodeText truncate>{command.command}</CodeText>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <SmallText>{command.deviceName}</SmallText>
                    <SmallText>
                      {new Date(command.createdAt).toLocaleTimeString()}
                    </SmallText>
                    <CommandStatusBadge status={command.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Terminal}
              title="No recent commands"
              description="Execute your first command to see activity here."
              action={
                <Button
                  variant="outline"
                  render={
                    <Link
                      to="/$organizationSlug/t/$teamSlug/commands"
                      params={{
                        organizationSlug: currentOrganization.slug,
                        teamSlug,
                      }}
                      search={{ executeModal: 'open' }}
                    />
                  }
                >
                  Execute your first command
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </PageSection>
  );
}
