import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { useSandboxApprovalsSuspenseQuery } from '@domains/sandbox/services/list-sandbox-approvals.http-service';
import { useReviewSandboxApprovalMutation } from '@domains/sandbox/services/review-sandbox-approval.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';

export function SandboxApprovalsSection() {
  const currentOrganization = useCurrentOrganization();
  const { data } = useSandboxApprovalsSuspenseQuery(currentOrganization.id, {
    page: 1,
    size: 20,
    status: 'pending',
  });
  const reviewMutation = useReviewSandboxApprovalMutation();

  const approvals = data.responseData.results;

  if (approvals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Sandbox Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          {approvals.map((approval) => (
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
                  Override request for device {approval.deviceId} (
                  {approval.requestType})
                </SmallParagraph>
                {approval.requestedConfig.category === 'none' &&
                  approval.effectiveConfigAtRequest.category !== 'none' && (
                    <Badge variant="destructive">Security Downgrade</Badge>
                  )}
              </ResponsiveRow>
              <SmallParagraph>
                Current:{' '}
                {approval.effectiveConfigAtRequest.presetName ??
                  approval.effectiveConfigAtRequest.category ??
                  'none'}
                {approval.effectivePresetId != null &&
                  ` (preset #${approval.effectivePresetId})`}
                {' → '}
                Requested:{' '}
                {approval.requestedConfig.presetName ??
                  approval.requestedConfig.category ??
                  'none'}
                {approval.requestedPresetId != null &&
                  ` (preset #${approval.requestedPresetId})`}
              </SmallParagraph>
              <ResponsiveRow gap="sm">
                <Button
                  size="sm"
                  onClick={() =>
                    reviewMutation.mutate({
                      body: { decision: 'approved' },
                      params: {
                        path: {
                          organizationId: currentOrganization.id,
                          approvalId: String(approval.id),
                        },
                      },
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    reviewMutation.mutate({
                      body: { decision: 'rejected' },
                      params: {
                        path: {
                          organizationId: currentOrganization.id,
                          approvalId: String(approval.id),
                        },
                      },
                    })
                  }
                >
                  Reject
                </Button>
              </ResponsiveRow>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
