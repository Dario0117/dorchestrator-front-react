import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGenerateTokenMutation } from '@/services/devices/generate-device-token.http-service';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function AddDeviceModal({
  open,
  onOpenChange,
  organizationId,
}: AddDeviceModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTokenMutation = useGenerateTokenMutation();

  const handleGenerateToken = async () => {
    try {
      setError(null);
      const result = await generateTokenMutation.mutateAsync({
        params: {
          path: {
            organizationId: organizationId,
          },
        },
      });

      if (result?.responseData?.results) {
        setToken(result.responseData.results.token);
        setExpiresAt(result.responseData.results.expiresAt);
      }
    } catch (_err) {
      setError('Failed to generate token. Please try again.');
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiration = () => {
    if (!expiresAt) {
      return '';
    }
    const date = new Date(expiresAt);
    const hours = Math.floor((date.getTime() - Date.now()) / 3600000);
    return `Token expires in ${hours} hours`;
  };

  const cliCommand = `dorchestrator register --org-id "${organizationId}" --name "random name" --token "${token}"`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a registration token and run the command below on your
            device:
          </p>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!token && (
            <Button
              onClick={handleGenerateToken}
              disabled={generateTokenMutation.isPending}
            >
              {generateTokenMutation.isPending
                ? 'Generating...'
                : 'Generate Token'}
            </Button>
          )}

          {token && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="registration-token"
                  className="text-sm font-medium"
                >
                  Registration Token
                </label>
                <div className="flex gap-2">
                  <Input
                    id="registration-token"
                    value={token}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(token)}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatExpiration()}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cli-command"
                  className="text-sm font-medium"
                >
                  CLI Command
                </label>
                <div className="flex gap-2">
                  <Input
                    id="cli-command"
                    value={cliCommand}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(cliCommand)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <a
                  href="https://github.com/dorchestrator/dorchestrator-agent/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Download agent →
                </a>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
