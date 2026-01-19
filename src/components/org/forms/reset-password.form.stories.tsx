import { ResetPasswordForm } from '@components/org/forms/reset-password.form';
import type { useResetPasswordMutationType } from '@services/users/reset-password.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

interface ResetPasswordBody {
  email: string;
}

// Helper to create mock mutation with success response
function createSuccessMutation(
  handler: (body: ResetPasswordBody) => Promise<unknown>,
): useResetPasswordMutationType {
  return {
    mutate: (
      variables: { body: ResetPasswordBody },
      options?: { onSuccess?: (data: unknown) => void; onError?: () => void },
    ) => {
      handler(variables.body)
        .then((result) => options?.onSuccess?.(result))
        .catch(() => options?.onError?.());
    },
    error: null,
  } as unknown as useResetPasswordMutationType;
}

// Helper to create mock mutation with error response
function createErrorMutation(
  handler: (body: ResetPasswordBody) => Promise<never>,
): useResetPasswordMutationType {
  return {
    mutate: (
      variables: { body: ResetPasswordBody },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      handler(variables.body).catch((error) => options?.onError?.(error));
    },
    error: null,
  } as unknown as useResetPasswordMutationType;
}

// Mock handlers for Storybook
const mockHandleResetSuccess = async (body: ResetPasswordBody) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log('Reset password request:', body);
  return { responseData: [] };
};

const mockHandleResetEmailNotFound = async (
  body: ResetPasswordBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Reset password request with email not found:', body);
  const error = new Error('Email not found');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'No account found with this email address. Please check your email and try again.',
      ],
    },
  });
  throw error;
};

const mockHandleResetRateLimited = async (
  body: ResetPasswordBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Reset password request with rate limit:', body);
  const error = new Error('Rate limited');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'Too many reset attempts. Please wait 15 minutes before trying again.',
      ],
    },
  });
  throw error;
};

const mockHandleSuccess = () => {
  console.log('Reset email sent successfully!');
};

const meta = {
  title: 'Forms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Password reset form that allows users to request a password reset email.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    resetPasswordMutation: createSuccessMutation(mockHandleResetSuccess),
    handleSuccess: mockHandleSuccess,
  },
};

export const EmailNotFound: Story = {
  args: {
    resetPasswordMutation: createErrorMutation(mockHandleResetEmailNotFound),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password reset form showing error when email is not found in the system.',
      },
    },
  },
};

export const RateLimited: Story = {
  args: {
    resetPasswordMutation: createErrorMutation(mockHandleResetRateLimited),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password reset form showing rate limiting error when too many requests are made.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    resetPasswordMutation: {
      mutate: (
        variables: { body: ResetPasswordBody },
        options?: {
          onSuccess?: (data: unknown) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        const body = variables.body;

        setTimeout(async () => {
          try {
            if (body.email === 'notfound@example.com') {
              await mockHandleResetEmailNotFound(body);
              return;
            }

            if (body.email === 'ratelimit@example.com') {
              await mockHandleResetRateLimited(body);
              return;
            }

            const result = await mockHandleResetSuccess(body);
            options?.onSuccess?.(result);
          } catch (error) {
            options?.onError?.(error as Error);
          }
        }, 0);
      },
      error: null,
    } as unknown as useResetPasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive password reset form with different behaviors:
        - "notfound@example.com" will show email not found error
        - "ratelimit@example.com" will show rate limit error
        - Invalid email format will show validation error
        - Other valid emails will succeed`,
      },
    },
  },
};
