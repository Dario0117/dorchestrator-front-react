import { useSessionImagesQueryOptions } from '@services/terminal/list-session-images.http-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '@/http-service-setup';

interface UploadSessionImageParams {
  organizationId: string;
  sessionId: number;
  file: File;
}

export function useUploadSessionImageMutation(
  organizationId: string,
  sessionId: number,
) {
  const queryClient = useQueryClient();
  const queryKey = useSessionImagesQueryOptions(
    organizationId,
    sessionId,
  ).queryKey;

  return useMutation({
    mutationFn: async ({
      organizationId,
      sessionId,
      file,
    }: UploadSessionImageParams) => {
      const { data, error } = await fetchClient.POST(
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}/images',
        {
          params: { path: { organizationId, sessionId } },
          body: { file: file as unknown as string },
          bodySerializer: (body) => {
            const formData = new FormData();
            formData.append('file', (body as unknown as { file: File }).file);
            return formData;
          },
        },
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
