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
import { MetadataLabel } from '@components/ds/atoms/metadata-label';
import { CreditCard, Info } from 'lucide-react';

interface SubscriptionCardProps {
  tier?: string | null;
  deviceLimit?: number | null;
}

export function SubscriptionCard({ tier, deviceLimit }: SubscriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          Subscription & Billing
        </CardTitle>
      </CardHeader>
      <CardContent gap="lg">
        <DefinitionList>
          <Box>
            <MetadataLabel>Current Tier</MetadataLabel>
            <DefinitionValue>{tier ?? 'Free Tier'}</DefinitionValue>
          </Box>

          <Box>
            <MetadataLabel>Device Limit</MetadataLabel>
            <DefinitionValue>{deviceLimit ?? 'Unlimited'}</DefinitionValue>
          </Box>
        </DefinitionList>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Billing tiers and device limits will be enforced in a future
            release. For now, you can register unlimited devices.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
