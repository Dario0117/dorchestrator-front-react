import { UpdatePasswordForm } from '@components/org/forms/update-password.form';
import type { useUpdatePasswordMutationType } from '@services/users/update-password.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

interface UpdatePasswordBody {
  password: string;
  confirm: string;
}

// Helper to create mock mutation with success response
function createSuccessMutation(
  handler: (body: UpdatePasswordBody) => Promise<unknown>,
): useUpdatePasswordMutationType {
  return {
    mutate: (
      variables: { body: UpdatePasswordBody },
      options?: { onSuccess?: (data: unknown) => void; onError?: () => void },
    ) => {
      handler(variables.body)
        .then((result) => options?.onSuccess?.(result))
        .catch(() => options?.onError?.());
    },
    error: null,
  } as unknown as useUpdatePasswordMutationType;
}

// Helper to create mock mutation with error response
function createErrorMutation(
  handler: (body: UpdatePasswordBody) => Promise<never>,
): useUpdatePasswordMutationType {
  return {
    mutate: (
      variables: { body: UpdatePasswordBody },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      handler(variables.body).catch((error) => options?.onError?.(error));
    },
    error: null,
  } as unknown as useUpdatePasswordMutationType;
}

// Mock handlers for Storybook
const mockHandleUpdateSuccess = async (body: UpdatePasswordBody) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request:', body);
  return { responseData: ['Password updated successfully'] };
};

const mockHandleUpdateError = async (
  body: UpdatePasswordBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request with error:', body);
  const error = new Error('Invalid token or expired link');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'This password reset link is invalid or has expired. Please request a new one.',
      ],
    },
  });
  throw error;
};

const mockHandleUpdateWeakPassword = async (
  body: UpdatePasswordBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request with weak password:', body);
  const error = new Error('Weak password');
  Object.assign(error, {
    responseErrors: {
      password: [
        'Password is too weak. Please include uppercase, lowercase, numbers, and special characters.',
      ],
    },
  });
  throw error;
};

const mockHandleSuccess = () => {
  console.log('Password updated successfully!');
};

const meta = {
  title: 'Forms/UpdatePasswordForm',
  component: UpdatePasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Password update form for users who are resetting their password via email link.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UpdatePasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    updatePasswordMutation: createSuccessMutation(mockHandleUpdateSuccess),
    handleSuccess: mockHandleSuccess,
  },
};

export const InvalidToken: Story = {
  args: {
    updatePasswordMutation: createErrorMutation(mockHandleUpdateError),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password update form showing error when reset token is invalid or expired.',
      },
    },
  },
};

export const WeakPassword: Story = {
  args: {
    updatePasswordMutation: createErrorMutation(mockHandleUpdateWeakPassword),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password update form showing error when password does not meet security requirements.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    updatePasswordMutation: {
      mutate: (
        variables: { body: UpdatePasswordBody },
        options?: {
          onSuccess?: (data: unknown) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        const body = variables.body;

        setTimeout(async () => {
          try {
            if (body.password === 'weak') {
              await mockHandleUpdateWeakPassword(body);
              return;
            }

            if (body.password === 'invalid-token') {
              await mockHandleUpdateError(body);
              return;
            }

            const result = await mockHandleUpdateSuccess(body);
            options?.onSuccess?.(result);
          } catch (error) {
            options?.onError?.(error as Error);
          }
        }, 0);
      },
      error: null,
    } as unknown as useUpdatePasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive password update form with different behaviors:
        - "weak" as password will show weak password error
        - "invalid-token" as password will show invalid token error
        - Mismatched passwords will show validation error
        - Other valid passwords will succeed`,
      },
    },
  },
};
