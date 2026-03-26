import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { useSetDefaultOrganizationMutation } from '@domains/org/services/organizations/set-default-organization.http-service';
import { AlertTriangle, CheckCircle2, Star } from 'lucide-react';

interface DefaultOrgCardProps {
  isDefault: boolean;
  organizationId: string;
}

export function DefaultOrgCard({
  isDefault,
  organizationId,
}: DefaultOrgCardProps) {
  const setDefaultMutation = useSetDefaultOrganizationMutation();

  return (
    <Card>
      <CardHeader>
        <CardTitle icon>
          <Star className="h-5 w-5 text-muted-foreground" />
          Default Organization
        </CardTitle>
      </CardHeader>
      <CardContent gap="lg">
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
            <SecondaryParagraph>
              Set this organization as your default to be redirected here after
              logging in.
            </SecondaryParagraph>
            <Button
              variant="outline"
              disabled={setDefaultMutation.isPending}
              onClick={() =>
                setDefaultMutation.mutate({
                  body: { organizationId },
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
  );
}
