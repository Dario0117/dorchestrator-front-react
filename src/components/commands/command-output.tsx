import { OutputSection } from '@components/commands/output-section';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';

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
        <div className="flex items-center justify-between">
          <CardTitle>Execution Results</CardTitle>
          {result.exitCode !== null && (
            <Badge
              className={`text-sm px-3 py-1 ${
                result.exitCode === 0
                  ? 'bg-green-600 text-white border-transparent'
                  : 'bg-red-600 text-white border-transparent'
              }`}
            >
              Exit code: {result.exitCode}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
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
