import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Grid } from '@components/ds/atoms/grid';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { StatCardSkeleton } from '@domains/shared/components/stat-cards.skeleton';
import { HardDrive, Monitor, Terminal } from 'lucide-react';

interface StatCardsProps {
  devicesOnline: number;
  devicesTotal: number;
  commandsIn24h: number;
  activeSessions: number;
  isLoading?: boolean;
}

export function StatCards({
  devicesOnline,
  devicesTotal,
  commandsIn24h,
  activeSessions,
  isLoading,
}: StatCardsProps) {
  if (isLoading) {
    return (
      <Grid
        fixedCols={3}
        gap="lg"
      >
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </Grid>
    );
  }

  return (
    <Grid
      fixedCols={3}
      gap="lg"
    >
      <Card>
        <CardHeader
          direction="row"
          align="center"
          paddingBottom="sm"
        >
          <CardTitle size="sm">Devices Online</CardTitle>
          <HardDrive className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </CardHeader>
        <CardContent>
          <SectionTitle size="2xl">
            {devicesOnline}/{devicesTotal}
          </SectionTitle>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          direction="row"
          align="center"
          paddingBottom="sm"
        >
          <CardTitle size="sm">Commands (24h)</CardTitle>
          <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <SectionTitle size="2xl">{commandsIn24h}</SectionTitle>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          direction="row"
          align="center"
          paddingBottom="sm"
        >
          <CardTitle size="sm">Active Sessions</CardTitle>
          <Terminal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <SectionTitle size="2xl">{activeSessions}</SectionTitle>
        </CardContent>
      </Card>
    </Grid>
  );
}
