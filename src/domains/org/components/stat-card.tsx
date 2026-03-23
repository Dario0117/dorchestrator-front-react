import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { SectionTitle } from '@components/ds/atoms/section-title';

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
      <CardHeader
        direction="row"
        align="center"
        paddingBottom="sm"
      >
        <CardTitle size="sm">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </CardHeader>
      <CardContent>
        <SectionTitle size="2xl">{value}</SectionTitle>
      </CardContent>
    </Card>
  );
}
