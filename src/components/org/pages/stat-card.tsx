import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
