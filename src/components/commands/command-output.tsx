import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CommandOutputProps {
  results: GetCommandDetail['results'];
}

function OutputSection({
  title,
  content,
  defaultOpen = true,
}: {
  title: string;
  content: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!content) {
    return null;
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 font-medium text-sm hover:underline">
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
          {content}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CommandOutput({ results }: CommandOutputProps) {
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
              className={
                result.exitCode === 0
                  ? 'bg-green-600 text-white border-transparent'
                  : 'bg-red-600 text-white border-transparent'
              }
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
        />
        <OutputSection
          title="Standard Error (stderr)"
          content={result.stderr}
          defaultOpen={false}
        />
      </CardContent>
    </Card>
  );
}
