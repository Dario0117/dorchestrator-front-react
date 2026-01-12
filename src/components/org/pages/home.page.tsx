import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useOrganizationStatsSuspenseQuery } from '@services/organizations/get-organization-stats.http-service';
import { useOrganizationStore } from '@stores/organization.store';
import { Building2, HardDrive, Terminal } from 'lucide-react';

type RecentCommand = {
  id: number;
  command: string;
  status: string;
  createdAt: string;
};

export function HomePage() {
  const { currentOrganization } = useOrganizationStore();

  const organizationId = currentOrganization.id;

  const { data: stats } = useOrganizationStatsSuspenseQuery(organizationId);

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {currentOrganization.name}
        </h1>
        <p className="text-muted-foreground">
          Manage your devices and execute remote commands
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Devices"
          value={stats?.responseData?.results?.deviceCount ?? 0}
          icon={HardDrive}
        />
        <StatCard
          title="Commands (24h)"
          value={stats?.responseData?.results?.recentCommandCount ?? 0}
          icon={Terminal}
        />
        <StatCard
          title="Tier"
          value="Free Tier"
          icon={Building2}
        />
      </div>

      {/* TODO: Uncomment when /commands route is created
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          asChild
          size="lg"
        >
          <Link to="/devices">Add Device</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
        >
          <Link to="/commands">Execute Command</Link>
        </Button>
      </div>
      */}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.responseData?.results?.recentCommands &&
          stats.responseData.results.recentCommands.length > 0 ? (
            <div className="space-y-2">
              {(
                stats.responseData.results.recentCommands as RecentCommand[]
              ).map((command) => (
                <div
                  key={command.id}
                  className="flex justify-between items-center p-2 rounded-md hover:bg-muted"
                >
                  <span className="font-mono text-sm">{command.command}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(command.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {command.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent commands. Get started by executing your first command!
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
