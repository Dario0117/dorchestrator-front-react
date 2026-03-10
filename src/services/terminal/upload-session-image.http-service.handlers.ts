import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

type UploadSessionImageMswPathParams = {
  organizationId: string;
  sessionId: string;
};

let imageIdCounter = 100;

export const uploadSessionImageHandler =
  http.post<UploadSessionImageMswPathParams>(
    buildBackendUrl(
      '/api/v1/{organizationId}/terminal/sessions/{sessionId}/images',
    ),
    () => {
      imageIdCounter++;
      return HttpResponse.json(
        {
          responseData: {
            results: {
              id: imageIdCounter,
              sessionId: 1,
              filename: 'uploaded.png',
              mimeType: 'image/png',
              sizeBytes: 102400,
              createdAt: new Date().toISOString(),
            },
          },
          responseErrors: null,
        },
        { status: 201 },
      );
    },
  );
