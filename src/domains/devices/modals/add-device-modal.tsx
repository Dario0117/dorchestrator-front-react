import { AlertBanner } from '@components/ds/atoms/alert-banner';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Input } from '@components/ds/atoms/input';
import { Label } from '@components/ds/atoms/label';
import { List, ListItem } from '@components/ds/atoms/list';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { TextLink } from '@components/ds/atoms/text-link';
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Generate a registration token and run the command below on your
            device.
          </DialogDescription>
        </DialogHeader>

        <Stack gap="lg">
          {errors && (
            <AlertBanner variant="destructive">
              <List>
                {errors.map((error) => (
                  <ListItem key={error}>{error}</ListItem>
                ))}
              </List>
            </AlertBanner>
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
              <Stack gap="sm">
                <Label htmlFor="registration-token">Registration Token</Label>
                <HStack
                  gap="sm"
                  align="stretch"
                >
                  <Input
                    id="registration-token"
                    value={token}
                    readOnly
                    font="mono"
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
                </HStack>
                <SmallParagraph>{formatExpiration()}</SmallParagraph>
              </Stack>

              <Stack gap="sm">
                <Label htmlFor="cli-command">CLI Command</Label>
                <HStack
                  gap="sm"
                  align="stretch"
                >
                  <Input
                    id="cli-command"
                    value={cliCommand}
                    readOnly
                    font="mono"
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
                </HStack>
              </Stack>

              <Box>
                <TextLink
                  href="https://github.com/dorchestrator/dorchestrator-agent/releases"
                  external
                >
                  Download agent →
                </TextLink>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
