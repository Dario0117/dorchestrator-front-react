import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { Stack } from '@components/ds/atoms/stack';
import { IconCircle } from '@domains/shared/components/icon-circle';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function SessionNotFound({
  organizationSlug,
  teamSlug,
}: {
  organizationSlug: string;
  teamSlug: string;
}) {
  return (
    <Center
      fullHeight
      padding="md"
    >
      <Stack
        gap="lg"
        textAlign="center"
      >
        <IconCircle>
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </IconCircle>
        <SectionTitle size="xl">Session not found</SectionTitle>
        <SecondaryParagraph>
          This session does not exist or you don&apos;t have access to it.
        </SecondaryParagraph>
        <Button
          variant="outline"
          render={
            <Link
              to="/$organizationSlug/t/$teamSlug/terminal"
              params={{ organizationSlug, teamSlug }}
            />
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sessions
        </Button>
      </Stack>
    </Center>
  );
}
