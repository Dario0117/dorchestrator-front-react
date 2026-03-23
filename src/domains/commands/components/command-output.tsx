import { Badge } from '@components/ds/atoms/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { HStack } from '@components/ds/atoms/hstack';
import { OutputSection } from '@domains/commands/components/output-section';
import type { GetCommandDetail } from '@domains/commands/services/get-command.http-service';

interface CommandOutputProps {
  results: GetCommandDetail['results'];
  commandId: number;
}

export function CommandOutput({ results, commandId }: CommandOutputProps) {
  const result = results?.[0];
  if (!result) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="between">
          <CardTitle>Execution Results</CardTitle>
          {result.exitCode !== null && (
            <Badge colorScheme={result.exitCode === 0 ? 'success' : 'error'}>
              Exit code: {result.exitCode}
            </Badge>
          )}
        </HStack>
      </CardHeader>
      <CardContent gap="sm">
        <OutputSection
          title="Standard Output (stdout)"
          content={result.stdout}
          commandId={commandId}
          outputType="stdout"
        />
        <OutputSection
          title="Standard Error (stderr)"
          content={result.stderr}
          commandId={commandId}
          outputType="stderr"
          defaultOpen={false}
        />
      </CardContent>
    </Card>
  );
}
