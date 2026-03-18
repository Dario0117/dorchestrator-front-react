import { useSessionFilesQueryOptions } from '@services/terminal/list-session-files.http-service';
import { terminalWsClient } from '@services/terminal/terminal-ws.client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '@/http-service-setup';

interface UploadSessionFileParams {
  organizationId: string;
  sessionId: number;
  file: File;
}

export function useUploadSessionFileMutation(
  organizationId: string,
  sessionId: number,
) {
  const queryClient = useQueryClient();
  const queryKey = useSessionFilesQueryOptions(
    organizationId,
    sessionId,
  ).queryKey;

  return useMutation({
    mutationFn: async ({
      organizationId,
      sessionId,
      file,
    }: UploadSessionFileParams) => {
      // Step 1: Get presigned upload URL from backend
      const { data, error } = await fetchClient.POST(
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/upload-url',
        {
          params: { path: { organizationId, sessionId } },
          body: {
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
          },
        },
      );

      if (error) {
        throw error;
      }

      const { uploadUrl, file: fileRecord } = data.responseData.results;

      // Step 2: Upload file directly to S3 via presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      // Step 3: Notify agent to download the file via its own HTTP client
      terminalWsClient.send({
        type: 'file:transfer',
        sessionId: String(sessionId),
        payload: {
          fileId: fileRecord.id,
          filename: fileRecord.filename,
          mimeType: fileRecord.mimeType,
          sizeBytes: fileRecord.sizeBytes,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
