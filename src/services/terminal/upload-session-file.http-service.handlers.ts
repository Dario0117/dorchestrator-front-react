import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

type UploadUrlMswPathParams = {
  organizationId: string;
  sessionId: string;
};

let fileIdCounter = 100;

export const uploadSessionFileHandler = http.post<UploadUrlMswPathParams>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/upload-url',
  ),
  () => {
    fileIdCounter++;
    return HttpResponse.json(
      {
        responseData: {
          results: {
            uploadUrl: 'https://s3.example.com/presigned-upload-url',
            objectKey: `org/session/${fileIdCounter}.png`,
            expiresInSeconds: 3600,
            file: {
              id: fileIdCounter,
              sessionId: 1,
              filename: 'uploaded.png',
              mimeType: 'image/png',
              sizeBytes: 102400,
              createdAt: new Date().toISOString(),
            },
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);
