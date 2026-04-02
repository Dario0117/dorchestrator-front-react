import { Badge } from '@components/ds/atoms/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { useListMySandboxApprovalsSuspenseQuery } from '@domains/sandbox/services/list-my-sandbox-approvals.http-service';

interface MyPendingApprovalsSectionProps {
  organizationId: string;
  teamId: string;
}

export function MyPendingApprovalsSection({
  organizationId,
  teamId,
}: MyPendingApprovalsSectionProps) {
  const { data } = useListMySandboxApprovalsSuspenseQuery(
    organizationId,
    teamId,
    { page: 1, size: 20 },
  );

  const approvals = data.responseData?.results ?? [];
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === 'pending',
  );

  if (pendingApprovals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Sandbox Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          {pendingApprovals.map((approval) => (
            <Stack
              key={approval.id}
              gap="sm"
              border="all"
              rounded="md"
              innerSpaceX="md"
              innerSpaceY="md"
            >
              <ResponsiveRow
                gap="sm"
                align="center"
              >
                <SmallParagraph>
                  {approval.requestType === 'terminal' ? 'Terminal' : 'Command'}{' '}
                  override request
                  {approval.requestedConfig.presetName
                    ? ` - ${approval.requestedConfig.presetName}`
                    : ''}
                </SmallParagraph>
                <Badge variant="secondary">Pending</Badge>
              </ResponsiveRow>
              <SmallParagraph>
                Expires: {new Date(approval.expiresAt).toLocaleString()}
              </SmallParagraph>
              <SmallParagraph>
                Requested: {new Date(approval.createdAt).toLocaleString()}
              </SmallParagraph>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
