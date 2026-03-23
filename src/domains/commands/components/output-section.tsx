import { Button } from '@components/ds/atoms/button';
import { CodeBlock } from '@components/ds/atoms/code-block';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ds/atoms/collapsible';
import { HStack } from '@components/ds/atoms/hstack';
import { Surface } from '@components/ds/atoms/surface';
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

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
    >
      <HStack justify="between">
        <CollapsibleTrigger layout="inline">
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          {title}
        </CollapsibleTrigger>
        <HStack
          gap="xs"
          align="stretch"
        >
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
        </HStack>
      </HStack>
      <CollapsibleContent>
        <Surface rounded="md">
          <TerminalHeader />
          <CodeBlock
            variant="terminal"
            color={outputType === 'stderr' ? 'danger' : 'success'}
            maxH="md"
          >
            {content}
          </CodeBlock>
        </Surface>
      </CollapsibleContent>
    </Collapsible>
  );
}
