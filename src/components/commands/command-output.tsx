import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import { useCopyToClipboard } from '@hooks/use-copy-to-clipboard';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';
import { Check, ChevronDown, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface CommandOutputProps {
  results: GetCommandDetail['results'];
  commandId: number;
}

function OutputSection({
  title,
  content,
  commandId,
  outputType,
  defaultOpen = true,
}: {
  title: string;
  content: string | null;
  commandId: number;
  outputType: 'stdout' | 'stderr';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { hasCopied: copied, copy } = useCopyToClipboard();

  if (!content) {
    return null;
  }

  const handleCopy = () => copy(content);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-${commandId}-${outputType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 py-2 font-medium text-sm hover:underline">
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          {title}
        </CollapsibleTrigger>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : `Copy ${outputType}`}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            aria-label={`Download ${outputType}`}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
          {content}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
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
