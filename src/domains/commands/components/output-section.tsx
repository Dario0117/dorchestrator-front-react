import { Button } from '@components/ds/atoms/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ds/atoms/collapsible';
import { TerminalHeader } from '@domains/commands/components/terminal-header';
import { useCopyToClipboard } from '@domains/shared/hooks/use-copy-to-clipboard';
import { Check, ChevronDown, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface OutputSectionProps {
  title: string;
  content: string | null;
  commandId: number;
  outputType: 'stdout' | 'stderr';
  defaultOpen?: boolean;
}

export function OutputSection({
  title,
  content,
  commandId,
  outputType,
  defaultOpen = true,
}: OutputSectionProps) {
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

  const textColor = outputType === 'stderr' ? 'text-red-400' : 'text-green-400';

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
        <div className="overflow-hidden rounded-md">
          <TerminalHeader />
          <pre
            className={`max-h-[500px] overflow-auto bg-gray-950 p-4 font-mono text-sm whitespace-pre-wrap ${textColor}`}
          >
            {content}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
