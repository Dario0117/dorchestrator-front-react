import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { useGenerateTokenMutation } from '@domains/devices/services/generate-device-token.http-service';
import { useCopyToClipboard } from '@domains/shared/hooks/use-copy-to-clipboard';
import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  teamId: string;
}

export function AddDeviceModal({
  open,
  onOpenChange,
  organizationId,
  teamId,
}: AddDeviceModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const { copiedKey, copy: copyToClipboard } = useCopyToClipboard();
  const [errors, setError] = useState<string[] | null>(null);

  const generateTokenMutation = useGenerateTokenMutation();

  const handleGenerateToken = () => {
    setError(null);
    generateTokenMutation.mutate(
      {
        params: {
          path: {
            organizationId: organizationId,
            teamId: teamId,
          },
        },
      },
      {
        onSuccess: (result) => {
          if (result?.responseData?.results) {
            setToken(result.responseData.results.token);
            setExpiresAt(result.responseData.results.expiresAt);
          }
        },
        onError: (error) => {
          setError(
            error.responseErrors.nonFieldErrors ?? [
              'Failed to generate token. Please try again.',
            ],
          );
        },
      },
    );
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
          <DialogDescription>
            Generate a registration token and run the command below on your
            device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {errors && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
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
                    onClick={() => copyToClipboard(token, 'token')}
                    aria-label="Copy registration token"
                  >
                    {copiedKey === 'token' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <SmallParagraph>{formatExpiration()}</SmallParagraph>
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
                    onClick={() => copyToClipboard(cliCommand, 'cli')}
                    aria-label="Copy CLI command"
                  >
                    {copiedKey === 'cli' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
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
